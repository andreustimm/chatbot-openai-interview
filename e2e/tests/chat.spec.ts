import { test, expect } from '@playwright/test';

test.describe('Brazilian Cuisine Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays welcome message on load', async ({ page }) => {
    await expect(page.getByText('Brazilian Cuisine Assistant')).toBeVisible();
    await expect(page.getByText('Welcome to Brazilian Cuisine Assistant!')).toBeVisible();
    await expect(page.getByText('Ask me anything about Brazilian food')).toBeVisible();
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

    await expect(page.getByText('What is feijoada?')).toBeVisible();
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
    await sendButton.click();

    // The typing indicator uses animate-bounce class
    const typingIndicator = page.locator('.animate-bounce').first();
    await expect(typingIndicator).toBeVisible({ timeout: 5000 });
  });

  test('disables input while sending', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('Test message');
    await sendButton.click();

    await expect(input).toBeDisabled();
    await expect(sendButton).toBeDisabled();
  });

  test('can send message with Enter key', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');

    await input.fill('Hello');
    await input.press('Enter');

    await expect(page.getByText('Hello')).toBeVisible();
  });

  test('Shift+Enter does not send message', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');

    await input.fill('Hello');
    await input.press('Shift+Enter');

    // Message should not appear in the chat
    await expect(page.locator('[class*="bg-blue-500"]')).not.toBeVisible();
  });

  test('displays bot response after sending message', async ({ page }) => {
    // Skip this test if no API key (for CI without secrets)
    test.skip(!process.env.OPENAI_API_KEY, 'Requires OPENAI_API_KEY');

    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('What is feijoada?');
    await sendButton.click();

    // Wait for bot response (gray background)
    const botMessage = page.locator('[class*="bg-gray-200"]').last();
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

    // User message container should have justify-end class
    const messageContainer = page.locator('[class*="justify-end"]').first();
    await expect(messageContainer).toBeVisible();
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
