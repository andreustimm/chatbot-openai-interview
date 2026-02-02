import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Message } from './Message';
import type { Message as MessageType } from '../types/chat';

describe('Message', () => {
  it('renders user message with blue styling on the right', () => {
    const userMessage: MessageType = {
      id: '1',
      content: 'Hello',
      sender: 'user',
      timestamp: new Date('2024-01-01T12:00:00'),
    };

    render(<Message message={userMessage} />);

    const messageContainer = screen.getByText('Hello').closest('div');
    expect(messageContainer).toHaveClass('bg-blue-500');
    expect(messageContainer).toHaveClass('text-white');
  });

  it('renders bot message with gray styling on the left', () => {
    const botMessage: MessageType = {
      id: '2',
      content: 'Hi there!',
      sender: 'bot',
      timestamp: new Date('2024-01-01T12:00:00'),
    };

    render(<Message message={botMessage} />);

    const messageContainer = screen.getByText('Hi there!').closest('div');
    expect(messageContainer).toHaveClass('bg-gray-200');
    expect(messageContainer).toHaveClass('text-gray-800');
  });

  it('displays the message content', () => {
    const message: MessageType = {
      id: '1',
      content: 'Test message content',
      sender: 'user',
      timestamp: new Date(),
    };

    render(<Message message={message} />);

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('displays the timestamp', () => {
    const message: MessageType = {
      id: '1',
      content: 'Test',
      sender: 'user',
      timestamp: new Date('2024-01-01T14:30:00'),
    };

    render(<Message message={message} />);

    expect(screen.getByText(/14:30|2:30/)).toBeInTheDocument();
  });
});
