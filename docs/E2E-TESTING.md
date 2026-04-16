# E2E Testing Guide

## Overview

Seven MD uses [Playwright](https://playwright.dev/) for end-to-end testing. This guide covers everything you need to know to run, write, and maintain E2E tests.

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Install dependencies (includes Playwright)
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see the browser)
npm run test:e2e:headed

# Run a specific test file
npx playwright test e2e/tests/editor/editor.spec.ts

# Run tests matching a pattern
npx playwright test --grep "bold formatting"

# Run tests in debug mode
npx playwright test --debug
```

## Directory Structure

```
e2e/
├── tests/              # Test files
│   ├── editor/         # Editor-related tests
│   ├── file/           # File operation tests
│   ├── preview/        # Preview pane tests
│   └── settings/       # Settings tests
├── fixtures/           # Test fixtures and shared data
│   └── index.ts        # Main fixtures file
├── helpers/            # Utility functions
│   ├── test-helpers.ts # Common test helpers
│   ├── test-data.ts    # Test data management
│   └── health-check.ts # Environment health checks
├── pages/              # Page Object Model
│   ├── BasePage.ts     # Base page object
│   ├── EditorPage.ts   # Editor interactions
│   ├── PreviewPage.ts  # Preview pane interactions
│   ├── MenuBarPage.ts  # Menu bar interactions
│   ├── SettingsPage.ts # Settings dialog interactions
│   ├── FileDialogPage.ts # File dialog interactions
│   └── PageObjectFactory.ts # Factory for page objects
└── setup/              # Test environment setup
    ├── global-setup.ts  # Runs before all tests
    └── global-teardown.ts # Runs after all tests
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '../../fixtures';

test.describe('Feature Name', () => {
  test('should do something', async ({ editorPage, previewPage }) => {
    // Arrange
    await editorPage.waitForEditor();
    
    // Act
    await editorPage.typeInEditor('# Hello World');
    
    // Assert
    await previewPage.waitForUpdate();
    await previewPage.assertHeading(1, 'Hello World');
  });
});
```

### Using Page Objects

```typescript
import { test } from '../../fixtures';

test('editor test', async ({ editorPage }) => {
  await editorPage.waitForEditor();
  await editorPage.typeInEditor('Some text');
  await editorPage.assertContains('Some text');
});
```

### Using the Page Factory

```typescript
import { test } from '@playwright/test';
import { PageObjectFactory } from '../../pages/PageObjectFactory';

test('using factory', async ({ page }) => {
  await page.goto('/');
  const { editor, preview } = PageObjectFactory.create(page);
  
  await editor.typeInEditor('# Test');
  await preview.assertHeading(1, 'Test');
});
```

## Test Data Management

Use the test data utilities for managing test files:

```typescript
import { createTempMarkdownFile, deleteTempFile } from '../../helpers/test-data';

test('file test', async ({ editorPage }) => {
  const filePath = createTempMarkdownFile('# Test Content', 'test.md');
  
  try {
    // Use the file in your test
  } finally {
    deleteTempFile(filePath); // Always clean up
  }
});
```

## Debugging

### View Test Reports

```bash
# Open the HTML report
npx playwright show-report

# Open a specific report
npx playwright show-report playwright-report
```

### Trace Viewer

```bash
# View a trace file
npx playwright show-trace test-results/trace.zip
```

### Screenshots

Screenshots are automatically captured on test failure and saved to `test-results/screenshots/`.

## CI/CD

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request

Test results are uploaded as artifacts and posted as PR comments.

## Troubleshooting

### Tests are flaky

1. Add explicit waits: `await page.waitForTimeout(500)`
2. Use `waitForVisible` instead of direct assertions
3. Check for race conditions in async operations

### Browser not found

```bash
npx playwright install --with-deps
```

### Port already in use

Change the port in `playwright.config.ts` or set `E2E_BASE_URL` environment variable.
