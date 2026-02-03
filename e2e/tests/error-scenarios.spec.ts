import { test, expect } from '@playwright/test';

test.describe('Error Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays error when API returns 500', async ({ page }) => {
    // Mock the API to return 500 error
    await page.route('**/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 500,
          message: 'Internal Server Error',
          error: 'Error',
        }),
      });
    });

    // Send a message
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    await input.fill('Test message');
    await page.getByRole('button', { name: 'Send' }).click();

    // Error message should appear
    const errorContainer = page.locator('.bg-red-100');
    await expect(errorContainer).toBeVisible({ timeout: 10000 });
    await expect(errorContainer).toContainText('Internal Server Error');
  });

  test('displays rate limit message when API returns 429', async ({ page }) => {
    // Mock the API to return 429 rate limit error
    await page.route('**/chat', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 429,
          message: 'Too Many Requests',
          error: 'ThrottlerException',
        }),
      });
    });

    // Send a message
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    await input.fill('Test message');
    await page.getByRole('button', { name: 'Send' }).click();

    // Rate limit error message should appear
    const errorContainer = page.locator('.bg-red-100');
    await expect(errorContainer).toBeVisible({ timeout: 10000 });
    await expect(errorContainer).toContainText('Rate limit exceeded');
  });

  test('displays network error message on connection failure', async ({ page }) => {
    // Mock the API to fail network request
    await page.route('**/chat', async (route) => {
      await route.abort('failed');
    });

    // Send a message
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    await input.fill('Test message');
    await page.getByRole('button', { name: 'Send' }).click();

    // Network error message should appear
    const errorContainer = page.locator('.bg-red-100');
    await expect(errorContainer).toBeVisible({ timeout: 10000 });
    await expect(errorContainer).toContainText('Network error');
  });

  test('displays bad request error message for 400', async ({ page }) => {
    // Mock the API to return 400 error
    await page.route('**/chat', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 400,
          message: 'Message cannot be empty',
          error: 'Bad Request',
        }),
      });
    });

    // Send a message
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    await input.fill('Test');
    await page.getByRole('button', { name: 'Send' }).click();

    // Error message should appear
    const errorContainer = page.locator('.bg-red-100');
    await expect(errorContainer).toBeVisible({ timeout: 10000 });
    await expect(errorContainer).toContainText('Message cannot be empty');
  });

  test('recovers from error and allows new messages', async ({ page }) => {
    let requestCount = 0;

    // First request fails, second succeeds
    await page.route('**/chat', async (route) => {
      requestCount++;
      if (requestCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            statusCode: 500,
            message: 'Temporary error',
            error: 'Error',
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reply: 'Success! Here is information about feijoada.',
          }),
        });
      }
    });

    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // First message should fail
    await input.fill('First message');
    await sendButton.click();

    // Wait for error to appear
    const errorContainer = page.locator('.bg-red-100');
    await expect(errorContainer).toBeVisible({ timeout: 10000 });

    // Send second message
    await input.fill('Second message');
    await sendButton.click();

    // Error should disappear and response should appear
    await expect(errorContainer).not.toBeVisible({ timeout: 10000 });

    // Bot response should be visible
    const botMessage = page.locator('.bg-gray-200').filter({ hasText: 'feijoada' });
    await expect(botMessage).toBeVisible({ timeout: 10000 });
  });

  test('user message still appears even when API fails', async ({ page }) => {
    // Mock the API to return error
    await page.route('**/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 500,
          message: 'Server error',
          error: 'Error',
        }),
      });
    });

    // Send a message
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    await input.fill('My test message');
    await page.getByRole('button', { name: 'Send' }).click();

    // User message should still be visible
    await expect(page.getByText('My test message')).toBeVisible({ timeout: 10000 });

    // Error should also be visible
    const errorContainer = page.locator('.bg-red-100');
    await expect(errorContainer).toBeVisible();
  });

  test('typing indicator disappears after error', async ({ page }) => {
    // Mock the API to delay then error
    await page.route('**/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 500,
          message: 'Server error',
          error: 'Error',
        }),
      });
    });

    // Send a message
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    await input.fill('Test');
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for error to appear
    const errorContainer = page.locator('.bg-red-100');
    await expect(errorContainer).toBeVisible({ timeout: 10000 });

    // Typing indicator should not be visible
    const typingIndicator = page.locator('.animate-bounce');
    await expect(typingIndicator).not.toBeVisible();
  });

  test('input is re-enabled after error', async ({ page }) => {
    // Mock the API to return error
    await page.route('**/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 500,
          message: 'Server error',
          error: 'Error',
        }),
      });
    });

    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Send a message
    await input.fill('Test');
    await sendButton.click();

    // Wait for error
    const errorContainer = page.locator('.bg-red-100');
    await expect(errorContainer).toBeVisible({ timeout: 10000 });

    // Input should be enabled again
    await expect(input).toBeEnabled();

    // Should be able to type new message
    await input.fill('New message');
    await expect(input).toHaveValue('New message');
  });

  test('handles timeout/slow response gracefully', async ({ page }) => {
    // This test requires a real OpenAI API - skip in most environments
    const apiKey = process.env.OPENAI_API_KEY || '';
    test.skip(apiKey === '' || apiKey === 'test-key' || apiKey.startsWith('test'), 'Requires real API for timeout testing');

    // Mock a very slow response
    await page.route('**/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 30000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reply: 'Response' }),
      });
    });

    // Send a message
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    await input.fill('Test');
    await page.getByRole('button', { name: 'Send' }).click();

    // Typing indicator should be visible while waiting
    const typingIndicator = page.locator('.animate-bounce').first();
    await expect(typingIndicator).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Error Message Styling', () => {
  test('error message has correct styling', async ({ page }) => {
    await page.goto('/');

    // Mock error response
    await page.route('**/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 500,
          message: 'Test error',
          error: 'Error',
        }),
      });
    });

    // Send a message
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    await input.fill('Test');
    await page.getByRole('button', { name: 'Send' }).click();

    // Check error container styling
    const errorContainer = page.locator('.bg-red-100');
    await expect(errorContainer).toBeVisible({ timeout: 10000 });
    await expect(errorContainer).toHaveClass(/border-red-300/);
    await expect(errorContainer).toHaveClass(/text-red-700/);
  });
});
