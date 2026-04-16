# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Windows Support**: Full Windows platform support with native UI/UX adaptations
  - Windows-specific menu bar styling and window controls
  - DPI scaling support for high-resolution displays
  - Dark/light theme compatibility on Windows
  - Cross-platform file system operations with Windows path support
  - Windows installer packaging and distribution

### Changed
- Updated Tauri configuration for multi-platform support
- Enhanced build system with Windows cross-compilation support
- Improved file path handling to support both Windows (\\) and Unix (/) separators
- Added Windows-specific CI/CD pipeline with GitHub Actions

### Technical Details
- Added Windows Rust toolchain (x86_64-pc-windows-msvc)
- Created comprehensive Windows testing suite
- Implemented platform detection utilities
- Updated documentation with Windows installation guide

## [0.1.0] - 2024-XX-XX

### Added

- Initial release
- Basic Markdown rendering
- File open and save functionality
- Real-time preview
- Theme switching support

[Unreleased]: https://github.com/username/seven_md/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/username/seven_md/releases/tag/v0.1.0
