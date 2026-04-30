## MODIFIED Requirements

### Requirement: Help menu opens Welcome dialog
The system SHALL display a "欢迎使用 Seven Markdown" modal dialog when the user clicks the corresponding Help menu item. The recent documents list SHALL be populated from actual file open history.

#### Scenario: Open Welcome dialog from Help menu
- **WHEN** user clicks "欢迎页" in the Help menu
- **THEN** a modal dialog SHALL appear with title "欢迎使用 Seven Markdown"
- **AND** the dialog SHALL display: application name, slogan "Write Markdown Like Code", ME Logo icon (blue-purple gradient)

#### Scenario: Welcome dialog shows quick actions
- **WHEN** the Welcome dialog is displayed
- **THEN** the dialog SHALL display three quick action buttons: "新建文件", "打开文件", "打开文件夹"
- **AND** clicking each button SHALL trigger the corresponding file/folder operation

#### Scenario: Welcome dialog shows recent documents populated from open history
- **WHEN** the Welcome dialog is displayed
- **AND** user has previously opened files
- **THEN** the dialog SHALL display up to 5 recent documents from `localStorage` key `recent-documents`
- **AND** each entry SHALL show: file name, file path (truncated), last opened time
- **AND** clicking a recent document SHALL dispatch `app:open-recent` event with the file path
- **AND** the file SHALL be opened in the editor

#### Scenario: Welcome dialog shows empty state when no recent documents
- **WHEN** the Welcome dialog is displayed
- **AND** no files have been opened previously
- **THEN** the dialog SHALL display "暂无最近文档" placeholder text

#### Scenario: Close Welcome dialog
- **WHEN** the Welcome dialog is open
- **AND** user presses Escape or clicks the overlay backdrop or clicks the close button
- **THEN** the dialog SHALL close
