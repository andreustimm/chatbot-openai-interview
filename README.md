# Brazilian Cuisine Chat Assistant

A chat application powered by OpenAI GPT that answers questions about Brazilian cuisine. Built with NestJS (backend) and React (frontend).

## Features

- Ask questions about traditional Brazilian dishes, regional cuisines, and cooking techniques
- Real-time chat interface with typing indicators
- Rate limiting to prevent abuse
- Polite handling of off-topic questions
- Containerized deployment with Docker

## Prerequisites

- Node.js 18+ (for local development)
- Docker and Docker Compose (for containerized deployment)
- OpenAI API key

## Quick Start with Docker

1. **Clone and configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

## Local Development

### Backend

```bash
cd backend
npm install
npm run start:dev
```

The API will be available at http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at http://localhost:5173

## API Reference

### POST /chat

Send a message and receive a response about Brazilian cuisine.

**Request:**
```json
{
  "message": "Como fazer uma caipirinha?"
}
```

**Response:**
```json
{
  "reply": "Para fazer uma caipirinha tradicional..."
}
```

**Error Codes:**
- `400` - Empty or invalid message
- `429` - Rate limit exceeded (5 requests/minute)
- `503` - AI service unavailable

## Sample Questions

Try asking these questions to explore the assistant's knowledge:

### Traditional Dishes
- "Como fazer uma feijoada tradicional?"
- "O que é moqueca baiana e como preparar?"
- "Qual a receita do pão de queijo mineiro?"

### Regional Cuisines
- "Qual a diferença entre churrasco gaúcho e outros churrascos?"
- "What are typical dishes from Bahia?"
- "Tell me about Amazonian cuisine"

### Drinks
- "What makes a good caipirinha?"
- "Como preparar um café brasileiro?"
- "What is guaraná?"

### Street Food
- "How do you make coxinha?"
- "O que é acarajé?"
- "What are popular Brazilian street foods?"

## Project Structure

```
interview/
├── docs/                    # Documentation
│   ├── PRD.md              # Product requirements
│   └── adr/                # Architecture decisions
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── chat/           # Chat endpoint
│   │   ├── llm/            # OpenAI integration
│   │   └── common/         # Shared utilities
│   └── Dockerfile
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript types
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `OPENAI_MODEL` | GPT model to use | `gpt-3.5-turbo` |
| `PORT` | Backend server port | `3000` |
| `RATE_LIMIT_MAX` | Max requests per window | `5` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `60000` |

## Testing

### Backend Tests
```bash
cd backend
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Architecture Decisions

See the [Architecture Decision Records](./docs/adr/) for detailed design decisions:
- [001 - Tech Stack](./docs/adr/001-tech-stack.md)
- [002 - Project Structure](./docs/adr/002-project-structure.md)
- [003 - LLM Integration](./docs/adr/003-llm-integration.md)
- [004 - API Design](./docs/adr/004-api-design.md)

## License

MIT
