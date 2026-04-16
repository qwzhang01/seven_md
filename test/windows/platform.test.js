// Windows-specific unit tests
const { detectPlatform, isWindows, isMacOS, isLinux, getPlatformClasses, getPlatformConfig } = require('../../src/utils/platform');
const { normalizePath, joinPath, dirname, basename, extname, isAbsolutePath, resolvePath, formatPathForDisplay } = require('../../src/utils/pathUtils');

describe('Windows Platform Detection', () => {
  beforeEach(() => {
    // Mock Windows user agent
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true
    });
  });

  test('detectPlatform returns windows for Windows user agent', () => {
    expect(detectPlatform()).toBe('windows');
  });

  test('isWindows returns true for Windows', () => {
    expect(isWindows()).toBe(true);
  });

  test('isMacOS returns false for Windows', () => {
    expect(isMacOS()).toBe(false);
  });

  test('isLinux returns false for Windows', () => {
    expect(isLinux()).toBe(false);
  });

  test('getPlatformClasses returns windows class for Windows', () => {
    const classes = getPlatformClasses();
    expect(classes['platform-windows']).toBe(true);
    expect(classes['platform-macos']).toBe(false);
    expect(classes['platform-linux']).toBe(false);
  });

  test('getPlatformConfig returns Windows-specific configuration', () => {
    const config = getPlatformConfig();
    expect(config.pathSeparator).toBe('\\');
    expect(config.lineEnding).toBe('\r\n');
    expect(config.isDesktop).toBe(true);
  });
});

describe('Windows Path Handling', () => {
  test('normalizePath converts forward slashes to backslashes on Windows', () => {
    expect(normalizePath('C:/Users/Test/Documents/file.md')).toBe('C:\\Users\\Test\\Documents\\file.md');
    expect(normalizePath('D:\\Projects\\seven_md\\src\\main.ts')).toBe('D:\\Projects\\seven_md\\src\\main.ts');
  });

  test('joinPath uses backslashes on Windows', () => {
    expect(joinPath('C:\\Users', 'Test', 'Documents')).toBe('C:\\Users\\Test\\Documents');
    expect(joinPath('D:\\Projects', 'seven_md', 'src', 'main.ts')).toBe('D:\\Projects\\seven_md\\src\\main.ts');
  });

  test('dirname handles Windows paths correctly', () => {
    expect(dirname('C:\\Users\\Test\\Documents\\file.md')).toBe('C:\\Users\\Test\\Documents');
    expect(dirname('D:\\Projects\\seven_md\\src\\main.ts')).toBe('D:\\Projects\\seven_md\\src');
  });

  test('basename extracts filename from Windows paths', () => {
    expect(basename('C:\\Users\\Test\\Documents\\file.md')).toBe('file.md');
    expect(basename('D:\\Projects\\seven_md\\src\\main.ts')).toBe('main.ts');
  });

  test('extname extracts extension from Windows paths', () => {
    expect(extname('C:\\Users\\Test\\Documents\\file.md')).toBe('md');
    expect(extname('D:\\Projects\\seven_md\\src\\main.ts')).toBe('ts');
  });

  test('isAbsolutePath identifies Windows absolute paths', () => {
    expect(isAbsolutePath('C:\\Users\\Test\\file.md')).toBe(true);
    expect(isAbsolutePath('D:\\Projects\\app.exe')).toBe(true);
    expect(isAbsolutePath('relative\\path\\file.md')).toBe(false);
    expect(isAbsolutePath('file.md')).toBe(false);
  });

  test('resolvePath handles Windows paths correctly', () => {
    expect(resolvePath('C:\\Users\\Test', 'Documents\\file.md')).toBe('C:\\Users\\Test\\Documents\\file.md');
    expect(resolvePath('D:\\Projects', '..\\other\\app.exe')).toBe('D:\\Projects\\..\\other\\app.exe');
  });

  test('formatPathForDisplay converts backslashes to forward slashes for display', () => {
    expect(formatPathForDisplay('C:\\Users\\Test\\file.md')).toBe('C:/Users/Test/file.md');
    expect(formatPathForDisplay('D:\\Projects\\app.exe')).toBe('D:/Projects/app.exe');
  });
});

describe('Windows File System Operations', () => {
  test('handles Windows special folders', () => {
    // Test common Windows special folder paths
    const specialFolders = [
      'C:\\Users\\Test\\Documents',
      'C:\\Users\\Test\\Desktop', 
      'C:\\Users\\Test\\Downloads',
      'C:\\Program Files',
      'C:\\Windows'
    ];

    specialFolders.forEach(folder => {
      expect(isAbsolutePath(folder)).toBe(true);
      expect(basename(folder)).toBe(folder.split('\\').pop());
    });
  });

  test('handles network paths on Windows', () => {
    const networkPaths = [
      '\\\\server\\share\\file.md',
      '\\\\192.168.1.1\\shared\\document.docx'
    ];

    networkPaths.forEach(path => {
      expect(isAbsolutePath(path)).toBe(true);
    });
  });
});

describe('Cross-Platform Compatibility', () => {
  test('path utilities handle mixed separators', () => {
    // Mixed separators should be normalized correctly
    expect(normalizePath('C:/Users\\Test/Documents\\file.md')).toBe('C:\\Users\\Test\\Documents\\file.md');
    expect(normalizePath('D:\\Projects/seven_md/src\\main.ts')).toBe('D:\\Projects\\seven_md\\src\\main.ts');
  });

  test('platform detection falls back gracefully', () => {
    // Test with unknown user agent
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Unknown Browser',
      writable: true
    });

    expect(detectPlatform()).toBe('unknown');
    expect(getPlatformClasses()['platform-unknown']).toBe(true);
  });
});