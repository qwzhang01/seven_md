## MODIFIED Requirements

### Requirement: Continuous Integration
The system SHALL run automated checks on all pull requests.

#### Scenario: Pull request validation
- **WHEN** a pull request is created or updated
- **THEN** the CI SHALL run:
  - Lint checks (ESLint, Rustfmt)
  - Type checks (TypeScript)
  - Unit tests (Vitest, Rust tests)
  - Coverage analysis
- **AND** block merge if any check fails

#### Scenario: Security audit
- **WHEN** CI runs
- **THEN** the system SHALL audit dependencies for vulnerabilities
- **AND** fail on critical vulnerabilities

### Requirement: Test automation
The system SHALL run tests automatically in CI.

#### Scenario: Frontend tests
- **WHEN** CI runs
- **THEN** all frontend tests SHALL run via `npm run test:run`
- **AND** generate coverage report

#### Scenario: Backend tests
- **WHEN** CI runs
- **THEN** all Rust tests SHALL run via `cargo test`
- **AND** fail on any test failure

#### Scenario: Coverage threshold
- **WHEN** tests complete
- **THEN** coverage SHALL meet the minimum threshold (80%)
- **AND** fail CI if below threshold

### Requirement: Coverage reporting
The system SHALL report test coverage in CI.

#### Scenario: Coverage report generation
- **WHEN** tests complete
- **THEN** coverage report SHALL be generated in lcov format
- **AND** uploaded to Codecov

#### Scenario: Coverage diff
- **WHEN** a pull request is analyzed
- **THEN** the coverage diff SHALL be displayed
- **AND** show coverage change compared to base branch

## ADDED Requirements

### Requirement: Build automation
The system SHALL automate the build process.

#### Scenario: Development build
- **WHEN** CI runs on a pull request
- **THEN** a development build SHALL be created
- **AND** verify build succeeds without errors

#### Scenario: Production build
- **WHEN** CI runs on main branch
- **THEN** a production build SHALL be created
- **AND** be optimized and minified

### Requirement: Code signing automation
The system SHALL automate code signing in CI.

#### Scenario: macOS signing
- **WHEN** CI builds for macOS production
- **THEN** the binary SHALL be signed with Developer ID certificate
- **AND** signing secrets SHALL be securely stored in CI

#### Scenario: Notarization automation
- **WHEN** the macOS build is signed
- **THEN** the binary SHALL be submitted for notarization
- **AND** wait for notarization approval

### Requirement: Release automation
The system SHALL automate release creation.

#### Scenario: Version tag creation
- **WHEN** code is merged to main
- **THEN** the system SHALL create a version tag
- **AND** generate release notes

#### Scenario: Artifact publishing
- **WHEN** a release is created
- **THEN** the system SHALL publish:
  - macOS DMG file
  - macOS APP file
  - Checksums for verification
