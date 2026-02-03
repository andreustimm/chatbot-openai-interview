import { test, expect } from '@playwright/test';

test.describe('Brazilian Cuisine Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays welcome message on load', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Brazilian Cuisine Assistant' })).toBeVisible();
    await expect(page.getByText('Welcome to Brazilian Cuisine Assistant!')).toBeVisible();
    await expect(page.getByText('Ask me anything about Brazilian food, recipes, or cooking techniques.')).toBeVisible();
  });

  test('has input field and send button', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await expect(input).toBeVisible();
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled();
  });

  test('enables send button when typing', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('Hello');
    await expect(sendButton).toBeEnabled();
  });

  test('sends message and displays user message', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('What is feijoada?');
    await sendButton.click();

    // Wait for user message to appear (in a blue bubble)
    const userMessage = page.locator('.bg-blue-500').filter({ hasText: 'What is feijoada?' });
    await expect(userMessage).toBeVisible({ timeout: 10000 });
  });

  test('clears input after sending message', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('Hello');
    await sendButton.click();

    await expect(input).toHaveValue('');
  });

  test('shows typing indicator while waiting for response', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('What is feijoada?');

    // Start watching for typing indicator before clicking
    const typingIndicatorPromise = page.locator('.animate-bounce').first().waitFor({ state: 'visible', timeout: 10000 });

    await sendButton.click();

    // The typing indicator uses animate-bounce class
    await typingIndicatorPromise;
  });

  test('disables input while sending', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('Test message');

    // Start watching for disabled state before clicking
    const inputDisabledPromise = expect(input).toBeDisabled({ timeout: 10000 });

    await sendButton.click();

    await inputDisabledPromise;
  });

  test('can send message with Enter key', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');

    await input.fill('Hello');
    await input.press('Enter');

    // Wait for user message to appear (in a blue bubble)
    const userMessage = page.locator('.bg-blue-500').filter({ hasText: 'Hello' });
    await expect(userMessage).toBeVisible({ timeout: 10000 });
  });

  test('Shift+Enter does not send message', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');

    await input.fill('Hello');
    await input.press('Shift+Enter');

    // Input should still have the text (not cleared)
    await expect(input).toHaveValue('Hello\n');
    // Welcome message should still be visible (no messages sent)
    await expect(page.getByText('Welcome to Brazilian Cuisine Assistant!')).toBeVisible();
  });

  test('displays bot response after sending message', async ({ page }) => {
    // Skip this test if no real API key (test-key won't work with OpenAI)
    const apiKey = process.env.OPENAI_API_KEY;
    test.skip(!apiKey || apiKey === 'test-key', 'Requires real OPENAI_API_KEY');

    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('What is feijoada?');
    await sendButton.click();

    // Wait for bot response (gray background) or error message
    const botMessage = page.locator('.bg-gray-200').filter({ has: page.locator('p') });
    await expect(botMessage).toBeVisible({ timeout: 30000 });
  });
});

test.describe('Error Handling', () => {
  test('handles empty message gracefully', async ({ page }) => {
    await page.goto('/');

    const sendButton = page.getByRole('button', { name: 'Send' });

    // Button should be disabled for empty input
    await expect(sendButton).toBeDisabled();
  });

  test('user messages appear on the right', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    await input.fill('Test message');
    await input.press('Enter');

    // User message container should have justify-end class (message aligned right)
    const messageContainer = page.locator('.justify-end').filter({ has: page.locator('.bg-blue-500') });
    await expect(messageContainer).toBeVisible({ timeout: 10000 });
  });
});

test.describe('UI/UX', () => {
  test('has responsive layout', async ({ page }) => {
    await page.goto('/');

    // Check that chat container is visible and centered
    const chatContainer = page.locator('[class*="max-w-2xl"]').first();
    await expect(chatContainer).toBeVisible();
  });

  test('header has correct styling', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('[class*="bg-green-600"]');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Brazilian Cuisine Assistant');
  });

  test('shows helper text for keyboard shortcuts', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Press Enter to send, Shift+Enter for new line')).toBeVisible();
  });
});
