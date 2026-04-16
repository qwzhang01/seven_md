import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Test data management utilities
 */

// Temporary directory for test files
const TEST_TEMP_DIR = path.resolve('./test-results/temp');

/**
 * Create a temporary markdown file for testing
 */
export function createTempMarkdownFile(content: string, filename?: string): string {
  if (!fs.existsSync(TEST_TEMP_DIR)) {
    fs.mkdirSync(TEST_TEMP_DIR, { recursive: true });
  }

  const name = filename || `test-${Date.now()}.md`;
  const filepath = path.join(TEST_TEMP_DIR, name);
  fs.writeFileSync(filepath, content, 'utf-8');
  return filepath;
}

/**
 * Read content from a file
 */
export function readFileContent(filepath: string): string {
  return fs.readFileSync(filepath, 'utf-8');
}

/**
 * Delete a temporary test file
 */
export function deleteTempFile(filepath: string): void {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

/**
 * Clean up all temporary test files
 */
export function cleanupTempFiles(): void {
  if (fs.existsSync(TEST_TEMP_DIR)) {
    fs.rmSync(TEST_TEMP_DIR, { recursive: true, force: true });
  }
}

/**
 * Get the path to a fixture file
 */
export function getFixturePath(filename: string): string {
  return path.resolve('./e2e/fixtures', filename);
}

/**
 * Create a unique test file name
 */
export function generateTestFileName(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.md`;
}

/**
 * Get system temp directory
 */
export function getSystemTempDir(): string {
  return os.tmpdir();
}

/**
 * Sample markdown content for different test scenarios
 */
export const SAMPLE_CONTENT = {
  basic: '# Test Document\n\nThis is a basic test document.',
  withTable: '| Col 1 | Col 2 |\n|-------|-------|\n| A     | B     |',
  withMath: '$E = mc^2$\n\n$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$',
  withTaskList: '- [x] Done task\n- [ ] Pending task',
  withBlockquote: '> This is a blockquote\n> with multiple lines',
  withHorizontalRule: 'Above\n\n---\n\nBelow',
};
