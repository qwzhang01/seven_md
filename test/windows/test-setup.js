// Windows Test Environment Setup
// This script sets up the Windows testing environment

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WindowsTestSetup {
  constructor() {
    this.tempDir = path.join(process.env.TEMP || '/tmp', 'seven-md-tests');
    this.testDataDir = path.join(this.tempDir, 'test-data');
  }

  /**
   * Setup test environment
   */
  setup() {
    console.log('Setting up Windows test environment...');
    
    // Create test directories
    this.createTestDirectories();
    
    // Create test files
    this.createTestFiles();
    
    // Setup environment variables
    this.setupEnvironment();
    
    console.log('Windows test environment setup complete.');
  }

  /**
   * Create test directories
   */
  createTestDirectories() {
    const directories = [
      this.tempDir,
      this.testDataDir,
      path.join(this.testDataDir, 'markdown'),
      path.join(this.testDataDir, 'images'),
      path.join(this.testDataDir, 'exports')
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
  }

  /**
   * Create test files
   */
  createTestFiles() {
    const testFiles = {
      'basic.md': '# Test Document\n\nThis is a test markdown file.\n\n- Item 1\n- Item 2\n- Item 3',
      'complex.md': `# Complex Test\n\n## Section 1\n\nSome **bold** and *italic* text.\n\n\`\`\`javascript\nconsole.log("Hello World");\n\`\`\`\n\n## Section 2\n\n> This is a blockquote\n\n[Link to Google](https://google.com)`,
      'windows-paths.md': '# Windows Path Test\n\nTesting Windows path handling:\n- C:\\Users\\Test\\Documents\\file.md\n- D:\\Projects\\seven_md\\src\\main.ts'
    };

    Object.entries(testFiles).forEach(([filename, content]) => {
      const filePath = path.join(this.testDataDir, 'markdown', filename);
      fs.writeFileSync(filePath, content);
      console.log(`Created test file: ${filePath}`);
    });
  }

  /**
   * Setup environment variables
   */
  setupEnvironment() {
    // Set test-specific environment variables
    process.env.TEST_MODE = 'windows';
    process.env.TEST_DATA_DIR = this.testDataDir;
    process.env.TEST_TEMP_DIR = this.tempDir;
    
    // Windows-specific environment variables
    process.env.PLATFORM = 'windows';
    process.env.PATH_SEPARATOR = '\\';
  }

  /**
   * Cleanup test environment
   */
  cleanup() {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
      console.log('Cleaned up test environment.');
    }
  }

  /**
   * Run Windows-specific tests
   */
  runTests() {
    console.log('Running Windows-specific tests...');
    
    try {
      // Run unit tests
      execSync('npm run test:windows', { stdio: 'inherit' });
      
      // Run E2E tests
      execSync('npm run test:e2e:windows', { stdio: 'inherit' });
      
      console.log('All Windows tests passed!');
    } catch (error) {
      console.error('Windows tests failed:', error.message);
      process.exit(1);
    }
  }
}

// Export for use in tests
module.exports = WindowsTestSetup;

// Run setup if called directly
if (require.main === module) {
  const setup = new WindowsTestSetup();
  
  const command = process.argv[2];
  switch (command) {
    case 'setup':
      setup.setup();
      break;
    case 'cleanup':
      setup.cleanup();
      break;
    case 'test':
      setup.setup();
      setup.runTests();
      setup.cleanup();
      break;
    default:
      console.log('Usage: node test-setup.js [setup|cleanup|test]');
      break;
  }
}