# ADR 001: Technology Stack

## Status
Accepted

## Context
We need to build a chat application with LLM integration for Brazilian cuisine Q&A. The application requires a backend API, frontend interface, and integration with an LLM provider.

## Decision

### Backend: NestJS
- **Framework**: NestJS with TypeScript
- **Rationale**:
  - Strong typing with TypeScript reduces runtime errors
  - Modular architecture promotes code organization
  - Built-in support for dependency injection
  - Excellent decorator-based syntax for controllers and services
  - Active community and comprehensive documentation

### Frontend: React
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Rationale**:
  - Component-based architecture fits chat UI well
  - Hooks provide clean state management
  - Vite offers fast development experience
  - Tailwind enables rapid, consistent styling
  - TypeScript ensures type safety across the stack

### LLM Provider: OpenAI GPT
- **API**: OpenAI Chat Completions API
- **Default Model**: gpt-3.5-turbo
- **Rationale**:
  - Well-documented, stable API
  - Cost-effective for Q&A use case
  - Excellent natural language understanding
  - Easy to configure with system prompts

### Containerization: Docker
- **Orchestration**: Docker Compose
- **Rationale**:
  - Consistent deployment environments
  - Easy local development setup
  - Simple multi-container orchestration

## Consequences

### Positive
- Full TypeScript stack enables shared types
- NestJS structure scales well for future features
- Docker simplifies deployment and onboarding
- React + Tailwind enables rapid UI development

### Negative
- NestJS has steeper learning curve than Express
- Docker adds complexity for simple deployments
- OpenAI API costs require monitoring

### Risks
- OpenAI API rate limits may affect user experience
- Network latency to OpenAI affects response time

## Alternatives Considered

| Option | Reason Not Chosen |
|--------|-------------------|
| Express.js | Less structured, harder to maintain at scale |
| Next.js | SSR not needed for chat application |
| Anthropic Claude | OpenAI more widely documented |
| Local LLM | Resource intensive, lower quality responses |
