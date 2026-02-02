import { useState } from 'react';
import type { Message } from '../types/chat';
import { sendMessage, ChatApiError } from '../services/api';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (content: string) => {
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await sendMessage(content);

      const botMessage: Message = {
        id: crypto.randomUUID(),
        content: response.reply,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      if (err instanceof ChatApiError) {
        if (err.statusCode === 429) {
          setError('Rate limit exceeded. Please wait a moment before sending another message.');
        } else if (err.statusCode === 400) {
          setError(err.message);
        } else {
          setError(err.message || 'An error occurred. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-lg">
      <header className="bg-green-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Brazilian Cuisine Assistant</h1>
        <p className="text-sm text-green-100">Ask me about Brazilian food!</p>
      </header>

      <MessageList messages={messages} isTyping={isTyping} />

      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <MessageInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}
