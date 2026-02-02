# ADR 003: LLM Integration Design

## Status
Accepted

## Context
The application needs to integrate with OpenAI GPT to provide domain-specific Q&A about Brazilian cuisine. The integration must handle API communication, maintain domain focus, and manage errors gracefully.

## Decision

### OpenAI Chat Completions API

**Endpoint**: `POST https://api.openai.com/v1/chat/completions`

**Configuration**:
```typescript
{
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage }
  ],
  temperature: 0.7,
  max_tokens: 1000
}
```

### System Prompt Strategy

The system prompt establishes the assistant as a Brazilian cuisine expert:

```
You are a knowledgeable and friendly expert on Brazilian cuisine. Your expertise includes:

- Traditional dishes: feijoada, pão de queijo, churrasco, moqueca, vatapá, acarajé
- Regional cuisines: Bahian (African-influenced), Mineiro (comfort food), Gaucho (grilled meats), Northern (Amazonian ingredients)
- Street food: coxinha, pastel, açaí, tapioca
- Beverages: caipirinha, guaraná, cachaça, café brasileiro
- Ingredients: mandioca, dendê oil, hearts of palm, black beans, farofa
- Cooking techniques and cultural context

Guidelines:
1. Provide detailed, accurate information about Brazilian food
2. Include cultural context when relevant
3. Offer recipe suggestions with ingredients and steps when asked
4. Be enthusiastic and share interesting facts
5. If asked about non-Brazilian cuisine topics, politely explain that you specialize in Brazilian cuisine and redirect the conversation

Respond in the same language as the user's question (Portuguese or English).
```

### Architecture

```
ChatController
     │
     ▼
ChatService ──────► LLMService
                        │
                        ▼
                   OpenAI API
```

**LLMService** responsibilities:
- Maintain OpenAI client instance
- Apply system prompt
- Handle API errors
- Return formatted response

### Error Handling

| Error Type | Handling |
|------------|----------|
| API Key Invalid | Log error, return generic message |
| Rate Limited | Return 429 to client |
| Timeout | Return 503 with retry suggestion |
| Network Error | Return 503 |

## Consequences

### Positive
- Single responsibility: LLMService handles all OpenAI communication
- System prompt ensures domain focus
- Configurable model via environment variable
- Clear error handling strategy

### Negative
- Single-turn conversations (no memory)
- Dependent on external API availability
- API costs per request

### Future Considerations
- Add conversation history for multi-turn chats
- Implement response caching for common questions
- Add fallback provider option

## Alternatives Considered

| Option | Reason Not Chosen |
|--------|-------------------|
| LangChain | Adds complexity for simple use case |
| Multi-turn memory | Scope creep, adds state management |
| Local embeddings | Not needed for simple Q&A |
