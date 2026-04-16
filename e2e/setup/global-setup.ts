import { chromium, FullConfig } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

let devServer: ChildProcess | null = null;

/**
 * Global setup: starts the development server before running E2E tests
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:1420';

  // Create test artifacts directory
  const artifactsDir = path.resolve('./test-results');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  // Check if server is already running
  const isRunning = await checkServerRunning(baseURL);
  if (isRunning) {
    console.log(`✓ Dev server already running at ${baseURL}`);
    return;
  }

  // Start the dev server
  console.log('Starting dev server...');
  devServer = spawn('npm', ['run', 'dev'], {
    cwd: path.resolve('.'),
    stdio: 'pipe',
    shell: true,
  });

  // Store PID for teardown
  if (devServer.pid) {
    fs.writeFileSync(path.resolve('./test-results/.server-pid'), String(devServer.pid));
  }

  // Wait for server to be ready
  await waitForServer(baseURL, 30000);
  console.log(`✓ Dev server started at ${baseURL}`);
}

/**
 * Check if the server is already running
 */
async function checkServerRunning(url: string): Promise<boolean> {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { timeout: 3000 });
    await browser.close();
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for the server to be ready
 */
async function waitForServer(url: string, timeout: number): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const isReady = await checkServerRunning(url);
    if (isReady) return;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Server at ${url} did not start within ${timeout}ms`);
}

export default globalSetup;
