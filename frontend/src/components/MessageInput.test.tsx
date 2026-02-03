import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from './MessageInput';

describe('MessageInput', () => {
  it('calls onSend when clicking the send button', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} disabled={false} />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('calls onSend when pressing Enter', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} disabled={false} />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'Hello{Enter}');

    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('does not call onSend when pressing Shift+Enter', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} disabled={false} />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'Hello{Shift>}{Enter}{/Shift}');

    expect(onSend).not.toHaveBeenCalled();
  });

  it('disables input and button when disabled prop is true', () => {
    render(<MessageInput onSend={vi.fn()} disabled={true} />);

    expect(screen.getByPlaceholderText('Ask about Brazilian cuisine...')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('disables send button when input is empty', () => {
    render(<MessageInput onSend={vi.fn()} disabled={false} />);

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('enables send button when input has content', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSend={vi.fn()} disabled={false} />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, 'Hello');

    expect(screen.getByRole('button', { name: 'Send' })).not.toBeDisabled();
  });

  it('trims whitespace from messages', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} disabled={false} />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, '  Hello  ');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('does not send whitespace-only messages', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} disabled={false} />);

    const input = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSend).not.toHaveBeenCalled();
  });

  describe('responsive layout', () => {
    it('has responsive padding on container', () => {
      const { container } = render(<MessageInput onSend={vi.fn()} disabled={false} />);
      const inputContainer = container.querySelector('.border-t');
      expect(inputContainer).toHaveClass('p-3');
      expect(inputContainer).toHaveClass('md:p-4');
    });

    it('has touch-friendly button size', () => {
      render(<MessageInput onSend={vi.fn()} disabled={false} />);
      const button = screen.getByRole('button', { name: 'Send' });
      expect(button).toHaveClass('min-w-[44px]');
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('has responsive padding on button', () => {
      render(<MessageInput onSend={vi.fn()} disabled={false} />);
      const button = screen.getByRole('button', { name: 'Send' });
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('md:px-6');
    });

    it('has responsive padding on textarea', () => {
      render(<MessageInput onSend={vi.fn()} disabled={false} />);
      const textarea = screen.getByPlaceholderText('Ask about Brazilian cuisine...');
      expect(textarea).toHaveClass('px-3');
      expect(textarea).toHaveClass('md:px-4');
    });
  });
});
