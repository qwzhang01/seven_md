// Windows Installation and Uninstallation Tests
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class WindowsInstallTest {
  constructor() {
    this.installerDir = path.join(__dirname, '../../src-tauri/target/release/bundle');
    this.testInstallDir = path.join(os.tmpdir(), 'seven-md-test-install');
    this.registryKeys = [];
  }

  /**
   * Test NSIS installer
   */
  async testNSISInstaller() {
    console.log('Testing NSIS installer...');
    
    const nsisInstaller = path.join(this.installerDir, 'nsis', 'SevenMD_0.0.0_x64-setup.exe');
    
    if (!fs.existsSync(nsisInstaller)) {
      console.log('NSIS installer not found, skipping test');
      return false;
    }

    try {
      // Test silent installation
      console.log('Running silent installation...');
      execSync(`"${nsisInstaller}" /S /D=${this.testInstallDir}`, {
        stdio: 'inherit'
      });

      // Verify installation
      const installedFiles = this.verifyInstallation();
      console.log(`Installed ${installedFiles.length} files`);

      // Test silent uninstallation
      console.log('Testing uninstallation...');
      const uninstaller = path.join(this.testInstallDir, 'uninstall.exe');
      if (fs.existsSync(uninstaller)) {
        execSync(`"${uninstaller}" /S`, { stdio: 'inherit' });
      }

      // Verify uninstallation
      const remainingFiles = this.verifyUninstallation();
      console.log(`Remaining files after uninstall: ${remainingFiles.length}`);

      return true;
    } catch (error) {
      console.error('NSIS installer test failed:', error.message);
      return false;
    }
  }

  /**
   * Test MSI installer
   */
  async testMSIInstaller() {
    console.log('Testing MSI installer...');
    
    const msiInstaller = path.join(this.installerDir, 'msi', 'SevenMD_0.0.0_x64.msi');
    
    if (!fs.existsSync(msiInstaller)) {
      console.log('MSI installer not found, skipping test');
      return false;
    }

    try {
      // Test MSI installation
      console.log('Installing MSI package...');
      execSync(`msiexec /i "${msiInstaller}" /qn INSTALLDIR="${this.testInstallDir}"`, {
        stdio: 'inherit'
      });

      // Verify installation
      const installedFiles = this.verifyInstallation();
      console.log(`Installed ${installedFiles.length} files`);

      // Test MSI uninstallation
      console.log('Uninstalling MSI package...');
      const productCode = this.getMSIProductCode(msiInstaller);
      if (productCode) {
        execSync(`msiexec /x ${productCode} /qn`, { stdio: 'inherit' });
      }

      // Verify uninstallation
      const remainingFiles = this.verifyUninstallation();
      console.log(`Remaining files after uninstall: ${remainingFiles.length}`);

      return true;
    } catch (error) {
      console.error('MSI installer test failed:', error.message);
      return false;
    }
  }

  /**
   * Get MSI product code
   */
  getMSIProductCode(msiPath) {
    try {
      const result = execSync(`powershell "(Get-WmiObject -Class Win32_Product | Where-Object { $_.Name -eq 'Seven MD' }).IdentifyingNumber"`);
      return result.toString().trim();
    } catch (error) {
      console.log('Could not get MSI product code:', error.message);
      return null;
    }
  }

  /**
   * Verify installation
   */
  verifyInstallation() {
    const installedFiles = [];
    
    if (fs.existsSync(this.testInstallDir)) {
      const files = this.getAllFiles(this.testInstallDir);
      installedFiles.push(...files);
    }

    // Check start menu shortcuts
    const startMenuPath = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs');
    if (fs.existsSync(startMenuPath)) {
      const startMenuFiles = this.getAllFiles(startMenuPath);
      installedFiles.push(...startMenuFiles.filter(file => file.includes('Seven MD')));
    }

    // Check desktop shortcut
    const desktopPath = path.join(process.env.USERPROFILE, 'Desktop');
    if (fs.existsSync(desktopPath)) {
      const desktopFiles = fs.readdirSync(desktopPath);
      installedFiles.push(...desktopFiles.filter(file => file.includes('Seven MD')));
    }

    return installedFiles;
  }

  /**
   * Verify uninstallation
   */
  verifyUninstallation() {
    const remainingFiles = [];
    
    if (fs.existsSync(this.testInstallDir)) {
      const files = this.getAllFiles(this.testInstallDir);
      remainingFiles.push(...files);
    }

    // Check registry cleanup
    const registryKeys = this.checkRegistryKeys();
    remainingFiles.push(...registryKeys);

    return remainingFiles;
  }

  /**
   * Get all files in directory recursively
   */
  getAllFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        results = results.concat(this.getAllFiles(filePath));
      } else {
        results.push(filePath);
      }
    });
    
    return results;
  }

  /**
   * Check registry keys
   */
  checkRegistryKeys() {
    const remainingKeys = [];
    
    try {
      // Check HKCU registry
      const hkcuResult = execSync('reg query "HKCU\\Software\\Seven MD" /s 2>nul', { encoding: 'utf8' });
      if (hkcuResult && hkcuResult.trim()) {
        remainingKeys.push('HKCU registry keys found');
      }
    } catch (error) {
      // Registry key not found is expected after uninstall
    }

    return remainingKeys;
  }

  /**
   * Run all installation tests
   */
  async runTests() {
    console.log('Starting Windows installation tests...\n');

    const results = {
      nsis: await this.testNSISInstaller(),
      msi: await this.testMSIInstaller()
    };

    console.log('\n=== Test Results ===');
    console.log(`NSIS Installer: ${results.nsis ? 'PASS' : 'FAIL'}`);
    console.log(`MSI Installer: ${results.msi ? 'PASS' : 'FAIL'}`);

    // Cleanup
    this.cleanup();

    return Object.values(results).every(result => result);
  }

  /**
   * Cleanup test files
   */
  cleanup() {
    if (fs.existsSync(this.testInstallDir)) {
      fs.rmSync(this.testInstallDir, { recursive: true, force: true });
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const test = new WindowsInstallTest();
  
  test.runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = WindowsInstallTest;