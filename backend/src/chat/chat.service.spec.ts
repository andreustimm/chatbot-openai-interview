import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { LlmService } from '../llm/llm.service';

describe('ChatService', () => {
  let service: ChatService;

  const mockLlmService = {
    generateResponse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: LlmService,
          useValue: mockLlmService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processMessage', () => {
    it('should return a reply from the LLM service', async () => {
      const mockReply =
        'Feijoada is a traditional Brazilian black bean stew with pork...';
      mockLlmService.generateResponse.mockResolvedValue(mockReply);

      const result = await service.processMessage({
        message: 'What is feijoada?',
      });

      expect(result).toEqual({ reply: mockReply });
      expect(mockLlmService.generateResponse).toHaveBeenCalledWith(
        'What is feijoada?',
      );
    });

    it('should pass the message to LLM service and wrap response', async () => {
      const userMessage = 'Como fazer pão de queijo?';
      const llmResponse =
        'Para fazer pão de queijo você vai precisar de polvilho azedo...';
      mockLlmService.generateResponse.mockResolvedValue(llmResponse);

      const result = await service.processMessage({ message: userMessage });

      expect(result).toEqual({ reply: llmResponse });
      expect(mockLlmService.generateResponse).toHaveBeenCalledWith(userMessage);
    });

    it('should propagate errors from LLM service', async () => {
      const error = new Error('API Error');
      mockLlmService.generateResponse.mockRejectedValue(error);

      await expect(service.processMessage({ message: 'test' })).rejects.toThrow(
        error,
      );
    });
  });
});
