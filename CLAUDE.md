# CLAUDE.md - Project Context for AI Assistance

## Project Overview

This is a chat application that provides Q&A about Brazilian cuisine using OpenAI GPT. It consists of a NestJS backend and React frontend in a monorepo structure.

## Tech Stack

- **Backend**: NestJS, TypeScript, OpenAI API
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Deployment**: Docker, Docker Compose

## Directory Structure

```
interview/
├── backend/               # NestJS API (port 3000)
├── frontend/              # React app (port 5173 dev, 8080 prod)
├── e2e/                   # Playwright E2E tests
├── docs/                  # PRD and ADRs
├── docker-compose.yml     # Production Docker setup
└── docker-compose.test.yml # E2E testing Docker setup
```

## Key Commands

### Backend
```bash
cd backend
npm install           # Install dependencies
npm run start:dev     # Start development server
npm run test          # Run unit tests
npm run build         # Build for production
```

### Frontend
```bash
cd frontend
npm install           # Install dependencies
npm run dev           # Start development server
npm run test          # Run tests
npm run build         # Build for production
```

### E2E Tests
```bash
cd e2e
npm install                        # Install dependencies
npx playwright install chromium    # Install browser
npm run test                       # Run tests (starts backend/frontend automatically)
npm run test:ui                    # Run tests with Playwright UI
npm run test:docker                # Run tests in Docker containers
```

### Docker
```bash
# Production
docker-compose up --build                      # Build and start all services
docker-compose down                            # Stop services

# E2E Testing (isolated environment)
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
docker-compose -f docker-compose.test.yml down --volumes --remove-orphans
```

## API Endpoint

- `POST /chat` - Send message, receive AI response
  - Request: `{ "message": "string" }`
  - Response: `{ "reply": "string" }`

## Architecture Notes

1. **LLM Integration**: The `LlmService` wraps OpenAI API calls with a system prompt that focuses responses on Brazilian cuisine

2. **Rate Limiting**: 5 requests per minute per IP using `@nestjs/throttler`

3. **Domain Focus**: The AI is instructed to politely decline off-topic questions and redirect to Brazilian cuisine topics

## Environment Variables

Required in `.env`:
- `OPENAI_API_KEY` - OpenAI API key (required)
- `OPENAI_MODEL` - Model name (default: gpt-3.5-turbo)

## Common Tasks

### Adding a new API endpoint
1. Add method to controller in `backend/src/chat/chat.controller.ts`
2. Add business logic in `backend/src/chat/chat.service.ts`
3. Create DTO in `backend/src/chat/dto/`

### Modifying the AI behavior
1. Edit system prompt in `backend/src/llm/llm.service.ts`

### Styling the chat UI
1. Components use Tailwind CSS classes
2. Main chat components in `frontend/src/components/`

## Testing

### Unit Tests
- Backend uses Jest with mocked OpenAI client
- Frontend uses React Testing Library
- Run `npm test` in respective directories

### E2E Tests
- Uses Playwright with Chromium browser
- Tests are located in `e2e/tests/`
- Configuration in `e2e/playwright.config.ts`
- Can run locally (auto-starts backend/frontend) or in Docker containers
- Docker setup (`docker-compose.test.yml`) provides isolated environment with:
  - Internal networking between services
  - Healthchecks to ensure services are ready
  - Volume mounts for test reports
