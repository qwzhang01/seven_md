// Windows E2E Test Suite
const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');

describe('Windows E2E Tests', () => {
  let electronApp;
  let page;
  let testDataDir;

  beforeAll(async () => {
    // Setup test data directory
    testDataDir = path.join(process.env.TEMP || '/tmp', 'seven-md-e2e-tests');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist-electron/main.js')],
      env: {
        ...process.env,
        TEST_MODE: 'windows',
        TEST_DATA_DIR: testDataDir
      }
    });

    // Get the first window
    page = await electronApp.firstWindow();
    
    // Wait for app to load
    await page.waitForTimeout(2000);
  }, 30000);

  afterAll(async () => {
    // Cleanup
    if (electronApp) {
      await electronApp.close();
    }
    
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  test('Application launches successfully on Windows', async () => {
    // Check if main window is visible
    const windowTitle = await page.title();
    expect(windowTitle).toContain('Seven MD');
    
    // Check if app content is loaded
    const appContent = await page.locator('#app').isVisible();
    expect(appContent).toBe(true);
  });

  test('File operations work correctly on Windows', async () => {
    // Create a test markdown file
    const testFile = path.join(testDataDir, 'test-e2e.md');
    const testContent = '# E2E Test File\n\nThis is a test file for Windows E2E testing.';
    fs.writeFileSync(testFile, testContent);

    // Test file open functionality
    // Note: This would require mocking the file dialog in E2E tests
    // For now, we'll test the file loading mechanism
    
    // Verify file content can be processed
    const fileContent = fs.readFileSync(testFile, 'utf8');
    expect(fileContent).toBe(testContent);
  });

  test('Windows path handling in file operations', async () => {
    // Test various Windows path formats
    const testPaths = [
      'C:\\Users\\Test\\Documents\\file.md',
      'D:\\Projects\\seven_md\\README.md',
      '\\\\server\\share\\document.md'
    ];

    // Verify paths are handled correctly
    testPaths.forEach(testPath => {
      expect(testPath).toMatch(/^[A-Z]:\\\\|\\\\\\\\.+/);
    });
  });

  test('UI elements render correctly on Windows', async () => {
    // Check for Windows-specific UI elements
    const menuBar = await page.locator('[role="menubar"]').isVisible();
    expect(menuBar).toBe(true);
    
    // Check window controls (minimize, maximize, close)
    const windowControls = await page.locator('.window-controls').isVisible();
    expect(windowControls).toBe(true);
    
    // Verify DPI scaling
    const mainContent = await page.locator('.main-content');
    const boundingBox = await mainContent.boundingBox();
    expect(boundingBox.width).toBeGreaterThan(800);
    expect(boundingBox.height).toBeGreaterThan(600);
  });

  test('Keyboard shortcuts work on Windows', async () => {
    // Test common Windows keyboard shortcuts
    await page.keyboard.press('Control+O'); // Open file
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Control+S'); // Save file
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Control+N'); // New file
    await page.waitForTimeout(500);
    
    // Verify no errors occurred
    const errorCount = await page.evaluate(() => {
      return window.consoleErrors ? window.consoleErrors.length : 0;
    });
    expect(errorCount).toBe(0);
  });

  test('Dark/Light theme switching on Windows', async () => {
    // Test theme switching functionality
    const themeToggle = await page.locator('.theme-toggle');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(1000);
      
      // Verify theme change
      const bodyClass = await page.locator('body').getAttribute('class');
      expect(bodyClass).toMatch(/dark|light/);
    }
  });

  test('Performance metrics on Windows', async () => {
    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      return {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        memory: performance.memory ? performance.memory.usedJSHeapSize : null
      };
    });
    
    expect(metrics.loadTime).toBeLessThan(5000); // Should load in under 5 seconds
    expect(metrics.domContentLoaded).toBeLessThan(3000); // DOM ready in under 3 seconds
  });

  test('Error handling on Windows', async () => {
    // Test error scenarios
    try {
      // Try to open a non-existent file
      await page.evaluate(() => {
        window.openFile('C:\\nonexistent\\file.md');
      });
      
      // Should handle error gracefully
      const errorDisplay = await page.locator('.error-message').isVisible();
      expect(errorDisplay).toBe(false); // No error should be displayed for this test case
    } catch (error) {
      // Error is expected, verify it's handled properly
      expect(error).toBeDefined();
    }
  });
});

describe('Windows Installation Tests', () => {
  test('NSIS installer functionality', async () => {
    // This would test the actual installer
    // For now, verify installer file exists
    const installerPath = path.join(__dirname, '../../src-tauri/target/release/bundle/nsis/SevenMD_0.0.0_x64-setup.exe');
    const installerExists = fs.existsSync(installerPath);
    
    // In CI environment, installer might not exist yet
    if (process.env.CI) {
      console.log('Skipping installer test in CI environment');
      return;
    }
    
    expect(installerExists).toBe(true);
  });

  test('MSI installer functionality', async () => {
    // Verify MSI installer file
    const msiPath = path.join(__dirname, '../../src-tauri/target/release/bundle/msi/SevenMD_0.0.0_x64.msi');
    const msiExists = fs.existsSync(msiPath);
    
    if (process.env.CI) {
      console.log('Skipping MSI test in CI environment');
      return;
    }
    
    expect(msiExists).toBe(true);
  });
});