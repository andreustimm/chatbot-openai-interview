import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendMessage, ChatApiError } from './api';

describe('api service', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendMessage', () => {
    it('returns response correctly on success', async () => {
      const mockResponse = { reply: 'Feijoada is a traditional Brazilian dish.' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await sendMessage('What is feijoada?');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'What is feijoada?' }),
      });
    });

    it('sends correct Content-Type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reply: 'test' }),
      });

      await sendMessage('test');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('throws ChatApiError on HTTP error with JSON response', async () => {
      const errorResponse = {
        statusCode: 400,
        message: 'Message cannot be empty',
        error: 'Bad Request',
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse),
      });

      try {
        await sendMessage('');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ChatApiError);
        expect((error as ChatApiError).statusCode).toBe(400);
        expect((error as ChatApiError).message).toBe('Message cannot be empty');
        expect((error as ChatApiError).errorType).toBe('Bad Request');
      }
    });

    it('throws ChatApiError with correct properties for rate limiting', async () => {
      const errorResponse = {
        statusCode: 429,
        message: 'Too Many Requests',
        error: 'ThrottlerException',
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve(errorResponse),
      });

      try {
        await sendMessage('test');
      } catch (error) {
        expect(error).toBeInstanceOf(ChatApiError);
        expect((error as ChatApiError).statusCode).toBe(429);
        expect((error as ChatApiError).errorType).toBe('ThrottlerException');
      }
    });

    it('handles non-JSON error response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      try {
        await sendMessage('test');
      } catch (error) {
        expect(error).toBeInstanceOf(ChatApiError);
        expect((error as ChatApiError).statusCode).toBe(500);
        expect((error as ChatApiError).message).toBe('An unexpected error occurred');
      }
    });

    it('throws on network error (fetch failure)', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(sendMessage('test')).rejects.toThrow('Failed to fetch');
    });

    it('uses fallback statusCode from response when not in error body', async () => {
      const errorResponse = {
        message: 'Internal Server Error',
        error: 'Error',
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve(errorResponse),
      });

      try {
        await sendMessage('test');
      } catch (error) {
        expect(error).toBeInstanceOf(ChatApiError);
        expect((error as ChatApiError).statusCode).toBe(503);
      }
    });
  });

  describe('ChatApiError', () => {
    it('has correct name property', () => {
      const error = new ChatApiError(400, 'Test error', 'BadRequest');
      expect(error.name).toBe('ChatApiError');
    });

    it('extends Error class', () => {
      const error = new ChatApiError(500, 'Server error', 'InternalError');
      expect(error).toBeInstanceOf(Error);
    });

    it('stores statusCode, message, and errorType', () => {
      const error = new ChatApiError(404, 'Not found', 'NotFoundError');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.errorType).toBe('NotFoundError');
    });
  });
});
