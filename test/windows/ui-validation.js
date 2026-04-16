// Windows UI/UX Validation Script
const { _electron: electron } = require('playwright');
const path = require('path');

class WindowsUIVAlidation {
  constructor() {
    this.app = null;
    this.page = null;
    this.validationResults = [];
  }

  /**
   * Launch the application
   */
  async launchApp() {
    this.app = await electron.launch({
      args: [path.join(__dirname, '../../dist-electron/main.js')],
      env: {
        ...process.env,
        TEST_MODE: 'windows',
        PLATFORM: 'windows'
      }
    });

    this.page = await this.app.firstWindow();
    await this.page.waitForTimeout(3000); // Wait for app to load
  }

  /**
   * Validate window controls
   */
  async validateWindowControls() {
    console.log('Validating window controls...');
    
    const results = [];
    
    // Check window title
    const title = await this.page.title();
    results.push({
      test: 'Window Title',
      passed: title.includes('Seven MD'),
      details: `Title: "${title}"`
    });

    // Check window dimensions
    const windowState = await this.page.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        screenWidth: screen.width,
        screenHeight: screen.height
      };
    });

    results.push({
      test: 'Window Dimensions',
      passed: windowState.width >= 800 && windowState.height >= 600,
      details: `Size: ${windowState.width}x${windowState.height}`
    });

    // Check window controls visibility
    const minimizeBtn = await this.page.locator('[aria-label="Minimize"]').isVisible();
    const maximizeBtn = await this.page.locator('[aria-label="Maximize"]').isVisible();
    const closeBtn = await this.page.locator('[aria-label="Close"]').isVisible();

    results.push({
      test: 'Window Controls',
      passed: minimizeBtn && maximizeBtn && closeBtn,
      details: `Minimize: ${minimizeBtn}, Maximize: ${maximizeBtn}, Close: ${closeBtn}`
    });

    this.validationResults.push(...results);
    return results;
  }

  /**
   * Validate menu bar
   */
  async validateMenuBar() {
    console.log('Validating menu bar...');
    
    const results = [];
    
    // Check menu bar visibility
    const menuBar = await this.page.locator('[role="menubar"]').isVisible();
    results.push({
      test: 'Menu Bar Visibility',
      passed: menuBar,
      details: 'Menu bar is visible'
    });

    // Check menu items
    const menuItems = ['File', 'Edit', 'View', 'Help'];
    for (const item of menuItems) {
      const menuItem = await this.page.locator(`[role="menuitem"]:has-text("${item}")`).isVisible();
      results.push({
        test: `Menu Item "${item}"`,
        passed: menuItem,
        details: `Menu item "${item}" is ${menuItem ? 'visible' : 'missing'}`
      });
    }

    this.validationResults.push(...results);
    return results;
  }

  /**
   * Validate UI elements
   */
  async validateUIElements() {
    console.log('Validating UI elements...');
    
    const results = [];
    
    // Check main content area
    const mainContent = await this.page.locator('.main-content').isVisible();
    results.push({
      test: 'Main Content Area',
      passed: mainContent,
      details: 'Main content area is visible'
    });

    // Check editor area
    const editor = await this.page.locator('.editor').isVisible();
    results.push({
      test: 'Editor Area',
      passed: editor,
      details: 'Editor area is visible'
    });

    // Check preview area
    const preview = await this.page.locator('.preview').isVisible();
    results.push({
      test: 'Preview Area',
      passed: preview,
      details: 'Preview area is visible'
    });

    // Check toolbar
    const toolbar = await this.page.locator('.toolbar').isVisible();
    results.push({
      test: 'Toolbar',
      passed: toolbar,
      details: 'Toolbar is visible'
    });

    this.validationResults.push(...results);
    return results;
  }

  /**
   * Validate theme support
   */
  async validateThemes() {
    console.log('Validating theme support...');
    
    const results = [];
    
    // Check current theme
    const bodyClass = await this.page.locator('body').getAttribute('class');
    const hasTheme = bodyClass.includes('dark') || bodyClass.includes('light');
    
    results.push({
      test: 'Theme Detection',
      passed: hasTheme,
      details: `Current theme class: "${bodyClass}"`
    });

    // Check theme toggle
    const themeToggle = await this.page.locator('.theme-toggle').isVisible();
    results.push({
      test: 'Theme Toggle',
      passed: themeToggle,
      details: 'Theme toggle button is visible'
    });

    if (themeToggle) {
      // Test theme switching
      await this.page.click('.theme-toggle');
      await this.page.waitForTimeout(1000);
      
      const newBodyClass = await this.page.locator('body').getAttribute('class');
      const themeChanged = newBodyClass !== bodyClass;
      
      results.push({
        test: 'Theme Switching',
        passed: themeChanged,
        details: `Theme changed from "${bodyClass}" to "${newBodyClass}"`
      });
    }

    this.validationResults.push(...results);
    return results;
  }

  /**
   * Validate DPI scaling
   */
  async validateDPIScaling() {
    console.log('Validating DPI scaling...');
    
    const results = [];
    
    // Check element sizes at different zoom levels
    const zoomLevels = [1.0, 1.25, 1.5];
    
    for (const zoom of zoomLevels) {
      await this.page.evaluate((zoomLevel) => {
        document.body.style.zoom = zoomLevel;
      }, zoom);
      
      await this.page.waitForTimeout(500);
      
      const element = await this.page.locator('.main-content').boundingBox();
      results.push({
        test: `DPI Scaling ${zoom}x`,
        passed: element.width > 0 && element.height > 0,
        details: `Content size at ${zoom}x: ${Math.round(element.width)}x${Math.round(element.height)}`
      });
    }

    // Reset zoom
    await this.page.evaluate(() => {
      document.body.style.zoom = 1.0;
    });

    this.validationResults.push(...results);
    return results;
  }

  /**
   * Run all validations
   */
  async runValidations() {
    console.log('Starting Windows UI/UX validation...\n');
    
    await this.launchApp();
    
    const validations = [
      this.validateWindowControls(),
      this.validateMenuBar(),
      this.validateUIElements(),
      this.validateThemes(),
      this.validateDPIScaling()
    ];

    for (const validation of validations) {
      await validation;
    }

    await this.closeApp();
    
    return this.generateReport();
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n=== Windows UI/UX Validation Report ===\n');
    
    const totalTests = this.validationResults.length;
    const passedTests = this.validationResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);
    
    // Show failed tests
    const failed = this.validationResults.filter(r => !r.passed);
    if (failed.length > 0) {
      console.log('Failed Tests:');
      failed.forEach(test => {
        console.log(`❌ ${test.test}: ${test.details}`);
      });
      console.log('');
    }
    
    // Show passed tests
    const passed = this.validationResults.filter(r => r.passed);
    if (passed.length > 0) {
      console.log('Passed Tests:');
      passed.forEach(test => {
        console.log(`✅ ${test.test}: ${test.details}`);
      });
    }
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: (passedTests / totalTests) * 100,
      results: this.validationResults
    };
  }

  /**
   * Close the application
   */
  async closeApp() {
    if (this.app) {
      await this.app.close();
    }
  }
}

// Run validations if called directly
if (require.main === module) {
  const validator = new WindowsUIVAlidation();
  
  validator.runValidations().then(report => {
    process.exit(report.failed === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = WindowsUIVAlidation;