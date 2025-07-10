import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CreateThreadParams {
  customerLoad: any;
  assistantId: string;
}

interface SendMessageParams {
  threadId: string;
  message: string;
  assistantId: string;
}

export async function createThread({ customerLoad, assistantId }: CreateThreadParams) {
  try {
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `I need help understanding an AI algorithm assignment for logistics. Here's the context:
          
Customer: ${customerLoad.customerName}
Priority: ${customerLoad.priority}
Delivery Start: ${customerLoad.deliveryStartDate} ${customerLoad.deliveryStartTime}
Delivery End: ${customerLoad.deliveryEndDate} ${customerLoad.deliveryEndTime}
AI Suggested Resource: ${customerLoad.aiSuggestionResource}
Current Status: ${customerLoad.deliveryStatus}

Please help me understand why this particular resource was recommended and what factors the AI algorithm considered.`
        }
      ]
    });

    return { threadId: thread.id };
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error('Failed to create AI thread');
  }
}

export async function sendMessage({ threadId, message, assistantId }: SendMessageParams) {
  try {
    console.log('SendMessage params:', { threadId, message: message?.substring(0, 50), assistantId });
    
    if (!threadId) {
      throw new Error('Thread ID is required');
    }
    if (!assistantId) {
      throw new Error('Assistant ID is required');
    }
    if (!message) {
      throw new Error('Message is required');
    }

    // Check if there are any active runs for this thread
    const runs = await openai.beta.threads.runs.list(threadId);
    const activeRun = runs.data.find(run => run.status === 'in_progress' || run.status === 'queued');
    
    if (activeRun) {
      console.log('Found active run, waiting for completion:', activeRun.id);
      // Wait for the active run to complete
      let runStatus = await openai.beta.threads.runs.retrieve({
        thread_id: threadId,
        run_id: activeRun.id
      });
      let attempts = 0;
      const maxAttempts = 20;
      
      while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve({
          thread_id: threadId,
          run_id: activeRun.id
        });
        attempts++;
        console.log(`Waiting for active run completion: ${runStatus.status}, attempt ${attempts}`);
      }
    }

    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      instructions: `You are an AI logistics assistant helping users understand algorithm-based resource assignments. 
      
Be helpful and explain in simple terms:
- Why specific resources were chosen
- What factors the algorithm considers (delivery time, location, capacity, priority)
- How the assignment optimizes logistics operations
- Any trade-offs or alternatives

Keep explanations clear and practical for logistics coordinators.`
    });

    console.log('Created run:', run.id, 'for thread:', threadId);

    // Wait for completion with timeout
    console.log('Before retrieve - threadId:', threadId, 'run.id:', run.id);
    let runStatus = await openai.beta.threads.runs.retrieve({
      thread_id: threadId,
      run_id: run.id
    });
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Before loop retrieve - threadId:', threadId, 'run.id:', run.id);
      runStatus = await openai.beta.threads.runs.retrieve({
        thread_id: threadId,
        run_id: run.id
      });
      attempts++;
      console.log(`Run status: ${runStatus.status}, attempt ${attempts}`);
    }

    if (runStatus.status === 'completed') {
      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessage = messages.data[0];
      
      if (lastMessage.role === 'assistant' && lastMessage.content[0].type === 'text') {
        return { response: lastMessage.content[0].text.value };
      }
    }

    console.error('Run failed or timed out:', runStatus);
    throw new Error(`Assistant run failed with status: ${runStatus.status}`);
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message to AI assistant');
  }
}

export async function createAssistant() {
  try {
    const assistant = await openai.beta.assistants.create({
      name: "Logistics AI Assistant",
      instructions: `You are a helpful logistics AI assistant specializing in explaining algorithm-based resource assignments.
      
Your role is to help logistics coordinators understand:
- Why the AI algorithm chose specific truck resources
- What factors influence assignment decisions (timing, location, capacity, priority)
- How assignments optimize overall logistics operations
- Alternative options and trade-offs

Always provide clear, practical explanations that help users make informed decisions about accepting or modifying AI suggestions.`,
      model: "gpt-4o",
      tools: []
    });

    return assistant;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw new Error('Failed to create AI assistant');
  }
}