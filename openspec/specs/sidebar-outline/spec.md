## ADDED Requirements

### Requirement: Outline panel displays document heading structure
The system SHALL display an outline panel showing the hierarchical heading structure of the currently active document.

#### Scenario: Outline panel layout
- **WHEN** the outline panel is active via activity bar
- **THEN** it SHALL display:
  - A header titled "大纲"
  - A tree list of all headings (H1-H4) found in the current document
- **AND** headings SHALL be indented according to their level (H1 at root, H2-H4 indented)

#### Scenario: Heading levels differentiated by color
- **WHEN** headings are displayed in the outline
- **THEN** each heading level SHALL use a distinct color:
  - H1: primary accent color
  - H2: slightly lighter shade
  - H3: secondary text color
  - H4: tertiary/muted color

### Requirement: Outline updates automatically
The system SHALL automatically refresh the outline when the document content changes.

#### Scenario: Content change triggers update
- **WHEN** the user edits the current document (adds/removes/modifies headings)
- **THEN** the outline panel SHALL automatically update within 300ms
- **AND** new headings SHALL appear, removed headings SHALL disappear
- **AND** modified headings SHALL reflect their new text

#### Scenario: Switching files updates outline
- **WHEN** user switches to a different file/tab
- **THEN** the outline SHALL immediately update to show the new file's heading structure

### Requirement: Clicking outline item navigates to heading
The system SHALL allow navigation to document sections by clicking outline items, in all view modes.

#### Scenario: Click heading navigates in editor-only mode
- **WHEN** the current view mode is `editor-only`
- **AND** user clicks a heading in the outline panel
- **THEN** the editor SHALL scroll to position that heading line at the center of the viewport
- **AND** the cursor SHALL be placed at the beginning of that heading line
- **AND** the editor SHALL receive focus

#### Scenario: Click heading navigates in preview-only mode
- **WHEN** the current view mode is `preview-only`
- **AND** user clicks a heading in the outline panel
- **THEN** the preview pane SHALL scroll to the corresponding heading element (matched by heading text/id)
- **AND** the heading element SHALL be briefly highlighted to indicate navigation target

#### Scenario: Click heading navigates in split mode
- **WHEN** the current view mode is `split`
- **AND** user clicks a heading in the outline panel
- **THEN** the editor SHALL scroll to position that heading line at the center of the viewport
- **AND** the cursor SHALL be placed at the beginning of that heading line
- **AND** the preview pane SHALL also scroll to the corresponding heading element

#### Scenario: Active heading highlighted in outline
- **WHEN** user clicks a heading in the outline panel
- **THEN** the clicked heading item SHALL be visually highlighted with an active background color
- **AND** previously active heading SHALL lose its highlight

#### Scenario: Navigation works when editor is still initializing
- **WHEN** user clicks a heading in the outline panel very quickly after switching to a tab
- **AND** the editor view instance has not yet fully initialized
- **THEN** the navigation request SHALL be queued and executed once the editor is ready
- **OR** a retry mechanism SHALL attempt navigation after a short delay (100ms)

### Requirement: Empty document shows empty state
The system SHALL handle documents with no headings gracefully.

#### Scenario: No headings in document
- **WHEN** the current document contains no heading elements (H1-H6)
- **THEN** the outline panel SHALL display an empty state message: "文档中没有标题"
- **AND** no error SHALL be thrown
