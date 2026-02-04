import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./components/ChatBox', () => ({
  ChatBox: () => <div data-testid="chat-box">ChatBox Mock</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('contains ChatBox component', () => {
    render(<App />);
    expect(screen.getByTestId('chat-box')).toBeInTheDocument();
  });

  it('has correct layout classes', () => {
    const { container } = render(<App />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
    expect(mainDiv).toHaveClass('bg-gray-100');
  });

  it('renders single root div', () => {
    const { container } = render(<App />);

    expect(container.children.length).toBe(1);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });
});
