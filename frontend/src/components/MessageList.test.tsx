import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageList } from './MessageList';
import type { Message } from '../types/chat';

describe('MessageList', () => {
  const createMessage = (overrides: Partial<Message> = {}): Message => ({
    id: '1',
    content: 'Test message',
    sender: 'user',
    timestamp: new Date('2024-01-15T10:00:00'),
    ...overrides,
  });

  describe('welcome message', () => {
    it('renders welcome message when list is empty and not typing', () => {
      render(<MessageList messages={[]} isTyping={false} />);

      expect(screen.getByText('Welcome to Brazilian Cuisine Assistant!')).toBeInTheDocument();
      expect(screen.getByText('Ask me anything about Brazilian food, recipes, or cooking techniques.')).toBeInTheDocument();
      expect(screen.getByText('Try: "Como fazer uma feijoada tradicional?"')).toBeInTheDocument();
    });

    it('does not render welcome message when messages exist', () => {
      const messages = [createMessage()];
      render(<MessageList messages={messages} isTyping={false} />);

      expect(screen.queryByText('Welcome to Brazilian Cuisine Assistant!')).not.toBeInTheDocument();
    });

    it('does not render welcome message when typing', () => {
      render(<MessageList messages={[]} isTyping={true} />);

      expect(screen.queryByText('Welcome to Brazilian Cuisine Assistant!')).not.toBeInTheDocument();
    });
  });

  describe('message rendering', () => {
    it('renders a single message', () => {
      const messages = [createMessage({ content: 'Hello, what is feijoada?' })];
      render(<MessageList messages={messages} isTyping={false} />);

      expect(screen.getByText('Hello, what is feijoada?')).toBeInTheDocument();
    });

    it('renders multiple messages', () => {
      const messages = [
        createMessage({ id: '1', content: 'First message', sender: 'user' }),
        createMessage({ id: '2', content: 'Second message', sender: 'bot' }),
        createMessage({ id: '3', content: 'Third message', sender: 'user' }),
      ];
      render(<MessageList messages={messages} isTyping={false} />);

      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
      expect(screen.getByText('Third message')).toBeInTheDocument();
    });

    it('renders messages with unique keys', () => {
      const messages = [
        createMessage({ id: 'unique-id-1', content: 'Message 1' }),
        createMessage({ id: 'unique-id-2', content: 'Message 2' }),
      ];
      render(<MessageList messages={messages} isTyping={false} />);

      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
    });
  });

  describe('typing indicator', () => {
    it('shows typing indicator when isTyping is true', () => {
      render(<MessageList messages={[]} isTyping={true} />);

      const bouncingDots = document.querySelectorAll('.animate-bounce');
      expect(bouncingDots.length).toBe(3);
    });

    it('does not show typing indicator when isTyping is false', () => {
      render(<MessageList messages={[]} isTyping={false} />);

      const bouncingDots = document.querySelectorAll('.animate-bounce');
      expect(bouncingDots.length).toBe(0);
    });

    it('shows typing indicator along with messages', () => {
      const messages = [createMessage({ content: 'User message' })];
      render(<MessageList messages={messages} isTyping={true} />);

      expect(screen.getByText('User message')).toBeInTheDocument();
      const bouncingDots = document.querySelectorAll('.animate-bounce');
      expect(bouncingDots.length).toBe(3);
    });
  });

  describe('scroll behavior', () => {
    it('calls scrollIntoView when messages change', () => {
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      const { rerender } = render(<MessageList messages={[]} isTyping={false} />);

      const messages = [createMessage()];
      rerender(<MessageList messages={messages} isTyping={false} />);

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('calls scrollIntoView when isTyping changes', () => {
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      const { rerender } = render(<MessageList messages={[]} isTyping={false} />);

      rerender(<MessageList messages={[]} isTyping={true} />);

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('layout', () => {
    it('has scrollable container', () => {
      const { container } = render(<MessageList messages={[]} isTyping={false} />);

      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('has responsive padding', () => {
      const { container } = render(<MessageList messages={[]} isTyping={false} />);

      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toHaveClass('p-3');
      expect(scrollContainer).toHaveClass('md:p-4');
    });

    it('has responsive text size on welcome message', () => {
      render(<MessageList messages={[]} isTyping={false} />);

      const welcomeHeading = screen.getByText('Welcome to Brazilian Cuisine Assistant!');
      expect(welcomeHeading).toHaveClass('text-base');
      expect(welcomeHeading).toHaveClass('md:text-lg');
    });
  });
});
