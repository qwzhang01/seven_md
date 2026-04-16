import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global teardown: cleans up after all E2E tests have run
 */
async function globalTeardown(_config: FullConfig) {
  // Stop the dev server if we started it
  const pidFile = path.resolve('./test-results/.server-pid');
  if (fs.existsSync(pidFile)) {
    const pid = parseInt(fs.readFileSync(pidFile, 'utf-8'), 10);
    try {
      process.kill(pid, 'SIGTERM');
      console.log(`✓ Dev server (PID: ${pid}) stopped`);
    } catch {
      // Server may have already stopped
    }
    fs.unlinkSync(pidFile);
  }

  // Clean up temporary test files
  const tempDir = path.resolve('./test-results/temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('✓ Temporary test files cleaned up');
  }

  console.log('✓ Global teardown complete');
}

export default globalTeardown;
