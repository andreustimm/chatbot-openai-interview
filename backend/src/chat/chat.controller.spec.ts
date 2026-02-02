import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ThrottlerModule } from '@nestjs/throttler';

describe('ChatController', () => {
  let controller: ChatController;

  const mockChatService = {
    processMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])],
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat', () => {
    it('should return a reply for a valid message', async () => {
      const mockReply = {
        reply: 'Feijoada is a traditional Brazilian stew...',
      };
      mockChatService.processMessage.mockResolvedValue(mockReply);

      const result = await controller.chat({ message: 'What is feijoada?' });

      expect(result).toEqual(mockReply);
      expect(mockChatService.processMessage).toHaveBeenCalledWith({
        message: 'What is feijoada?',
      });
    });

    it('should handle Brazilian cuisine questions', async () => {
      const mockReply = { reply: 'Para fazer uma caipirinha tradicional...' };
      mockChatService.processMessage.mockResolvedValue(mockReply);

      const result = await controller.chat({
        message: 'Como fazer caipirinha?',
      });

      expect(result).toEqual(mockReply);
      expect(mockChatService.processMessage).toHaveBeenCalledWith({
        message: 'Como fazer caipirinha?',
      });
    });
  });
});
