## MODIFIED Requirements

### Requirement: Menu bar displays seven main menu categories
The system SHALL display a menu bar containing 文件(File), 编辑(Edit), 视图(View), 插入(Insert), 格式(Format), 主题(Theme), and 帮助(Help) menus below the title bar.

**Updated Description**: Menu labels SHALL be displayed in Chinese (文件/编辑/视图/插入/格式/主题/帮助) to match the specification requirements.

#### Scenario: Menu bar layout on application start
- **WHEN** the application launches
- **THEN** a horizontal menu bar SHALL be displayed below the title bar
- **AND** the following menus SHALL appear from left to right: 文件, 编辑, 视图, 插入, 格式, 主题, 帮助
- **AND** the menu bar height SHALL be 32 pixels

### Requirement: File menu provides file management operations
The system SHALL provide a File menu with operations for creating, opening, saving, and exporting files.

**Updated Description**: File menu SHALL include Chinese labels and additional menu items including New Window, Recent Documents, and Save All.

#### Scenario: File menu items
- **WHEN** user clicks the File menu
- **THEN** the following items SHALL be displayed in order:
  - 新建文件 (CmdOrCtrl+N)
  - 新建窗口 (CmdOrCtrl+Shift+N)
  - Separator
  - 打开文件 (CmdOrCtrl+O)
  - 打开文件夹
  - 关闭文件夹
  - Separator
  - Recent Documents submenu (displays up to 10 recent files)
  - Separator
  - 保存 (CmdOrCtrl+S)
  - 全部保存 (CmdOrCtrl+Alt+S)
  - 另存为... (CmdOrCtrl+Shift+S)
  - Separator
  - 导出子菜单 (PDF, HTML)
  - Separator
  - 退出 (CmdOrCtrl+Q)

### Requirement: Edit menu provides editing and search operations
The system SHALL provide an Edit menu with undo/redo, clipboard, and search operations.

**Updated Description**: Edit menu SHALL include Chinese labels and additional items including Paste and Match Style, Find Next, Find Previous, and Clear Formatting.

#### Scenario: Edit menu items
- **WHEN** user clicks the Edit menu
- **THEN** the following items SHALL be displayed:
  - 撤销 (CmdOrCtrl+Z)
  - 重做 (CmdOrCtrl+Shift+Z)
  - Separator
  - 剪切 (CmdOrCtrl+X)
  - 复制 (CmdOrCtrl+C)
  - 粘贴 (CmdOrCtrl+V)
  - 粘贴并匹配样式 (CmdOrCtrl+Shift+V)
  - Separator
  - 全选 (CmdOrCtrl+A)
  - Separator
  - 查找... (CmdOrCtrl+F)
  - 替换... (CmdOrCtrl+H)
  - 查找下一个 (Cmd+G)
  - 查找上一个 (CmdOrCtrl+Shift+G)
  - Separator
  - 清除格式 (CmdOrCtrl+\)

### Requirement: View menu provides display control options
The system SHALL provide a View menu for controlling UI visibility, zoom, layout modes, and editor display options.

**Updated Description**: View menu SHALL include Chinese labels, AI Panel toggle, Display Options submenu, Fullscreen toggle, and improved Editor View submenu with keyboard shortcuts.

#### Scenario: View menu items
- **WHEN** user clicks the View menu
- **THEN** the following items SHALL be displayed:
  - 命令面板... (CmdOrCtrl+Shift+P)
  - 切换 AI 助手面板 (CmdOrCtrl+Shift+A)
  - Separator
  - 切换侧边栏 (CmdOrCtrl+B)
  - 切换大纲面板 (CmdOrCtrl+Shift+O)
  - 切换资源管理器 (CmdOrCtrl+Shift+E)
  - Separator
  - Display Options submenu:
    - 显示行号
    - 显示迷你地图
    - 自动换行
  - Separator
  - 放大 (CmdOrCtrl+=)
  - 缩小 (CmdOrCtrl+-)
  - 重置缩放 (CmdOrCtrl+0)
  - Separator
  - Editor View submenu:
    - 仅编辑器 (CmdOrCtrl+Alt+1)
    - 仅预览 (CmdOrCtrl+Alt+2)
    - 分栏 (CmdOrCtrl+Alt+3)
  - Separator
  - 全屏 (CmdOrCtrl+Ctrl+F / F11)

