// Platform detection utilities

/**
 * Platform types supported by the application
 */
export type Platform = 'windows' | 'macos' | 'linux' | 'unknown';

/**
 * Detects the current platform based on user agent and other indicators
 * @returns The detected platform
 */
export function detectPlatform(): Platform {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) {
    return 'windows';
  }
  
  if (userAgent.includes('mac')) {
    return 'macos';
  }
  
  if (userAgent.includes('linux')) {
    return 'linux';
  }
  
  return 'unknown';
}

/**
 * Checks if the current platform is Windows
 * @returns True if running on Windows
 */
export function isWindows(): boolean {
  return detectPlatform() === 'windows';
}

/**
 * Checks if the current platform is macOS
 * @returns True if running on macOS
 */
export function isMacOS(): boolean {
  return detectPlatform() === 'macos';
}

/**
 * Checks if the current platform is Linux
 * @returns True if running on Linux
 */
export function isLinux(): boolean {
  return detectPlatform() === 'linux';
}

/**
 * Gets platform-specific CSS class names for styling
 * @returns Object with platform-specific CSS classes
 */
export function getPlatformClasses(): { [key: string]: boolean } {
  const platform = detectPlatform();
  
  return {
    'platform-windows': platform === 'windows',
    'platform-macos': platform === 'macos',
    'platform-linux': platform === 'linux',
    'platform-unknown': platform === 'unknown'
  };
}

/**
 * Gets platform-specific configuration
 * @returns Platform-specific configuration object
 */
export function getPlatformConfig() {
  const platform = detectPlatform();
  
  return {
    pathSeparator: platform === 'windows' ? '\\' : '/',
    lineEnding: platform === 'windows' ? '\r\n' : '\n',
    isDesktop: true // Tauri apps are always desktop
  };
}