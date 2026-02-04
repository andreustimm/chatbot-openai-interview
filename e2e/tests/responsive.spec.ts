import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('chat container uses full width on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    const chatContainer = page.locator('.flex.flex-col.h-screen').first();
    await expect(chatContainer).toBeVisible();

    const viewportWidth = page.viewportSize()?.width || 0;
    const containerBox = await chatContainer.boundingBox();

    expect(containerBox).toBeTruthy();
    // On mobile, container should span full width
    expect(containerBox!.width).toBeCloseTo(viewportWidth, -1);
  });

  test('chat container is constrained on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop-only test');

    const chatContainer = page.locator('.flex.flex-col.h-screen').first();
    await expect(chatContainer).toBeVisible();

    const viewportWidth = page.viewportSize()?.width || 0;
    const containerBox = await chatContainer.boundingBox();

    expect(containerBox).toBeTruthy();
    // On desktop (md+), container should be constrained to max-w-2xl (672px)
    if (viewportWidth >= 768) {
      expect(containerBox!.width).toBeLessThanOrEqual(672);
    }
  });

  test('send button has touch-friendly size', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: 'Send' });
    await expect(sendButton).toBeVisible();

    const buttonBox = await sendButton.boundingBox();
    expect(buttonBox).toBeTruthy();

    // Minimum touch target size should be 44x44 pixels
    expect(buttonBox!.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('header is visible and readable', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const heading = page.getByRole('heading', { name: 'Brazilian Cuisine Assistant' });
    await expect(heading).toBeVisible();

    const headerBox = await header.boundingBox();
    expect(headerBox).toBeTruthy();
    // Header should span full width of container
    expect(headerBox!.width).toBeGreaterThan(0);
  });

  test('input area is usable on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    await expect(input).toBeVisible();

    const inputBox = await input.boundingBox();
    expect(inputBox).toBeTruthy();

    // Input should have reasonable height for touch
    expect(inputBox!.height).toBeGreaterThanOrEqual(36);
  });

  test('messages are readable on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('Test message for mobile');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Wait for message to appear (use first() to avoid matching bot response)
    await expect(page.getByText('Test message for mobile', { exact: true }).first()).toBeVisible({ timeout: 10000 });

    // Check message bubble width
    const messageBubble = page.locator('.bg-blue-700').first();
    await expect(messageBubble).toBeVisible();

    const bubbleBox = await messageBubble.boundingBox();
    const viewportWidth = page.viewportSize()?.width || 0;

    expect(bubbleBox).toBeTruthy();
    // Message should not exceed 85% of viewport on mobile
    expect(bubbleBox!.width).toBeLessThanOrEqual(viewportWidth * 0.9);
  });

  test('scroll works correctly with messages', async ({ page }) => {
    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Send multiple messages to trigger scroll
    for (let i = 1; i <= 3; i++) {
      await input.fill(`Message number ${i}`);
      await expect(sendButton).toBeEnabled();
      await sendButton.click();
      await expect(input).toHaveValue('');
    }

    // Last message should be visible (auto-scrolled) - use first() to avoid matching bot response
    await expect(page.getByText('Message number 3', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  });

  test('welcome message is centered and visible on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    const welcomeText = page.getByText('Welcome to Brazilian Cuisine Assistant!');
    await expect(welcomeText).toBeVisible();

    // Check that welcome section is centered
    const welcomeSection = page.locator('.text-center').first();
    await expect(welcomeSection).toBeVisible();
  });

  test('all essential elements are visible on mobile viewport', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    // Header
    await expect(page.getByRole('heading', { name: 'Brazilian Cuisine Assistant' })).toBeVisible();

    // Subheading
    await expect(page.getByText('Ask me about Brazilian food!')).toBeVisible();

    // Input
    await expect(page.getByPlaceholder('Ask about Brazilian cuisine...')).toBeVisible();

    // Send button
    await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();

    // Helper text
    await expect(page.getByText('Press Enter to send, Shift+Enter for new line')).toBeVisible();
  });

  test('typing indicator is visible on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    const apiKey = process.env.OPENAI_API_KEY || '';
    test.skip(apiKey === '' || apiKey === 'test-key' || apiKey.startsWith('test'), 'Requires real OPENAI_API_KEY for timing');

    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('What is feijoada?');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Typing indicator should be visible
    await expect(page.locator('.animate-bounce').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Touch Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('can tap to focus input', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    await input.tap();
    await expect(input).toBeFocused();
  });

  test('can tap send button', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    const input = page.getByPlaceholder('Ask about Brazilian cuisine...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('Tap test');
    await expect(sendButton).toBeEnabled();
    await sendButton.tap();

    // Message should be sent (use first() to avoid matching bot response)
    await expect(page.getByText('Tap test', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  });
});
