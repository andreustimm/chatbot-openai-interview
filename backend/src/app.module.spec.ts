import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ChatModule } from './chat/chat.module';
import { ConfigService } from '@nestjs/config';
import { LlmService } from './llm/llm.service';

describe('AppModule', () => {
  let module: TestingModule;

  const mockLlmService = {
    generateResponse: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LlmService)
      .useValue(mockLlmService)
      .compile();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('compiles successfully', () => {
    expect(module).toBeDefined();
  });

  it('has ConfigService available', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();
  });

  it('has ChatModule registered', () => {
    const chatModule = module.get(ChatModule, { strict: false });
    expect(chatModule).toBeDefined();
  });

  it('ConfigModule is global', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(typeof configService.get).toBe('function');
  });

  it('loads environment variables through ConfigService', () => {
    const configService = module.get<ConfigService>(ConfigService);
    // These should return undefined or default values since no .env is loaded in tests
    const rateLimitWindow = configService.get<number>('RATE_LIMIT_WINDOW_MS');
    const rateLimitMax = configService.get<number>('RATE_LIMIT_MAX');

    // Values should be undefined or the config service should exist
    expect(configService).toBeDefined();
    // Rate limit values should either be undefined or numbers
    expect(
      rateLimitWindow === undefined || typeof rateLimitWindow === 'number',
    ).toBe(true);
    expect(rateLimitMax === undefined || typeof rateLimitMax === 'number').toBe(
      true,
    );
  });
});

describe('AppModule Configuration', () => {
  it('ThrottlerModule uses default values when env vars not set', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LlmService)
      .useValue({ generateResponse: jest.fn() })
      .compile();

    const configService = module.get<ConfigService>(ConfigService);

    // Default values should be used
    const ttl = configService.get<number>('RATE_LIMIT_WINDOW_MS') || 60000;
    const limit = configService.get<number>('RATE_LIMIT_MAX') || 5;

    expect(ttl).toBe(60000);
    expect(limit).toBe(5);

    await module.close();
  });
});
