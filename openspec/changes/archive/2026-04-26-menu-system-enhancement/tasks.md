## 1. 菜单标签国际化（中文化）

- [x] 1.1 修改 `src-tauri/src/main.rs` 中所有菜单标签为中文（文件/编辑/视图/插入/格式/主题/帮助）
- [x] 1.2 修改所有菜单项标签为中文（新建文件/打开文件/保存/另存为等）
- [x] 1.3 更新 `main.rs` 中 `on_menu_event` 的菜单项 ID 保持不变（ID 不需要中文化）

## 2. 修复快捷键不一致问题

- [x] 2.1 修复侧边栏切换快捷键：将 `CmdOrCtrl+\` 改为 `CmdOrCtrl+B`（main.rs 第 96 行）

## 3. 添加缺失的菜单项

- [x] 3.1 添加"全部保存"菜单项：`save_all`，快捷键 `CmdOrCtrl+Alt+S`，事件 `menu-save-all`
- [x] 3.2 添加"粘贴并匹配样式"菜单项：`paste_match_style`，快捷键 `CmdOrCtrl+Shift+V`，事件 `menu-paste-match-style`
- [x] 3.3 添加"查找下一个"菜单项：`find_next`，快捷键 `Cmd+G`，事件 `menu-find-next`
- [x] 3.4 添加"查找上一个"菜单项：`find_previous`，快捷键 `Cmd+Shift+G`，事件 `menu-find-previous`
- [x] 3.5 添加"清除格式"菜单项：`clear_format`，快捷键 `CmdOrCtrl+\`，事件 `menu-clear-format`
- [x] 3.6 添加"全屏"菜单项：`toggle_fullscreen`，快捷键 `F11`，事件 `menu-toggle-fullscreen`

## 4. 插入菜单子菜单和快捷键完善

- [x] 4.1 将"标题"改为子菜单，添加 H1-H6 六级标题项
  - [x] 4.1.1 添加 H1-H6 菜单项，分别带快捷键 Cmd+1 到 Cmd+6
  - [x] 4.1.2 创建 `heading_submenu` 子菜单，包含 H1-H6
- [x] 4.2 添加"脚注"菜单项：`insert_footnote`，快捷键 `CmdOrCtrl+Shift+7`，事件 `menu-insert-footnote`
- [x] 4.3 添加"折叠区块"菜单项：`insert_details`，快捷键 `CmdOrCtrl+Shift+.`，事件 `menu-insert-details`
- [x] 4.4 补全插入菜单快捷键：
  - [x] 4.4.1 删除线：`CmdOrCtrl+Shift+X`
  - [x] 4.4.2 行内代码：`CmdOrCtrl+E`
  - [x] 4.4.3 代码块：`CmdOrCtrl+Alt+C`
  - [x] 4.4.4 图片：`CmdOrCtrl+Shift+I`
  - [x] 4.4.5 水平线：`CmdOrCtrl+Shift+H`

## 5. 格式菜单子菜单完善

- [x] 5.1 将格式菜单中的标题项改为子菜单，添加 H1-H6
- [x] 5.2 添加 H4、H5、H6 标题菜单项（当前只有 H1-H3）

## 6. 视图菜单完善

- [x] 6.1 添加"切换 AI 助手面板"菜单项：`toggle_ai_panel`，快捷键 `CmdOrCtrl+Shift+A`，事件 `menu-toggle-ai-panel`
- [x] 6.2 创建"显示选项"子菜单，包含：
  - [x] 6.2.1 显示行号（checkbox）
  - [x] 6.2.2 显示迷你地图（checkbox）
  - [x] 6.2.3 自动换行（checkbox）
- [x] 6.3 将编辑器视图改为子菜单：
  - [x] 6.3.1 仅编辑器：`CmdOrCtrl+Alt+1`
  - [x] 6.3.2 仅预览：`CmdOrCtrl+Alt+2`
  - [x] 6.3.3 分栏：`CmdOrCtrl+Alt+3`

## 7. macOS 平台专属菜单

- [x] 7.1 添加 macOS Apple 菜单（使用 `#[cfg(target_os = "macos")]` 条件编译）
  - [x] 7.1.1 About Seven Markdown
  - [x] 7.1.2 Services 子菜单
  - [x] 7.1.3 隐藏 Seven Markdown
  - [x] 7.1.4 隐藏其他
  - [x] 7.1.5 显示全部
  - [x] 7.1.6 退出 Seven Markdown
- [x] 7.2 添加 macOS 窗口菜单
  - [x] 7.2.1 最小化
  - [x] 7.2.2 缩放
  - [x] 7.2.3 全部置于前面

## 8. 最近文档功能

- [x] 8.1 在文件菜单中添加"最近文档"子菜单
- [x] 8.2 实现最近文档存储逻辑（存储到 localStorage，前端管理）
- [x] 8.3 添加"清除菜单"功能
- [x] 8.4 在前端监听 `menu-clear-recent` 事件并处理

## 9. 前端事件处理更新

- [x] 9.1 在 `AppV2.tsx` 中添加对新菜单项事件的监听：
  - [x] 9.1.1 `menu-save-all`
  - [x] 9.1.2 `menu-paste-match-style`
  - [x] 9.1.3 `menu-find-next`
  - [x] 9.1.4 `menu-find-previous`
  - [x] 9.1.5 `menu-clear-format`
  - [x] 9.1.6 `menu-toggle-fullscreen`
  - [x] 9.1.7 `menu-toggle-ai-panel`
  - [x] 9.1.8 `menu-insert-footnote`
  - [x] 9.1.9 `menu-insert-details`
  - [x] 9.1.10 `menu-clear-recent`
  - [x] 9.1.11 `menu-show-line-numbers`
  - [x] 9.1.12 `menu-show-minimap`
  - [x] 9.1.13 `menu-word-wrap`
  - [x] 9.1.14 `menu-toggle-explorer`
  - [x] 9.1.15 `menu-insert-h1` 到 `menu-insert-h6`
  - [x] 9.1.16 `menu-format-h4` 到 `menu-format-h6`
- [x] 9.2 实现各项功能的处理逻辑

## 10. 测试验证

- [ ] 10.1 测试所有菜单项可以正确触发
- [ ] 10.2 测试所有快捷键可以正常工作
- [ ] 10.3 测试 macOS 平台菜单在 macOS 上正常显示
- [ ] 10.4 测试中文菜单标签正确显示
- [ ] 10.5 测试最近文档功能持久化
