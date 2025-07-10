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

    // Wait for completion
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    if (runStatus.status === 'completed') {
      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessage = messages.data[0];
      
      if (lastMessage.role === 'assistant' && lastMessage.content[0].type === 'text') {
        return { response: lastMessage.content[0].text.value };
      }
    }

    throw new Error('Assistant run did not complete successfully');
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