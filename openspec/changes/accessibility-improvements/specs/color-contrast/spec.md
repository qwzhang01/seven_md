## ADDED Requirements

### Requirement: UI colors meet WCAG 2.1 AA contrast ratios
The system SHALL ensure all foreground/background color combinations in the UI meet WCAG 2.1 AA minimum contrast ratios: 4.5:1 for normal text (below 18pt / 14pt bold) and 3:1 for large text and UI components.

#### Scenario: Normal text passes 4.5:1 contrast
- **WHEN** any text element smaller than 18pt (or 14pt bold) is rendered
- **THEN** the contrast ratio between the text color and its background SHALL be at least 4.5:1

#### Scenario: Large text passes 3:1 contrast
- **WHEN** any text element is 18pt or larger (or 14pt bold or larger)
- **THEN** the contrast ratio between the text color and its background SHALL be at least 3:1

#### Scenario: UI component boundaries pass 3:1 contrast
- **WHEN** a UI component (button, input, icon, focus indicator) is rendered
- **THEN** the contrast ratio between the component boundary and its adjacent background SHALL be at least 3:1

### Requirement: Color contrast is defined via design tokens
The system SHALL define all UI colors as CSS custom properties (design tokens) in a central theme file so that contrast compliance can be audited and updated in one place.

#### Scenario: Theme tokens are the sole source of color
- **WHEN** a component needs a color value
- **THEN** it SHALL reference a CSS custom property from the theme token file rather than using a hardcoded color value

#### Scenario: Token names reflect semantic role
- **WHEN** a color token is defined
- **THEN** its name SHALL describe its semantic role (e.g., `--color-text-primary`, `--color-bg-surface`) rather than its raw value (e.g., `--gray-500`)

### Requirement: Contrast ratios are verified in CI
The system SHALL include automated contrast ratio checks so that regressions are caught before merging.

#### Scenario: Contrast check runs on pull request
- **WHEN** a pull request modifies theme token files
- **THEN** the CI pipeline SHALL run a contrast ratio audit and fail if any token combination falls below the required threshold
