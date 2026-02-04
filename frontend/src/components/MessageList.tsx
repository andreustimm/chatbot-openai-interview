import { useEffect, useRef } from 'react';
import type { Message as MessageType } from '../types/chat';
import { Message } from './Message';

interface MessageListProps {
  messages: MessageType[];
  isTyping: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4">
      {messages.length === 0 && !isTyping && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-base md:text-lg mb-2">Welcome to Brazilian Cuisine Assistant!</p>
          <p className="text-sm">
            Ask me anything about Brazilian food, recipes, or cooking techniques.
          </p>
          <p className="text-sm mt-2 text-gray-600">
            Try: "Como fazer uma feijoada tradicional?"
          </p>
        </div>
      )}

      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}

      {isTyping && (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
