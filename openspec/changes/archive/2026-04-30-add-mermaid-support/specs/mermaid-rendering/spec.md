## ADDED Requirements

### Requirement: Preview renders Mermaid fenced code blocks as diagrams
The system SHALL detect fenced code blocks tagged with `mermaid` language identifier and render them as SVG diagrams using the Mermaid library.

#### Scenario: Flowchart renders correctly
- **WHEN** the document contains a fenced code block with ` ```mermaid ` and valid flowchart syntax
- **THEN** the preview pane SHALL display an SVG flowchart diagram in place of the raw code block

#### Scenario: Sequence diagram renders correctly
- **WHEN** the document contains a fenced code block with ` ```mermaid ` and valid sequence diagram syntax
- **THEN** the preview pane SHALL display an SVG sequence diagram in place of the raw code block

#### Scenario: ER diagram renders correctly
- **WHEN** the document contains a fenced code block with ` ```mermaid ` and valid ER diagram syntax
- **THEN** the preview pane SHALL display an SVG ER diagram in place of the raw code block

#### Scenario: Multiple Mermaid blocks render independently
- **WHEN** the document contains more than one ` ```mermaid ` block
- **THEN** each block SHALL render as its own independent SVG diagram
- **AND** a rendering error in one block SHALL NOT prevent other blocks from rendering

### Requirement: Mermaid diagrams respect the active application theme
The system SHALL apply a Mermaid color theme that matches the active application theme.

#### Scenario: Dark theme diagram
- **WHEN** the active application theme is a dark variant
- **THEN** Mermaid diagrams SHALL use the `dark` Mermaid theme

#### Scenario: Light theme diagram
- **WHEN** the active application theme is a light variant
- **THEN** Mermaid diagrams SHALL use the `default` (light) Mermaid theme

#### Scenario: Theme change updates diagrams
- **WHEN** the user switches the application theme while a document with Mermaid blocks is open
- **THEN** all Mermaid diagrams in the preview SHALL re-render with the new theme colors

### Requirement: Mermaid syntax errors display an inline error message
The system SHALL handle invalid Mermaid syntax gracefully without crashing the preview pane.

#### Scenario: Invalid Mermaid syntax shows error
- **WHEN** a ` ```mermaid ` block contains invalid or unparseable Mermaid syntax
- **THEN** the preview pane SHALL display an inline error message in place of the diagram
- **AND** the error message SHALL be visually distinct (e.g., red border or error icon)
- **AND** the rest of the document preview SHALL continue to render normally

#### Scenario: Empty Mermaid block
- **WHEN** a ` ```mermaid ` block is empty or contains only whitespace
- **THEN** the preview pane SHALL display an inline placeholder or error message
- **AND** the preview SHALL NOT crash or show a blank invisible element

### Requirement: Mermaid library is loaded lazily
The system SHALL load the Mermaid library only when a Mermaid block is first encountered, to avoid impacting initial application load time.

#### Scenario: No Mermaid blocks — library not loaded
- **WHEN** the document contains no ` ```mermaid ` fenced blocks
- **THEN** the Mermaid library bundle SHALL NOT be loaded or executed

#### Scenario: First Mermaid block triggers library load
- **WHEN** the document contains at least one ` ```mermaid ` block
- **THEN** the Mermaid library SHALL be dynamically imported on first render
- **AND** a loading placeholder SHALL be shown until the diagram is ready
