## MODIFIED Requirements

### Requirement: Help menu opens Welcome dialog
The system SHALL display a "欢迎使用 Seven Markdown" modal dialog when the user clicks the corresponding Help menu item. The recent documents list SHALL carry type information to correctly open files or folders.

#### Scenario: Open Welcome dialog from Help menu
- **WHEN** user clicks "欢迎页" in the Help menu
- **THEN** a modal dialog SHALL appear with title "欢迎使用 Seven Markdown"
- **AND** the dialog SHALL display: application name, slogan "Write Markdown Like Code", ME Logo icon (blue-purple gradient)

#### Scenario: Welcome dialog shows quick actions
- **WHEN** the Welcome dialog is displayed
- **THEN** the dialog SHALL display three quick action buttons: "新建文件", "打开文件", "打开文件夹"
- **AND** clicking each button SHALL trigger the corresponding file/folder operation

#### Scenario: Welcome dialog shows recent documents with type-aware icons
- **WHEN** the Welcome dialog is displayed
- **AND** user has previously opened files or folders
- **THEN** the dialog SHALL display up to 5 recent documents from `localStorage` key `recent-documents`
- **AND** each entry SHALL show: file/folder name, path (truncated), last opened time
- **AND** entries with `type: 'file'` SHALL display a file icon (`FileText`)
- **AND** entries with `type: 'folder'` SHALL display a folder icon (`FolderOpen`)
- **AND** clicking a recent document SHALL dispatch `app:open-recent` event with `{ path, type }` as detail
- **AND** the system SHALL open the file or folder according to the `type` field

#### Scenario: Welcome dialog shows empty state when no recent documents
- **WHEN** the Welcome dialog is displayed
- **AND** no files have been opened previously
- **THEN** the dialog SHALL display "暂无最近文档" placeholder text

#### Scenario: Close Welcome dialog
- **WHEN** the Welcome dialog is open
- **AND** user presses Escape or clicks the overlay backdrop or clicks the close button
- **THEN** the dialog SHALL close
