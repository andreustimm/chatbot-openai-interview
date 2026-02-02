import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatBox } from './ChatBox';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  sendMessage: vi.fn(),
  ChatApiError: class ChatApiError extends Error {
    statusCode: number;
    errorType: string;

    constructor(statusCode: number, message: string, errorType: string) {
      super(message);
      this.name = 'ChatApiError';
      this.statusCode = statusCode;
      this.errorType = errorType;
    }
  },
}));

describe('ChatBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header and welcome message', () => {
    render(<ChatBox />);

    expect(screen.getByText('Brazilian Cuisine Assistant')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Brazilian Cuisine Assistant!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask about Brazilian cuisine...')).toBeInTheDocument();
  });

  it('sends a message and displays the response', async () => {
    const user = userEvent.setup();
    const mockResponse = { reply: 'Feijoada is a traditional Brazilian stew...' };
    vi.mocked(api.sendMessage).mockResolvedValue(mockResponse);

    render(<ChatBox />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'What is feijoada?');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByText('What is feijoada?')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Feijoada is a traditional Brazilian stew...')).toBeInTheDocument();
    });

    expect(api.sendMessage).toHaveBeenCalledWith('What is feijoada?');
  });

  it('displays typing indicator while waiting for response', async () => {
    const user = userEvent.setup();
    vi.mocked(api.sendMessage).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ reply: 'Response' }), 100))
    );

    render(<ChatBox />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    const typingIndicator = document.querySelector('.animate-bounce');
    expect(typingIndicator).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    const user = userEvent.setup();
    vi.mocked(api.sendMessage).mockRejectedValue(
      new api.ChatApiError(500, 'Server error', 'Internal Server Error')
    );

    render(<ChatBox />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'Test');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('displays rate limit error message', async () => {
    const user = userEvent.setup();
    vi.mocked(api.sendMessage).mockRejectedValue(
      new api.ChatApiError(429, 'Too many requests', 'Too Many Requests')
    );

    render(<ChatBox />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'Test');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByText(/Rate limit exceeded/)).toBeInTheDocument();
    });
  });

  it('disables input while sending message', async () => {
    const user = userEvent.setup();
    vi.mocked(api.sendMessage).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ reply: 'Response' }), 100))
    );

    render(<ChatBox />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    await user.type(input, 'Hello');
    await user.click(sendButton);

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();

    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    vi.mocked(api.sendMessage).mockResolvedValue({ reply: 'Response' });

    render(<ChatBox />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...') as HTMLTextAreaElement;
    await user.type(input, 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(input.value).toBe('');
  });

  it('does not send empty messages', async () => {
    const user = userEvent.setup();

    render(<ChatBox />);

    const sendButton = screen.getByRole('button', { name: 'Send' });
    await user.click(sendButton);

    expect(api.sendMessage).not.toHaveBeenCalled();
  });
});
