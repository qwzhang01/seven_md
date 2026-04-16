// Cross-platform path utilities
import { getPlatformConfig } from './platform';

/**
 * Normalizes a path to use the correct platform-specific separator
 * @param path The path to normalize
 * @returns Normalized path with correct separators
 */
export function normalizePath(path: string): string {
  const { pathSeparator } = getPlatformConfig();
  
  // Replace all forward and backward slashes with platform-specific separator
  return path.replace(/[\\/]/g, pathSeparator);
}

/**
 * Joins path segments using platform-specific separator
 * @param segments Path segments to join
 * @returns Joined path
 */
export function joinPath(...segments: string[]): string {
  const { pathSeparator } = getPlatformConfig();
  
  return segments
    .map(segment => segment.replace(/[\\/]+$/, '')) // Remove trailing separators
    .filter(segment => segment.length > 0) // Remove empty segments
    .join(pathSeparator);
}

/**
 * Gets the directory name from a path
 * @param path The file path
 * @returns Directory name
 */
export function dirname(path: string): string {
  const { pathSeparator } = getPlatformConfig();
  const normalizedPath = normalizePath(path);
  
  const lastSeparatorIndex = normalizedPath.lastIndexOf(pathSeparator);
  if (lastSeparatorIndex === -1) {
    return '';
  }
  
  return normalizedPath.substring(0, lastSeparatorIndex);
}

/**
 * Gets the base name from a path
 * @param path The file path
 * @returns Base name (file name with extension)
 */
export function basename(path: string): string {
  const { pathSeparator } = getPlatformConfig();
  const normalizedPath = normalizePath(path);
  
  const lastSeparatorIndex = normalizedPath.lastIndexOf(pathSeparator);
  if (lastSeparatorIndex === -1) {
    return normalizedPath;
  }
  
  return normalizedPath.substring(lastSeparatorIndex + 1);
}

/**
 * Gets the file extension from a path
 * @param path The file path
 * @returns File extension (without the dot)
 */
export function extname(path: string): string {
  const base = basename(path);
  const lastDotIndex = base.lastIndexOf('.');
  
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return '';
  }
  
  return base.substring(lastDotIndex + 1);
}

/**
 * Checks if a path is absolute
 * @param path The path to check
 * @returns True if the path is absolute
 */
export function isAbsolutePath(path: string): boolean {
  const { pathSeparator } = getPlatformConfig();
  const normalizedPath = normalizePath(path);
  
  // Windows absolute path: drive letter + separator (C:\)
  if (/^[A-Za-z]:[\\/]/.test(path)) {
    return true;
  }
  
  // Unix absolute path: starts with /
  if (path.startsWith('/')) {
    return true;
  }
  
  return false;
}

/**
 * Resolves a relative path against a base path
 * @param basePath The base path
 * @param relativePath The relative path to resolve
 * @returns Resolved absolute path
 */
export function resolvePath(basePath: string, relativePath: string): string {
  if (isAbsolutePath(relativePath)) {
    return normalizePath(relativePath);
  }
  
  return joinPath(basePath, relativePath);
}

/**
 * Converts a path to a format suitable for display
 * @param path The path to format
 * @returns Formatted path for display
 */
export function formatPathForDisplay(path: string): string {
  const { pathSeparator } = getPlatformConfig();
  
  // On Windows, show forward slashes for better readability
  if (pathSeparator === '\\') {
    return path.replace(/\\/g, '/');
  }
  
  return path;
}