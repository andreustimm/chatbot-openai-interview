FROM mcr.microsoft.com/playwright:v1.50.0-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy test files and config
COPY playwright.config.ts ./
COPY tests ./tests

# Run tests
CMD ["npx", "playwright", "test"]
