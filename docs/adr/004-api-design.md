# ADR 004: API Design

## Status
Accepted

## Context
We need to define the REST API contract between the frontend and backend for the chat functionality. The API should be simple, well-documented, and handle errors gracefully.

## Decision

### Base URL
```
http://localhost:3000
```

### Endpoints

#### POST /chat

Send a message and receive an AI-generated response about Brazilian cuisine.

**Request**
```http
POST /chat
Content-Type: application/json

{
  "message": "Como fazer uma feijoada tradicional?"
}
```

**Request Schema**
```typescript
interface ChatRequestDto {
  message: string; // Required, non-empty, max 2000 characters
}
```

**Successful Response (200 OK)**
```json
{
  "reply": "A feijoada tradicional é o prato mais emblemático do Brasil..."
}
```

**Response Schema**
```typescript
interface ChatResponseDto {
  reply: string;
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "statusCode": 400,
  "message": "Message cannot be empty",
  "error": "Bad Request"
}
```

#### 429 Too Many Requests - Rate Limited
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Please wait before sending another message.",
  "error": "Too Many Requests"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "An error occurred while processing your request",
  "error": "Internal Server Error"
}
```

#### 503 Service Unavailable - LLM Error
```json
{
  "statusCode": 503,
  "message": "AI service temporarily unavailable. Please try again.",
  "error": "Service Unavailable"
}
```

### Rate Limiting

- **Limit**: 5 requests per minute per IP address
- **Headers Returned**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

### CORS Configuration

```typescript
{
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}
```

## Consequences

### Positive
- Simple, single-endpoint API
- Clear error responses with status codes
- Rate limiting prevents abuse
- CORS configured for local development

### Negative
- No authentication (acceptable for demo)
- No conversation history tracking
- Single language response format

### Future Considerations
- Add `/health` endpoint for monitoring
- Add conversation ID for multi-turn support
- Add streaming responses for better UX

## Implementation Notes

### Validation
Using `class-validator` decorators:
```typescript
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @MaxLength(2000)
  message: string;
}
```

### Rate Limiting
Using `@nestjs/throttler`:
```typescript
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60000 } })
```
