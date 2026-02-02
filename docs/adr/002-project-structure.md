# ADR 002: Project Structure

## Status
Accepted

## Context
We need to organize a project with both backend (NestJS) and frontend (React) applications. The structure should support independent development, clear separation of concerns, and easy deployment.

## Decision

### Monorepo Structure
```
interview/
├── docs/                    # Documentation
│   ├── PRD.md
│   └── adr/
├── backend/                 # NestJS application
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── chat/           # Chat feature module
│   │   ├── llm/            # LLM integration module
│   │   └── common/         # Shared utilities
│   ├── test/
│   ├── Dockerfile
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── README.md
├── CLAUDE.md
└── .env.example
```

### Module Organization (Backend)

**Feature Modules**: Group related functionality
- `chat/` - Chat endpoint, business logic
- `llm/` - OpenAI integration

**Common Module**: Shared utilities
- Guards (rate limiting)
- Filters (exception handling)
- Decorators (if needed)

### Component Organization (Frontend)

**Components**: UI building blocks
- Container components manage state
- Presentational components render UI

**Services**: API communication
- Centralized API client
- Type-safe request/response handling

**Types**: Shared TypeScript interfaces

## Consequences

### Positive
- Clear separation between frontend and backend
- Each application can be built/deployed independently
- Shared documentation at root level
- Docker Compose orchestrates both services

### Negative
- No shared TypeScript types between frontend/backend
- Separate package.json files to maintain

### Mitigations
- Document API contract in ADR
- Keep types in sync manually (small API surface)

## Alternatives Considered

| Option | Reason Not Chosen |
|--------|-------------------|
| Nx Monorepo | Overkill for two applications |
| Separate Repos | Harder to coordinate changes |
| Full-stack Next.js | NestJS preferred for backend structure |
