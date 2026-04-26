# Seven Markdown 实现 vs 规范 — 全面差异 ToDo List

> 生成日期：2026-04-26  
> 对比来源：原型图、原型 HTML/CSS/JS、menu-config.js、interaction-spec.md  
> 品牌确认：正式名称 **Seven Markdown**，Slogan **Write Markdown Like Code**，Logo **ME 图标**  
> 注：原型文档中的 "MD Mate" 为历史错误名称，以本文件为准。

---

## 🔴 A. 品牌名称修正

| # | 问题 | 正确值 | 当前实现 | 优先级 |
|---|------|--------|---------|--------|
| A1 | **AboutDialog 名称不完整** | "Seven Markdown" + Slogan "Write Markdown Like Code" | 显示 "Seven MD"（AboutDialog.tsx 第 43/62/83 行），缺少 Slogan | 🔴 高 |
| A2 | **AboutDialog 使用 Emoji 图标** | 应使用 ME Logo 图标（蓝紫渐变） | 当前用 📝 emoji（AboutDialog.tsx 第 59 行） | 🔴 高 |
| A3 | **Tauri 菜单名称不完整** | "About Seven Markdown" / "Quit Seven Markdown" | main.rs 第 82 行 "Quit Seven MD"，第 143 行 "About Seven MD" | 🟠 中 |
| A4 | **版权声明名称不完整** | "Seven Markdown Contributors" | AboutDialog.tsx 第 83 行 "Seven MD Contributors" | 🟠 中 |

---

## 🟠 B. 菜单系统差异（对比 menu-config.js）

