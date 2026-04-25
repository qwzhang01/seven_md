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
The system SHALL allow navigation to document sections by clicking outline items.

#### Scenario: Click heading to navigate
- **WHEN** user clicks a heading in the outline panel
- **THEN** the editor SHALL scroll to position that heading at the top of the viewport
- **AND** the cursor SHALL be placed at the beginning of that heading line

#### Scenario: Active heading highlighted
- **WHEN** the cursor is positioned within or after a particular heading's section
- **THEN** the corresponding heading in the outline SHALL be visually highlighted

### Requirement: Empty document shows empty state
The system SHALL handle documents with no headings gracefully.

#### Scenario: No headings in document
- **WHEN** the current document contains no heading elements (H1-H6)
- **THEN** the outline panel SHALL display an empty state message: "文档中没有标题"
- **AND** no error SHALL be thrown
