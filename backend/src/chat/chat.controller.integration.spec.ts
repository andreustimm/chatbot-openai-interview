import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import type { App } from 'supertest/types';
import { ChatModule } from './chat.module';
import { LlmService } from '../llm/llm.service';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// Helper to get typed HTTP server for supertest
function getServer(application: INestApplication): App {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return application.getHttpServer();
}

describe('ChatController (Integration)', () => {
  let app: INestApplication;
  const mockLlmService = {
    generateResponse: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // Use a high limit for most tests
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        ChatModule,
      ],
    })
      .overrideProvider(LlmService)
      .useValue(mockLlmService)
      .compile();

    app = moduleFixture.createNestApplication();

    // Silence NestJS logger during tests
    app.useLogger(false);

    app.enableCors({
      origin: ['http://localhost:8080', 'http://localhost:5173'],
      methods: ['POST', 'GET', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /chat', () => {
    it('returns 200 with valid message', async () => {
      const expectedReply =
        'Feijoada is a traditional Brazilian black bean stew.';
      mockLlmService.generateResponse.mockResolvedValue(expectedReply);

      const response = await request(getServer(app))
        .post('/chat')
        .send({ message: 'What is feijoada?' })
        .expect(201);

      expect(response.body).toEqual({ reply: expectedReply });
      expect(mockLlmService.generateResponse).toHaveBeenCalledWith(
        'What is feijoada?',
      );
    });

    it('returns 400 with empty message', async () => {
      const response = await request(getServer(app))
        .post('/chat')
        .send({ message: '' })
        .expect(400);

      expect((response.body as ErrorResponse).message).toContain(
        'Message cannot be empty',
      );
    });

    it('returns 400 without body', async () => {
      const response = await request(getServer(app))
        .post('/chat')
        .send({})
        .expect(400);

      expect((response.body as ErrorResponse).statusCode).toBe(400);
    });

    it('returns 400 without message field', async () => {
      const response = await request(getServer(app))
        .post('/chat')
        .send({ text: 'Hello' })
        .expect(400);

      expect((response.body as ErrorResponse).statusCode).toBe(400);
      expect((response.body as ErrorResponse).message).toContain(
        'property text should not exist',
      );
    });

    it('returns 400 for non-string message', async () => {
      const response = await request(getServer(app))
        .post('/chat')
        .send({ message: 123 })
        .expect(400);

      expect((response.body as ErrorResponse).statusCode).toBe(400);
    });

    it('accepts Content-Type application/json', async () => {
      mockLlmService.generateResponse.mockResolvedValue('Test response');

      await request(getServer(app))
        .post('/chat')
        .set('Content-Type', 'application/json')
        .send({ message: 'Test' })
        .expect(201);
    });

    it('handles LLM service errors gracefully', async () => {
      mockLlmService.generateResponse.mockRejectedValue(
        new Error('OpenAI API error'),
      );

      const response = await request(getServer(app))
        .post('/chat')
        .send({ message: 'What is feijoada?' })
        .expect(500);

      expect((response.body as ErrorResponse).statusCode).toBe(500);
    });

    it('handles long messages within limit', async () => {
      const longMessage = 'a'.repeat(2000);
      mockLlmService.generateResponse.mockResolvedValue('Response');

      await request(getServer(app))
        .post('/chat')
        .send({ message: longMessage })
        .expect(201);
    });

    it('rejects messages exceeding max length', async () => {
      const tooLongMessage = 'a'.repeat(2001);

      const response = await request(getServer(app))
        .post('/chat')
        .send({ message: tooLongMessage })
        .expect(400);

      expect((response.body as ErrorResponse).statusCode).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    let rateLimitApp: INestApplication;

    beforeAll(async () => {
      // Create a separate app with low rate limit for testing
      const moduleFixture = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true }),
          ThrottlerModule.forRoot([{ ttl: 60000, limit: 3 }]),
          ChatModule,
        ],
      })
        .overrideProvider(LlmService)
        .useValue(mockLlmService)
        .compile();

      rateLimitApp = moduleFixture.createNestApplication();
      rateLimitApp.useLogger(false);
      rateLimitApp.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await rateLimitApp.init();
    });

    afterAll(async () => {
      await rateLimitApp.close();
    });

    it('returns 429 after exceeding rate limit', async () => {
      mockLlmService.generateResponse.mockResolvedValue('Response');

      // Make requests up to the limit (3)
      for (let i = 0; i < 3; i++) {
        await request(getServer(rateLimitApp))
          .post('/chat')
          .send({ message: `Request ${i}` });
      }

      // Next request should be rate limited
      const response = await request(getServer(rateLimitApp))
        .post('/chat')
        .send({ message: 'One more request' })
        .expect(429);

      expect((response.body as ErrorResponse).statusCode).toBe(429);
    });
  });

  describe('HTTP Methods', () => {
    it('rejects GET request to /chat', async () => {
      await request(getServer(app)).get('/chat').expect(404);
    });

    it('rejects PUT request to /chat', async () => {
      await request(getServer(app))
        .put('/chat')
        .send({ message: 'Test' })
        .expect(404);
    });

    it('rejects DELETE request to /chat', async () => {
      await request(getServer(app)).delete('/chat').expect(404);
    });
  });
});
