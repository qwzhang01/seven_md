## ADDED Requirements

### Requirement: AI button displays icon with text label
The system SHALL display the AI assistant button in the toolbar with both an icon and text label.

#### Scenario: AI button shows icon and label
- **WHEN** the toolbar is rendered
- **THEN** the AI button SHALL display a Bot icon followed by the text "AI"
- **AND** the text label SHALL use the same styling as the icon (14px font size)
- **AND** the tooltip SHALL show "AI 助手" on hover

#### Scenario: AI button opens AI panel
- **WHEN** user clicks the AI button
- **THEN** the AI assistant panel SHALL open on the right side of the editor
- **AND** the button SHALL show an activated visual state while the panel is open
