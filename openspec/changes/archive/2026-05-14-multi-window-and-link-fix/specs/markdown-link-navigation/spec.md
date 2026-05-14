## ADDED Requirements

### Requirement: Preview pane intercepts all link clicks
The preview pane SHALL intercept all `<a>` tag click events and prevent the default browser navigation behavior.

#### Scenario: Click on any link does not navigate away
- **WHEN** user clicks any link in the preview pane
- **THEN** the default browser navigation SHALL be prevented (`e.preventDefault()`)
- **AND** the Tauri WebView SHALL NOT navigate away from the application page

### Requirement: Internal markdown links open in current window tab
The system SHALL resolve relative markdown file links to local file paths and open them as new tabs in the current window.

#### Scenario: Click relative path markdown link
- **WHEN** user clicks a link with href `./other-doc.md` in the preview of file `/project/docs/readme.md`
- **THEN** the system SHALL resolve the path to `/project/docs/other-doc.md`
- **AND** the file content SHALL be read via Tauri `readFile` command
- **AND** a new tab SHALL be opened (or existing tab activated) with the file content

#### Scenario: Click parent-relative markdown link
- **WHEN** user clicks a link with href `../notes/guide.md` in the preview of file `/project/docs/readme.md`
- **THEN** the system SHALL resolve the path to `/project/notes/guide.md`
- **AND** the file SHALL be opened in a new tab

#### Scenario: Click bare filename markdown link
- **WHEN** user clicks a link with href `changelog.md` (no leading `./`) in the preview of file `/project/docs/readme.md`
- **THEN** the system SHALL resolve the path to `/project/docs/changelog.md`
- **AND** the file SHALL be opened in a new tab

#### Scenario: Markdown link target file does not exist
- **WHEN** user clicks a link to `./nonexistent.md` and the resolved file does not exist
- **THEN** a notification SHALL be displayed with message "文件未找到: {resolved_path}"
- **AND** no tab SHALL be created

#### Scenario: Markdown link with URL-encoded or Chinese characters
- **WHEN** user clicks a link with href `./文档说明.md` or `./my%20doc.md`
- **THEN** the system SHALL properly decode the path using `decodeURIComponent`
- **AND** the resolved file SHALL be opened in a new tab

### Requirement: External URLs open in system browser
The system SHALL open absolute HTTP/HTTPS URLs in the user's default system browser.

#### Scenario: Click external HTTP link
- **WHEN** user clicks a link with href `https://example.com`
- **THEN** the system SHALL invoke `@tauri-apps/plugin-shell` `open()` to launch the system default browser
- **AND** the URL SHALL be opened in the browser
- **AND** the application window SHALL remain unchanged

#### Scenario: Click external HTTP link with non-standard protocol
- **WHEN** user clicks a link with href starting with `http://` or `https://`
- **THEN** the system SHALL open it in the system browser regardless of the domain

### Requirement: Anchor links scroll within preview pane
The system SHALL handle `#heading` anchor links by scrolling to the corresponding heading within the preview pane.

#### Scenario: Click anchor link to heading
- **WHEN** user clicks a link with href `#installation` in the preview pane
- **THEN** the preview pane SHALL scroll smoothly to the element with matching `id="installation"`
- **AND** the scroll SHALL use smooth animation behavior

#### Scenario: Click anchor link to non-existent heading
- **WHEN** user clicks a link with href `#nonexistent-heading` and no matching element exists
- **THEN** no scrolling SHALL occur
- **AND** no error or notification SHALL be shown

### Requirement: Link type detection follows priority rules
The system SHALL classify links in the following priority order for handling.

#### Scenario: Link type classification
- **WHEN** a link href starts with `#`
- **THEN** it SHALL be classified as an anchor link

- **WHEN** a link href starts with `http://` or `https://`
- **THEN** it SHALL be classified as an external link

- **WHEN** a link href ends with `.md` or `.markdown` (case-insensitive)
- **THEN** it SHALL be classified as an internal markdown link

- **WHEN** a link href does not match any of the above patterns
- **THEN** it SHALL be classified as an unknown link and no action SHALL be taken
