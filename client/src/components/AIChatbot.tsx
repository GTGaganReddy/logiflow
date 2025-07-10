import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  customerLoad: any;
  assistantId?: string;
}

export default function AIChatbot({ isOpen, onClose, customerLoad, assistantId }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation with context about the customer load
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `Hello! I'm here to help explain the AI algorithm assignment for ${customerLoad.customerName}. 

The AI has suggested assigning resource "${customerLoad.aiSuggestionResource}" based on:
- Customer: ${customerLoad.customerName}
- Priority: ${customerLoad.priority}
- Delivery window: ${customerLoad.deliveryStartDate} to ${customerLoad.deliveryEndDate}

What would you like to know about this assignment?`,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, customerLoad]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const currentMessage = inputMessage; // Store the current message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Custom AI response logic
      let assistantResponse = '';
      
      // Check if user is asking about "why" and provide the custom explanation
      if (currentMessage.toLowerCase().includes('why')) {
        assistantResponse = `Based on the AI algorithm analysis and coordinator feedback:

**Original Assignment:**
The resource was initially assigned to Villach GmbH based on standard logistics parameters.

**AI Suggestion & Priority Change:**
After AI analysis, ${customerLoad.customerName} has been identified as **high priority** and requires immediate resource allocation.

**Resource Reallocation:**
The system will automatically reassign the resource from Villach GmbH to ${customerLoad.customerName} due to the priority escalation. Villach GmbH will be assigned another available resource very soon.

**Coordinator Feedback:**
This reallocation strategy was validated by coordinator Johan 2 weeks ago and has proven effective for high-priority deliveries.

**Next Steps:**
✓ Resource transfer to ${customerLoad.customerName} 
✓ Alternative resource assignment for Villach GmbH
✓ Updated delivery schedules for both customers`;
      } else if (currentMessage.toLowerCase().includes('resource') || currentMessage.toLowerCase().includes('assignment')) {
        assistantResponse = `The AI algorithm considers multiple factors for resource assignment:

**Priority Level:** ${customerLoad.priority}
**Customer:** ${customerLoad.customerName}
**Delivery Window:** ${customerLoad.deliveryStartDate} to ${customerLoad.deliveryEndDate}
**Suggested Resource:** ${customerLoad.aiSuggestionResource}

The system optimizes assignments based on delivery urgency, route efficiency, and resource availability. High-priority customers like ${customerLoad.customerName} receive preferential resource allocation.`;
      } else if (currentMessage.toLowerCase().includes('hello') || currentMessage.toLowerCase().includes('hi')) {
        assistantResponse = `Hello! I'm your AI logistics assistant. I can explain the resource assignment for ${customerLoad.customerName}.

Some questions I can help with:
• Why was this resource assigned?
• How does the priority system work?
• What factors influence the AI suggestions?
• Resource reallocation process

Feel free to ask me anything about this assignment!`;
      } else {
        assistantResponse = `I understand you're asking about the logistics assignment for ${customerLoad.customerName}.

**Current Status:**
- Customer: ${customerLoad.customerName}
- Priority: ${customerLoad.priority}
- Suggested Resource: ${customerLoad.aiSuggestionResource}
- Delivery Period: ${customerLoad.deliveryStartDate} to ${customerLoad.deliveryEndDate}

The AI algorithm optimizes assignments based on priority, delivery windows, and resource availability. High-priority customers receive preferential treatment in the allocation process.

Would you like me to explain why this specific resource was chosen or how the priority system works?`;
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Assignment Explanation
            <Badge variant="outline" className="ml-2">
              {customerLoad.customerName}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {message.role === 'user' ? (
                        <User className="h-6 w-6 text-gray-600" />
                      ) : (
                        <Bot className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex gap-2">
                    <Bot className="h-6 w-6 text-blue-600" />
                    <div className="bg-gray-100 rounded-lg p-3 text-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about this AI assignment..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}