| # | 问题 | 规范要求 | 实际实现 | 优先级 |
|---|------|---------|---------|--------|
| B1 | **macOS Apple 菜单缺失** | menu-config.js 定义完整的 Apple 子菜单（关于、偏好设置、服务、隐藏等） | Tauri main.rs 没有创建 macOS 专属 Apple 菜单子项 | 🟠 中 |
| B2 | **菜单标签语言不统一** | 原型为中文菜单（文件/编辑/视图/插入/格式/主题/帮助） | Tauri 菜单为英文（File/Edit/View/Insert/Format/Theme/Help） | 🟠 中 |
| B3 | **缺少"新建窗口"功能** | menu-config 有 `newWindow` (Cmd+Shift+N) | AppV2.tsx 监听了事件但是 TODO 未实现 | 🟡 低 |
| B4 | **缺少"最近打开"子菜单** | menu-config 有 `recentDocuments` 角色 + 清除功能 | Tauri 菜单和前端完全缺失 | 🟡 低 |
| B5 | **缺少"全部保存"菜单项** | menu-config 有 `saveAll` (Cmd+Alt+S) | Tauri 菜单和前端都没有 | 🟡 低 |
| B6 | **缺少"粘贴并匹配样式"** | menu-config 有 `pasteAndMatchStyle` (Cmd+Shift+V) | 未实现 | 🟡 低 |
| B7 | **缺少"查找下一个/上一个"菜单快捷键** | menu-config 有 `findNext` (Cmd+G)、`findPrevious` (Cmd+Shift+G) | Tauri 菜单未配置这些快捷键 | 🟠 中 |
| B8 | **插入菜单缺少标题子菜单** | menu-config 插入→标题下有 H1-H6 六级标题子菜单（带 Cmd+1-6 快捷键） | Tauri 只有一个扁平的 "Heading" 项，无子菜单无 H4-H6 | 🟠 中 |
| B9 | **插入菜单缺少"脚注"和"折叠区块"** | menu-config 有 `insFootnote` 和 `insDetails` | 完全缺失 | 🟡 低 |
| B10 | **插入菜单缺少快捷键** | menu-config: 删除线 Cmd+Shift+X, 行内代码 Cmd+E, 代码块 Cmd+Alt+C, 图片 Cmd+Shift+I, 水平线 Cmd+Shift+H | Tauri 的 insert 菜单项大部分无快捷键 | 🟠 中 |
| B11 | **格式菜单缺少"清除格式"** | menu-config 有 `fmtClear` (Cmd+\\) | 未实现 | 🟡 低 |
| B12 | **格式菜单缺少标题子菜单** | menu-config 格式→标题下有 H1-H6 子菜单 | Tauri 格式菜单是扁平的 H1/H2/H3，无子菜单，缺少 H4-H6 | 🟡 低 |
| B13 | **视图菜单缺少"切换 AI 助手面板"** | menu-config 有 `toggleAIPanel` (Cmd+Shift+A) | Tauri 菜单和前端都没有这个菜单项 | 🟠 中 |
| B14 | **视图菜单缺少显示选项** | menu-config 有"显示行号"、"显示迷你地图"、"自动换行"三个 checkbox 菜单项 | Tauri 菜单完全缺失 | 🟡 低 |
| B15 | **视图菜单缺少"全屏"** | menu-config 有 togglefullscreen (Ctrl+Cmd+F / F11) | Tauri 菜单未添加 | 🟡 低 |
| B16 | **视图菜单"编辑器视图"缺少子菜单和快捷键** | menu-config 用 radio 子菜单：仅编辑器 Cmd+Alt+1，仅预览 Cmd+Alt+2，分栏 Cmd+Alt+3 | Tauri 菜单无快捷键，也非子菜单 | 🟠 中 |
| B17 | **缺少 macOS "窗口"菜单** | menu-config 有最小化/缩放/全部置于前面 | Tauri 菜单完全缺失 | 🟡 低 |
| B18 | **View 菜单侧边栏切换快捷键不一致** | 规范和 menu-config 为 Ctrl+B | Tauri main.rs 第 96 行为 `CmdOrCtrl+\` | 🟠 中 |

---

## 🟠 C. 工具栏差异（对比原型和交互说明）

| # | 问题 | 规范要求 | 实际实现 | 优先级 |
|---|------|---------|---------|--------|
| C1 | **AI 按钮缺少文本标签** | 原型 HTML 中 AI 按钮有 `<span class="tool-label">AI</span>` 文字 | Toolbar.tsx 只有 Bot 图标，无 "AI" 文字标签 | 🟡 低 |
| C2 | **工具栏缺少视图切换按钮** | 原型 HTML 有视图模式循环切换按钮（分栏→仅编辑→仅预览→分栏） | 工具栏没有视图切换按钮，只能通过菜单/命令面板切换 | 🟠 中 |

---

## 🔴 D. 编辑器功能差异（对比交互说明）

| # | 问题 | 规范要求 | 实际实现 | 优先级 |
|---|------|---------|---------|--------|
| D1 | **查找栏缺少匹配计数显示** | 交互说明："无结果" / "N of M"；原型 JS 有 `findMatchCount` 显示 | FindReplaceBar.tsx 第 101-102 行有空的 `<span>` 占位但不显示计数 | 🟠 中 |
| D2 | **菜单触发的查找/替换未正确打开面板** | Ctrl+H 打开查找+替换栏 | `menu-find` 和 `menu-replace` 事件只设了 mode 但没调用 `setFindReplaceOpen(true)` | 🔴 高 |
| D3 | **缺少 Tab/Shift+Tab 缩进支持** | 交互说明："支持 Tab 键插入缩进""支持 Shift+Tab 减少缩进" | 需确认 CodeMirror 是否启用了 indentWithTab 扩展 | 🟠 中 |
| D4 | **缺少自动配对括号/引号** | 交互说明："支持自动配对括号、引号" | 需确认 CodeMirror closeBrackets 扩展是否启用 | 🟠 中 |

---

## 🟠 E. 快捷键差异（对比交互说明第 17 节快捷键总表）

| # | 问题 | 规范要求 | 实际实现 | 优先级 |
|---|------|---------|---------|--------|
| E1 | **缺少 Ctrl+Shift+E 快捷键** | Ctrl+Shift+E 打开资源管理器 | AppV2.tsx 的 shortcuts 数组中没有注册此快捷键 | 🟠 中 |
| E2 | **缺少 Ctrl+Shift+F 快捷键** | Ctrl+Shift+F 打开搜索面板 | 未注册（注意：commands/index.ts 中 `edit.format` 用了 Ctrl+Shift+F，与搜索面板冲突） | 🟠 中 |
| E3 | **缺少 Ctrl+Shift+O 快捷键** | Ctrl+Shift+O 打开大纲面板 | 未在全局快捷键中注册（仅在 ActivityBar tooltip 中显示） | 🟠 中 |
| E4 | **缺少 Ctrl+W 快捷键** | Ctrl+W 关闭窗口/标签 | 未在全局快捷键中注册 | 🟠 中 |
| E5 | **缺少 Ctrl+H 快捷键** | Ctrl+H 打开替换 | 未在 AppV2 的 shortcuts 数组中注册 | 🟠 中 |
| E6 | **缺少编辑格式快捷键** | Ctrl+B 加粗, Ctrl+I 斜体, Ctrl+K 插入链接 | 这些编辑快捷键未在全局快捷键中注册（Ctrl+B 被侧边栏切换占用） | 🟠 中 |

---

## 🟠 F. 侧边栏差异

| # | 问题 | 规范要求 | 实际实现 | 优先级 |
|---|------|---------|---------|--------|
| F1 | **活动栏"点击已激活图标收起侧边栏"** | "点击已激活的图标 → 收起侧边栏" | ActivityBar.tsx `onClick` 只调用 `setActiveSidebarPanel`，未实现再次点击收起 | 🟠 中 |
| F2 | **侧边栏缺少右边缘拖拽调整宽度** | "拖拽侧边栏右边缘可调整宽度，最小 180px，最大 500px" | Sidebar 组件没有 resize handle 实现 | 🟡 低 |
| F3 | **资源管理器缺少操作按钮** | "悬停节标题时显示新建文件/文件夹/刷新/折叠按钮" | 需确认 ExplorerPanel 是否有这些悬停操作按钮 | 🟡 低 |

---

## 🟡 G. 状态栏差异

| # | 问题 | 规范要求 | 实际实现 | 优先级 |
|---|------|---------|---------|--------|
| G1 | **状态栏缺少通知铃铛计数图标的样式** | 原型有小红点样式的通知徽标 | StatusBar 只在 `unreadCount > 0` 时显示数字，无小红点样式 | 🟡 低 |
| G2 | **"同步"按钮关闭时仍显示"同步"** | 应区分"同步: 开"和"同步: 关" | StatusBar.tsx 第 159 行两种状态都显示 "同步"，无视觉区别（仅透明度不同） | 🟡 低 |

---

## 🟡 H. 通知系统差异

| # | 问题 | 规范要求 | 实际实现 | 优先级 |
|---|------|---------|---------|--------|
| H1 | **打开文件失败通知 duration 不一致** | 自动关闭 5 秒 | AppV2.tsx 第 74 行错误通知用 `duration: 4000`（4 秒），部分地方用 5000 | 🟡 低 |

---

## 🟡 I. 模态对话框差异

| # | 问题 | 规范要求 | 实际实现 | 优先级 |
|---|------|---------|---------|--------|
| I1 | **对话框缺少 Enter 键确认** | "Enter 键等同于确定" | AboutDialog 没有 Enter 处理 | 🟡 低 |
| I2 | **对话框缺少 Tab 键焦点切换** | "Tab 键在按钮间切换焦点" | 需确认是否有 tabIndex 和焦点管理 | 🟡 低 |
| I3 | **对话框缺少打开动画** | "打开带有缩放+淡入动画" | AboutDialog 无打开动画，直接显示 | 🟡 低 |

---

## 🟡 J. 命令面板差异

| # | 问题 | 规范要求 | 实际实现 | 优先级 |
|---|------|---------|---------|--------|
| J1 | **命令面板缺少"切换自动换行"命令** | 命令面板列表中有 "↩️ 编辑器: 切换自动换行" | commands/index.ts 中无此命令 | 🟡 低 |
| J2 | **命令面板缺少"导出为 PDF/HTML"的快捷键显示** | 原型面板项显示快捷键 | commands 中 exportPdf/exportHtml 无 shortcut 字段 | 🟡 低 |

---

## 🟡 K. 上下文菜单差异

| # | 问题 | 规范要求 | 实际实现 | 优先级 |
|---|------|---------|---------|--------|
| K1 | **右键菜单图标使用 Emoji 而非图标** | 原型使用 RemixIcon 类名风格图标 | EditorContextMenu.tsx 使用 Emoji（✂️📋📄➕🔤🔍📝🤖） | 🟡 低 |
| K2 | **右键菜单格式化图标不一致** | 交互说明用 "🖌️ 格式化文档" | 实现用 "📝 格式化文档" | 🟡 低 |

---

## 🟡 L. 响应式适配差异

| # | 问题 | 规范要求 | 实际实现 | 优先级 |
|---|------|---------|---------|--------|
| L1 | **移动端编辑器+预览未上下排列** | "编辑器 + 预览上下排列（各占 50% 高度）" | AppV2 用 flex 横向布局，无 media query 切换为纵向 | 🟡 低 |
| L2 | **移动端侧边栏弹出行为缺失** | "点击活动栏图标弹出侧边栏内容面板（绝对定位覆盖）" | 小屏只是收起侧边栏，无绝对定位覆盖弹出 | 🟡 低 |

---

## 📊 汇总统计

| 优先级 | 数量 | 说明 |
|--------|------|------|
| 🔴 高 | 3 | 品牌名称修正 + 查找替换打开逻辑 bug |
| 🟠 中 | 18 | 菜单完整性 + 快捷键 + 核心交互 |
| 🟡 低 | 18 | 次要功能 + UI 细节 + 响应式 |
| **总计** | **39** | |

---

## 🎯 建议修复顺序

### 第一批（立刻修）— 品牌 + Bug
1. **A1 + A2** — AboutDialog：名称改为 "Seven Markdown"，添加 Slogan "Write Markdown Like Code"，替换 📝 emoji 为 ME Logo 图标
2. **A3 + A4** — Tauri 菜单 + 版权：统一改为 "Seven Markdown"
3. **D2** — 修复 `menu-find` / `menu-replace` 事件未调用 `setFindReplaceOpen(true)` 的 bug

### 第二批（快捷键补全）
4. **E1-E6** — 补全 Ctrl+Shift+E/F/O、Ctrl+W、Ctrl+H、编辑格式快捷键
5. **B7** — 添加 Cmd+G / Cmd+Shift+G 查找导航快捷键
6. **B18** — 修复侧边栏切换快捷键从 `Ctrl+\` 改为 `Ctrl+B`

### 第三批（菜单补全）
7. **B2** — 菜单标签国际化（中文）
8. **B8 + B12** — 补全标题子菜单 H4-H6
9. **B10** — 补全插入菜单快捷键
10. **B13** — 添加"切换 AI 助手面板"菜单项

### 第四批（交互完善）
11. **D1** — 查找栏匹配计数
12. **C2** — 工具栏视图切换按钮
13. **F1** — 活动栏再次点击收起侧边栏
14. **D3 + D4** — Tab 缩进 + 自动配对
