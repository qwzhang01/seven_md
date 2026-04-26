## ADDED Requirements

### Requirement: Content Security Policy
The system SHALL implement a strict Content Security Policy (CSP).

#### Scenario: CSP header configuration
- **WHEN** the application loads
- **THEN** the CSP SHALL restrict:
  - Scripts to 'self' only
  - Styles to 'self' and inline styles
  - Images to 'self', data:, and blob: URIs
  - Fonts to 'self'
  - Connections to 'self' and allowed external domains

#### Scenario: CSP violation reporting
- **WHEN** a CSP violation occurs
- **THEN** the system SHALL log the violation
- **AND** display a warning in development mode

### Requirement: Code signing
The system SHALL sign the application binary for macOS.

#### Scenario: macOS code signing
- **WHEN** building the application for production
- **THEN** the binary SHALL be signed with a valid Developer ID Application certificate
- **AND** the signature SHALL be verifiable by macOS Gatekeeper

#### Scenario: Notarization
- **WHEN** the application is built and signed
- **THEN** the binary SHALL be notarized with Apple
- **AND** receive a notarization ticket from Apple

### Requirement: Hardened Runtime
The system SHALL enable Hardened Runtime for macOS builds.

#### Scenario: Hardened Runtime enablement
- **WHEN** building for macOS production
- **THEN** Hardened Runtime SHALL be enabled
- **AND** only necessary entitlements SHALL be granted

#### Scenario: Entitlements configuration
- **WHEN** the application requires specific system access
- **THEN** entitlements SHALL be explicitly declared:
  - File read/write access for user documents
  - Network access for allowed external domains

### Requirement: Tauri permissions
The system SHALL minimize Tauri API permissions.

#### Scenario: Permission allowlist
- **WHEN** the application requests Tauri API access
- **THEN** only explicitly allowed APIs SHALL be accessible
- **AND** the allowlist SHALL include:
  - fs: read/write for user-selected directories only
  - dialog: open/save dialogs
  - window: window controls
  - shell: open external links (restricted)

#### Scenario: Forbidden APIs
- **WHEN** the application attempts to use non-allowed APIs
- **THEN** the API call SHALL be blocked
- **AND** an error SHALL be logged

### Requirement: Input validation
The system SHALL validate all user inputs and file paths.

#### Scenario: File path validation
- **WHEN** user attempts to open a file
- **THEN** the system SHALL validate:
  - Path is within allowed directories
  - Path does not contain traversal sequences (../)
  - File extension is allowed (.md, .txt, .markdown)

#### Scenario: Input sanitization
- **WHEN** user provides text input
- **THEN** the input SHALL be sanitized to prevent:
  - XSS attacks
  - Injection attacks
  - Path traversal

### Requirement: Secure defaults
The system SHALL use secure configuration defaults.

#### Scenario: HTTPS enforcement
- **WHEN** the application makes network requests
- **THEN** HTTPS SHALL be enforced
- **AND** HTTP requests SHALL be blocked or redirected

#### Scenario: Dependency security
- **WHEN** dependencies are installed
- **THEN** the system SHALL audit for known vulnerabilities
- **AND** fail the build if critical vulnerabilities are found

### Requirement: Security documentation
The system SHALL document security practices.

#### Scenario: Security policy
- **WHEN** a security issue is reported
- **THEN** the SECURITY.md SHALL provide:
  - Supported versions
  - Reporting process
  - Response timeline
