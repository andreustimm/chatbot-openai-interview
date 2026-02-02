import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { LlmService } from './llm.service';

const mockCreate = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

describe('LlmService', () => {
  let service: LlmService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        OPENAI_API_KEY: 'test-api-key',
        OPENAI_MODEL: 'gpt-3.5-turbo',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    mockCreate.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateResponse', () => {
    it('should return a response from OpenAI', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Feijoada is the national dish of Brazil...',
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await service.generateResponse('What is feijoada?');

      expect(result).toBe('Feijoada is the national dish of Brazil...');
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({
              role: 'user',
              content: 'What is feijoada?',
            }),
          ]) as unknown[],
        }),
      );
    });

    it('should include system prompt about Brazilian cuisine', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test response' } }],
      };
      mockCreate.mockResolvedValue(mockResponse);

      await service.generateResponse('test');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('Brazilian cuisine') as string,
            }),
          ]) as unknown[],
        }),
      );
    });

    it('should throw ServiceUnavailableException on API error', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      await expect(service.generateResponse('test')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should return fallback message when response is empty', async () => {
      const mockResponse = {
        choices: [{ message: { content: null } }],
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await service.generateResponse('test');

      expect(result).toBe('I apologize, but I could not generate a response.');
    });
  });
});
