## ADDED Requirements

### Requirement: axe-core accessibility audit runs in Playwright tests
The system SHALL integrate axe-core into the Playwright test suite so that WCAG accessibility violations are automatically detected on every test run.

#### Scenario: axe audit runs on each page-level test
- **WHEN** a Playwright test navigates to or renders a page or major view
- **THEN** `checkA11y()` from `@axe-core/playwright` SHALL be called against that page
- **AND** the test SHALL fail if any axe rule violations are reported

#### Scenario: axe violations produce actionable output
- **WHEN** an axe violation is detected
- **THEN** the test output SHALL include the violated WCAG rule ID, the affected element selector, and a description of the issue

#### Scenario: CodeMirror editor internals are excluded from axe audit
- **WHEN** the axe audit runs on a page containing the editor
- **THEN** the `.cm-editor` subtree SHALL be excluded from the audit scope
- **AND** the exclusion SHALL be documented in the test helper

### Requirement: axe-core audit configuration is centralized
The system SHALL provide a shared axe configuration so that all tests use consistent rules and exclusions.

#### Scenario: Shared axe config is imported by all page tests
- **WHEN** a new page-level Playwright test is added
- **THEN** it SHALL import and use the shared axe configuration rather than defining its own rules

#### Scenario: axe rule set targets WCAG 2.1 AA
- **WHEN** the shared axe configuration is applied
- **THEN** it SHALL enable the `wcag2a` and `wcag2aa` rule sets at minimum

### Requirement: New accessibility violations block merging
The system SHALL treat axe-core violations as test failures that block pull request merges.

#### Scenario: PR with new axe violation is blocked
- **WHEN** a pull request introduces a new axe-core violation
- **THEN** the CI accessibility test job SHALL fail
- **AND** the pull request SHALL not be mergeable until the violation is resolved
