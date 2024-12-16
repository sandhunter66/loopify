import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! I can help you with your loyalty stamp card. Ask me anything!',
      isBot: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      isBot: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(input.toLowerCase()),
        isBot: true,
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    if (input.includes('stamps') && (input.includes('how') || input.includes('many'))) {
      return 'You currently have X stamps collected out of 12. Keep going!';
    }
    if (input.includes('how') && input.includes('earn')) {
      return 'You can earn stamps by making purchases at the Kemaman Car Boot Sale. Each purchase of RM50 or more earns you one stamp!';
    }
    if (input.includes('reward') || input.includes('prize')) {
      return 'Collect all 12 stamps to earn a Lucky Draw Entry! You could win amazing prizes!';
    }
    return 'I\'m here to help! You can ask me about your stamps, how to earn them, or about the rewards.';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center
          shadow-lg hover:bg-blue-700 transition-colors"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl
          border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white">
            <h3 className="font-medium">Loyalty Card Assistant</h3>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}