import type { ChatRequest, ChatResponse, ApiError } from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ChatApiError extends Error {
  statusCode: number;
  errorType: string;

  constructor(statusCode: number, message: string, errorType: string) {
    super(message);
    this.name = 'ChatApiError';
    this.statusCode = statusCode;
    this.errorType = errorType;
  }
}

export async function sendMessage(message: string): Promise<ChatResponse> {
  const request: ChatRequest = { message };

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      statusCode: response.status,
      message: 'An unexpected error occurred',
      error: 'Error',
    }));

    throw new ChatApiError(
      errorData.statusCode || response.status,
      errorData.message,
      errorData.error
    );
  }

  return response.json();
}