### Requirement: Insert menu provides Markdown element insertion
The system SHALL provide an Insert menu for inserting various Markdown elements at the cursor position.

**Updated Description**: Insert menu SHALL include Chinese labels, Heading submenu with H1-H6, Footnote insertion, Details block insertion, and proper keyboard shortcuts for all items.

#### Scenario: Insert menu items
- **WHEN** user clicks the Insert menu
- **THEN** the following insertion options SHALL be available:
  - Heading submenu:
    - 标题 1 (Cmd+1)
    - 标题 2 (Cmd+2)
    - 标题 3 (Cmd+3)
    - 标题 4 (Cmd+4)
    - 标题 5 (Cmd+5)
    - 标题 6 (Cmd+6)
  - Separator
  - 加粗 (CmdOrCtrl+B)
  - 斜体 (CmdOrCtrl+I)
  - Separator
  - 删除线 (CmdOrCtrl+Shift+X)
  - 行内代码 (CmdOrCtrl+E)
  - 代码块 (CmdOrCtrl+Alt+C)
  - Separator
  - 链接 (CmdOrCtrl+K)
  - 图片 (CmdOrCtrl+Shift+I)
  - Separator
  - 表格
  - 水平线 (CmdOrCtrl+Shift+H)
  - Separator
  - 无序列表
  - 有序列表
  - 任务列表
  - Separator
  - 引用
  - Separator
  - 脚注 (CmdOrCtrl+Shift+7)
  - 折叠区块 (CmdOrCtrl+Shift+.)

### Requirement: Format menu provides text formatting options
The system SHALL provide a Format menu for applying text formatting.

**Updated Description**: Format menu SHALL include Chinese labels, Heading submenu with H1-H6, and Clear Formatting option.

#### Scenario: Format menu items
- **WHEN** user clicks the Format menu
- **THEN** the following formatting options SHALL be available:
  - 加粗 (CmdOrCtrl+B)
  - 斜体 (CmdOrCtrl+I)
  - 删除线 (CmdOrCtrl+Shift+X)
  - Separator
  - Heading submenu:
    - 标题 1 (Cmd+1)
    - 标题 2 (Cmd+2)
    - 标题 3 (Cmd+3)
    - 标题 4 (Cmd+4)
    - 标题 5 (Cmd+5)
    - 标题 6 (Cmd+6)
  - Separator
  - 代码
  - 链接
  - Separator
  - 清除格式 (CmdOrCtrl+\)

### Requirement: Theme menu provides theme switching
The system SHALL provide a Theme menu for switching between available color themes.

**Updated Description**: Theme menu labels SHALL be in Chinese.

#### Scenario: Theme menu items
- **WHEN** user clicks the Theme menu
- **THEN** the following themes SHALL be listed:
  - 深色模式
  - 浅色模式
  - Monokai
  - Solarized
  - Nord
  - Dracula
  - GitHub

### Requirement: Help menu provides documentation and about information
The system SHALL provide a Help menu with documentation links and application information.

**Updated Description**: Help menu labels SHALL be in Chinese and use "Seven Markdown" for the application name.

#### Scenario: Help menu items
- **WHEN** user clicks the Help menu
- **THEN** the following items SHALL be displayed:
  - 欢迎页
  - Markdown 指南
  - 快捷键参考
  - Separator
  - 关于 Seven Markdown
  - 检查更新

#### Scenario: About dialog shows Seven Markdown branding
- **WHEN** user selects "关于 Seven Markdown"
- **THEN** a modal dialog SHALL display showing:
  - Application name: "Seven Markdown"
  - Slogan: "Write Markdown Like Code"
  - Version number
  - Logo: ME icon (blue-purple gradient)
  - License information (MIT)
