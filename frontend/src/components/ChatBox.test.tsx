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

  it('displays fallback error message when API error has no message', async () => {
    const user = userEvent.setup();
    vi.mocked(api.sendMessage).mockRejectedValue(
      new api.ChatApiError(500, '', 'Internal Server Error')
    );

    render(<ChatBox />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'Test');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
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

  it('displays validation error message for 400 errors', async () => {
    const user = userEvent.setup();
    vi.mocked(api.sendMessage).mockRejectedValue(
      new api.ChatApiError(400, 'Message is required', 'Bad Request')
    );

    render(<ChatBox />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'Test');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });
  });

  it('displays network error for non-API errors', async () => {
    const user = userEvent.setup();
    vi.mocked(api.sendMessage).mockRejectedValue(new Error('Network failure'));

    render(<ChatBox />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'Test');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it('uses fallback ID generator when crypto.randomUUID is unavailable', async () => {
    const user = userEvent.setup();
    const originalRandomUUID = crypto.randomUUID;
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      throw new Error('Not available in insecure context');
    });

    vi.mocked(api.sendMessage).mockResolvedValue({ reply: 'Response' });

    render(<ChatBox />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'Test message');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByText('Test message')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument();
    });

    crypto.randomUUID = originalRandomUUID;
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

  describe('responsive layout', () => {
    it('has responsive width classes on main container', () => {
      const { container } = render(<ChatBox />);
      const mainContainer = container.querySelector('.flex.flex-col.h-screen');
      expect(mainContainer).toHaveClass('w-full');
      expect(mainContainer).toHaveClass('md:max-w-2xl');
    });

    it('has responsive shadow classes on main container', () => {
      const { container } = render(<ChatBox />);
      const mainContainer = container.querySelector('.flex.flex-col.h-screen');
      expect(mainContainer).toHaveClass('md:shadow-lg');
      expect(mainContainer).not.toHaveClass('shadow-lg');
    });

    it('has responsive text size on header', () => {
      render(<ChatBox />);
      const header = screen.getByRole('heading', { name: 'Brazilian Cuisine Assistant' });
      expect(header).toHaveClass('text-lg');
      expect(header).toHaveClass('md:text-xl');
    });
  });
});
