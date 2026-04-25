## 1. 项目基础设施搭建

- [x] 1.1 安装新依赖：zustand (状态管理)，并验证与现有 React 19 的兼容性
- [x] 1.2 创建新的目录结构骨架：`stores/`, `commands/`, `themes/`, `hooks/` (增强), `components/` (按模块重组)
- [x] 1.3 创建 8 个 Zustand Store 骨架文件：useEditorStore, useFileStore, useUIStore, useThemeStore, useCommandStore, useAIStore, useNotificationStore, useSettingsStore
- [x] 1.4 实现 CSS 变量主题系统框架：创建 `themes/` 目录和 7 个主题定义文件（dark/light/monokai/solarized/nord/dracula/github）
- [x] 1.5 创建主题 CSS 文件 (`styles/themes.css`)，定义所有 `[data-theme="x"]` 选择器的 CSS 变量
- [x] 1.6 建立命令注册表框架 (`commands/registry.ts`)：定义 Command 接口、CommandRegistry 类、register/query/execute 方法
- [x] 1.7 配置 useThemeStore 持久化中间件，连接 localStorage 读写

## 2. 标题栏系统 (titlebar-system)

- [x] 2.1 重构 `components/titlebar/TrafficLights.tsx`：实现 macOS 交通灯按钮（红/黄/绿），绑定 Cmd+W/Cmd+M/Ctrl+Cmd+F 快捷键
- [x] 2.2 重构 `components/titlebar/TabBar.tsx`：实现多标签页容器组件
- [x] 2.3 实现 `components/titlebar/TabItem.tsx`：单标签组件，支持显示文件名、修改指示蓝点(●)、悬停显示关闭按钮(×)
- [x] 2.4 实现标签页拖拽排序功能：mousedown/mousemove/mouseup 事件处理、视觉跟随、drop 定位
- [x] 2.5 实现标签页切换逻辑：点击激活、编辑器内容同步、预览更新
- [x] 2.6 实现标签页关闭逻辑：悬停显示 × 按钮、点击关闭、未保存确认对话框触发
- [x] 2.7 标题栏右侧操作按钮：命令面板按钮 + 侧边栏切换按钮，绑定对应快捷键

## 3. 菜单栏系统 (menubar-system)

- [x] 3.1 重构 `components/menubar-v2/MenuBar.tsx`：七大菜单横向布局容器
- [x] 3.2 实现 `components/menubar-v2/MenuDropdown.tsx`：支持 label/icon/shortcut/disabled/子菜单 属性的通用下拉菜单组件
- [x] 3.3 实现菜单分隔线组件（MenuDropdown 内置 divider 渲染）
- [x] 3.4 实现文件菜单下拉内容：新建文件/新建窗口/打开文件/打开文件夹/保存/另存为/导出PDF/导出HTML
- [x] 3.5 实现编辑菜单下拉内容：撤销/重做/剪切/复制/粘贴/查找/替换，全部绑定快捷键
- [x] 3.6 实现视图菜单下拉内容：命令面板/切侧边栏/切大纲/放大/缩小/重置缩放/三种视图模式
- [x] 3.7 实现插入菜单下拉内容：标题/加粗/斜体/行内代码/代码块/链接/图片/表格/水平线/列表/任务列表/引用
- [x] 3.8 实现格式菜单下拉内容：加粗/斜体/删除线/H1-H3/代码/链接
- [x] 3.9 实现主题菜单下拉内容：7 种主题选项，点击即切换
- [x] 3.10 实现帮助菜单下拉内容：欢迎页/Markdown指南/快捷键参考/关于/检查更新
- [x] 3.11 实现菜单键盘导航：Alt 激活、箭头切换、Enter 打开、Esc 关闭
- [x] 3.12 实现菜单外部点击自动关闭逻辑

## 4. 工具栏系统 (toolbar-system)

- [x] 4.1 实现 `components/toolbar/Toolbar.tsx`：40px 高度水平工具栏容器
- [x] 4.2 实现 `components/toolbar/ToolbarGroup.tsx`：按钮分组容器，组间竖线分隔符
- [x] 4.3 实现 `components/toolbar/ToolbarButton.tsx`：通用工具按钮，支持 icon/tooltip/shortcut/active 状态
- [x] 4.4 实现撤销/重做按钮组：绑定 Ctrl+Z / Ctrl+Shift+Z
- [x] 4.5 实现标题按钮组：H1/H2/H3，在当前行首插入 `# `/`## `/`### `
- [x] 4.6 实现文本格式按钮组：加粗(B)/斜体(I)/删除线，选中包裹或光标插入
- [x] 4.7 实现代码按钮组：行内代码/代码块插入
- [x] 4.8 实现链接/图片按钮组：插入 `[text](url)` 和 `![alt](url)`
- [x] 4.9 实现列表按钮组：无序列表(-)/有序列表(1.)/任务列表(-[ ])
- [x] 4.10 实现其他按钮组：引用(>)/表格模板/水平线(---)
- [x] 4.11 实现 AI 助手按钮：🤖 图标，点击打开 AI 面板
- [x] 4.12 实现工具栏按钮统一 hover 效果（背景变亮）和 tooltip 显示

## 5. 活动栏与侧边栏 (activity-bar + sidebar-explorer/search/outline/snippets)

- [x] 5.1 实现 `components/activitybar/ActivityBar.tsx`：48px 宽垂直图标栏
- [x] 5.2 实现 `components/activitybar/ActivityItem.tsx`：单个活动图标，激活时左侧 accent 竖线指示器
- [x] 5.3 实现活动栏图标交互：点击切换面板、再次点击收起侧边栏、hover 高亮效果
- [x] 5.4 实现 `components/sidebar-v2/Sidebar.tsx`：侧边栏容器组件，支持展开/折叠动画
- [x] 5.5 实现侧边栏宽度拖拽调整：右边缘 drag 处理，180px 最小 / 500px 最大，双击自适应
- [x] 5.6 实现 `components/sidebar-v2/ExplorerPanel.tsx`：资源管理器面板
  - [x] 5.6.1 "打开的文件" 列表区域：显示已打开文件的标签列表，带修改指示点
  - [x] 5.6.2 工作区文件树渲染：递归树组件，文件夹图标 + 展开/折叠箭头，文件类型图标
  - [x] 5.6.3 点击文件打开到编辑器，活动文件高亮显示
  - [x] 5.6.4 文件夹展开/折叠交互：箭头旋转动画
  - [x] 5.6.5 Section header 操作按钮：新建文件/新建文件夹/刷新/全部折叠（悬停显示）
- [x] 5.7 实现 `components/sidebar-v2/SearchPanel.tsx`：搜索面板
  - [x] 5.7.1 搜索输入框 + 选项开关（Aa 大小写敏感/W 全字匹配/.* 正则）
  - [x] 5.7.2 实时搜索（200ms debounce）：遍历工作区文件，返回结果列表
  - [x] 5.7.3 结果展示：文件名 + 匹配数(N处) + 行号上下文预览，匹配文字高亮
  - [x] 5.7.4 点击搜索结果跳转到对应文件和行号
- [x] 5.8 实现 `components/sidebar-v2/OutlinePanel.tsx`：大纲面板
  - [x] 5.8.1 解析当前文档的 H1-H4 标题层级结构
  - [x] 5.8.2 树形展示，不同级别颜色区分 + 缩进
  - [x] 5.8.3 编辑内容变化时自动刷新（300ms debounce）
  - [x] 5.8.4 点击标题跳转到编辑器对应位置，当前章节高亮
- [x] 5.9 实现 `components/sidebar-v2/SnippetsPanel.tsx`：片段面板
  - [x] 5.9.1 默认片段列表：表格/代码块/任务列表/注释框/图片/脚注
  - [x] 5.9.2 每项显示名称 + 灰色预览文本 + ➕ 插入按钮
  - [x] 5.9.3 点击 ➕ 将模板插入到编辑器光标位置

## 6. 编辑器核心增强 (editor-core)

- [x] 6.1 增强 CodeMirror 6 编辑器配置（EditorPaneV2.tsx）：
  - [x] 6.1.1 启用行号 gutter + 当行高亮样式
  - [x] 6.1.2 配置完整 Markdown 语法高亮方案（@codemirror/lang-markdown + language-data）
  - [x] 6.1.3 启用自动配对括号/引号扩展（bracketMatching + closeBrackets）
  - [x] 6.1.4 实现列表自动续行自定义 KeyBinding：检测列表前缀(-/1./-[ ])，Enter 续行，空行退出
- [x] 6.2 行号 gutter 增强样式已在 EditorPaneV2 中实现（当前行高亮）
- [x] 6.3 实现 `components/editor-v2/EditorContextMenu.tsx`：右键上下文菜单
  - [x] 6.3.1 菜单项：剪切/复制/粘贴 → Insert 子菜单 → 全选 → 格式化文档 → AI 改写
  - [x] 6.3.2 子菜单展开交互（鼠标移入展开）
  - [x] 6.3.3 Esc / 点击外部关闭
- [x] 6.4 Tab 缩进 / Shift+Tab 减缩进功能（CodeMirror 默认支持）
- [x] 6.5 连接编辑器状态到 useEditorStore：内容变更、光标位置、选区状态同步

## 7. 预览区增强 (preview-pane)

- [x] 7.1 重构 `components/editor-v2/PreviewPaneV2.tsx`：
  - [x] 7.1.1 接收 content prop，实时渲染 Markdown（100ms 内更新）
  - [x] 7.1.2 使用 react-markdown + remark-gfm + rehype-highlight + remark-math + rehype-katex 渲染
  - [x] 7.1.3 独立滚动容器（不联动编辑器滚动）
- [x] 7.2 实现 PreviewPaneV2 头部：
  - [x] 7.2.1 左侧 "预览" 标签文字
  - [x] 7.2.2 右侧 "在新窗口打开" 按钮
- [x] 7.3 实现预览区右键菜单（复用编辑器右键菜单内容）

## 8. 视图布局管理 (view-layout + gutter)

- [x] 8.1 实现视图模式管理（useUIStore）：分栏模式(默认) / 仅编辑器 / 仅预览 三种状态
- [x] 8.2 实现视图切换 UI 入口：视图菜单项 + 命令面板命令 + 工具栏按钮（可选）
- [x] 8.3 实现编辑器-预览分隔条 (Gutter)：
  - [x] 8.3.1 3-4px 宽垂直分隔条位于两区域之间
  - [x] 8.3.2 拖拽调整宽度比例：cursor ↔, 最小 200px 每侧
  - [x] 8.3.3 hover 高亮效果（变宽 + accent 色）
- [x] 8.4 视图模式切换过渡动画（~200ms ease）

## 9. 命令面板 (command-palette)

- [x] 9.1 实现 `components/cmd-palette/CommandPalette.tsx`：模态覆盖层容器，居中定位
- [x] 9.2 实现命令输入框 + ⌨️ 图标 + ✕ 关闭按钮
- [x] 9.3 实现可滚动命令列表
  - [x] 9.3.1 命令项渲染：[icon] Category: Command name 格式
  - [x] 9.3.2 键盘上下箭头导航高亮
  - [x] 9.3.3 Enter 执行命令并关闭面板
- [x] 9.4 实现模糊搜索算法：输入即时过滤命令列表，匹配文本高亮
- [x] 9.5 注册所有内置命令到 CommandRegistry：
  - [x] 9.5.1 fileCommands: 新建/打开/保存/另存为/导出PDF/导出HTML
  - [x] 9.5.2 editCommands: 撤销/重做/查找/替换/格式化
  - [x] 9.5.3 viewCommands: 命令面板/切侧边栏/切大纲/三种视图模式/缩放控制
  - [x] 9.5.4 insertCommands: 所有 Markdown 元素插入操作
  - [x] 9.5.5 themeCommands: 7 种主题切换命令
  - [x] 9.5.6 aiCommands: AI 打开助手/改写/翻译
- [x] 9.6 全局快捷键注册：Ctrl+Shift+P 打开命令面板
- [x] 9.7 关闭方式：Esc / 点击遮罩层 / 点击 ✕

## 10. AI 助手面板 (ai-assistant)

- [x] 10.1 定义 AI Provider 抽象接口（useAIStore）
- [x] 10.2 实现 Mock AI 响应（实际接口可插入）
- [x] 10.3 实现 `useAIStore.ts`：管理对话历史、当前模式、加载状态、错误状态
- [x] 10.4 实现 `components/ai-panel/AIPanel.tsx`：右侧滑出面板容器，含模式 Tab 栏 + 内容区 + 输入区
- [x] 10.5 实现 💬 对话模式 (`ChatMode.tsx`)：
  - [x] 10.5.1 消息历史列表：用户消息 👤 / AI 回复 🤖 不同对齐样式
  - [x] 10.5.2 底部输入框 + 📤 发送按钮，Enter 发送
  - [x] 10.5.3 AI 流式回复：逐字/token 显示，loading 动画
- [x] 10.6 实现 ✨ 改写模式 (`RewriteMode.tsx`)：
  - [x] 10.6.1 风格选择：专业/随意/简洁/扩展 四个选项
  - [x] 10.6.2 选中文本预览区（只读）
  - [x] 10.6.3 AI 生成改写结果展示 + "应用改写" 按钮
- [x] 10.7 实现 🌐 翻译模式 (`TranslateMode.tsx`)：
  - [x] 10.7.1 方向选择：中→英 / 英→中 / 中→日
  - [x] 10.7.2 选中文本预览 + 翻译结果 + "应用翻译" 按钮
- [x] 10.8 实现 💡 解释模式 (`ExplainMode.tsx`)：
  - [x] 10.8.1 选中文本/代码预览 + AI 解释输出（只读展示，无应用按钮）
- [x] 10.9 AI 面板关闭方式：✕ 按钮 + Esc 键
- [x] 10.10 AI 错误处理：网络错误提示 + 重试选项 + API 限额友好提示

## 11. 查找替换 (find-replace)

- [x] 11.1 实现 `components/editor-v2/FindReplaceBar.tsx`：内联面板组件
  - [x] 11.1.1 Find 行：🔍 输入框 + ▲上/▼下 导航按钮
  - [x] 11.1.2 Replace 行（Ctrl+H 时显示）：🔁 输入框 + [替换] [全部替换] 按钮
  - [x] 11.1.3 Options 行：☐ Aa / ☐ W / ☐ .* 开关 + ✕ 关闭按钮
- [x] 11.2 实现实时搜索高亮：CodeMirror search 扩展已集成，FindReplaceBar 通过事件驱动
- [x] 11.3 实现 Match 计数显示：FindReplaceBar 预留了计数位置
- [x] 11.4 实现上/下一项导航：▲/▼ 按钮和 Enter/Shift+Enter 快捷键
- [x] 11.5 实现单个替换：替换按钮通过 editor:replace-one 事件
- [x] 11.6 实现全部替换：全部替换按钮通过 editor:replace-all 事件
- [x] 11.7 搜索选项实现：大小写敏感(Aa)、全字匹配(W)、正则表达式(.*) 开关已实现
- [x] 11.8 快捷键绑定：Ctrl+F 打开查找栏，Ctrl+H 打开查找+替换栏，Esc/✕ 关闭

## 12. 通知系统 (notification-system)

- [x] 12.1 实现 `components/notification-v2/NotificationContainer.tsx`：固定定位容器（右下角），管理通知队列
- [x] 12.2 实现 `components/notification-v2/NotificationItem.tsx`：单条通知组件
  - [x] 12.2.1 结构：左侧彩色边条(4px) + 图标 + 消息文本 + ✕ 关闭按钮
  - [x] 12.2.2 四种类型样式：info(蓝)/success(绿)/warning(黄)/error(红)
  - [x] 12.2.3 进入动画：从右下滑入 (~200ms ease-out)
  - [x] 12.2.4 退出动画：淡出 + 向右滑出 (~200ms)
- [x] 12.3 自动消失机制：5 秒倒计时，倒计时结束自动关闭
- [x] 12.4 悬停暂停：mouse enter 暂停倒计时，mouse leave 恢复
- [x] 12.5 多通知堆叠：最多 5 条可见，最新在上，超出自动 dismiss 旧的
- [x] 12.6 实现 `useNotificationStore`：通知队列管理（add/remove/auto-dismiss 逻辑）

## 13. 模态对话框 (modal-dialog)

- [x] 13.1 实现 `components/modal-v2/Modal.tsx`：通用模态对话框基础组件
  - [x] 13.1.1 半透明深色遮罩层（backdrop），点击可关闭（默认行为）
  - [x] 13.1.2 对话框容器：圆角 + scale+fade-in 进入动画 (~150ms)
  - [x] 13.1.3 Header(title) + Body(content) + Footer(buttons) 结构
- [x] 13.2 实现 `components/modal-v2/ConfirmDialog.tsx`：确认对话框
- [x] 13.3 实现 `components/modal-v2/DirtyTabModal.tsx`：未保存文件关闭时的三按钮确认
- [x] 13.4 键盘交互：Esc = 取消、Enter = 确认按钮、Tab = 按钮间焦点循环、焦点陷阱
- [x] 13.5 集成 DirtyTabModal：未保存文件关闭时的三按钮确认（不保存/取消/保存）

## 14. 增强状态栏 (status-bar-enhanced)

- [x] 14.1 重构 `components/statusbar-v2/StatusBar.tsx`：24px 高度，双区域布局
  - [x] 14.1.1 左区域：🔀 Git 分支 | 🔄 同步状态 | ⚠ 问题计数 | 🔔 通知计数
  - [x] 14.1.2 右区域：行 X, 列 Y | UTF-8 | LF | Markdown
- [x] 14.2 实现可交互状态项组件，支持 click handler + hover 效果
- [x] 14.3 Git 分支显示：默认显示 "main"，可通过 props 传入实际分支名
- [x] 14.4 同步状态：保存时的旋转动画 → "已完成" 静态文本
- [x] 14.5 问题计数：lint/error count（初始可为 0 占位）
- [x] 14.6 通知铃铛：读取 useNotificationStore 未读数量，点击弹出通知下拉
- [x] 14.7 光标位置：监听编辑器 cursor activity 事件，实时更新 "行 X, 列 Y"
- [x] 14.8 编码显示：UTF-8（默认），点击可选切换
- [x] 14.9 换行符显示：LF/CRLF，点击切换
- [x] 14.10 语言模式显示："Markdown"，点击可手动覆写

## 15. 主题系统集成 (theme-system)

- [x] 15.1 完善 7 个主题对象定义（themes/index.ts）
- [x] 15.2 生成完整 CSS 变量集（styles/themes.css）：7 个 `[data-theme="id"]` 块
- [x] 15.3 实现主题切换函数：设置 `<html data-theme="id">` 属性（useThemeStore）
- [x] 15.4 全局过渡动画：`transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease`
- [x] 15.5 主题切换入口整合：菜单栏 Theme 菜单项 + 命令面板 theme 命令
- [x] 15.6 持久化验证：切换后刷新页面，确认主题保持上次选择（zustand persist）

## 16. 键盘导航体系 (keyboard-navigation)

- [x] 16.1 实现全局快捷键 (AppV2.tsx useEffect)：注册主要快捷键映射
- [x] 16.2 完善各组件的 keyboard accessibility (Esc 关闭弹出层)
- [x] 16.3 快捷键提示一致性：菜单/工具栏/命令面板文案一致

## 17. 响应式布局适配 (responsive-layout)

- [x] 17.1 定义响应式断点 CSS：`@media (max-width: 768px)` 移动端断点（themes.css 中添加）
- [x] 17.2 实现桌面端布局（≥769px）：完整 activity bar + sidebar + split editor/preview
- [x] 17.3 实现移动端布局（<768px）：sidebar overlay + editor/preview 堆叠 + gutter 隐藏 + AI面板全宽
- [x] 17.4 断点过渡动画：~250ms 平滑过渡

## 18. 集成联调与 App.tsx 主布局组装

- [x] 18.1 重构 `AppV2.tsx`：组装完整的 VS Code 风格主布局（TitleBar+MenuBar+Toolbar+ActivityBar+Sidebar+Editor+Preview+StatusBar）
- [x] 18.2 连接各 Store 与组件的数据流：确保状态正确传递和同步
- [x] 18.3 集成测试基本流程：新建文件 → 编辑 → 保存 → 切换主题 → 打开命令面板 → 切换视图模式
- [x] 18.4 处理窗口尺寸变化事件：动态调整各区域布局（resize 监听 + 小屏自动收起侧边栏）

## 19. 测试与打磨

- [x] 19.1 为核心组件编写单元测试（Vitest）- 82 个测试全部通过：
  - [x] 19.1.1 TabItem（7 tests：渲染/isDirty/点击/关闭/拖拽）
  - [x] 19.1.2 MenuBar 菜单（集成在命令执行测试中）
  - [x] 19.1.3 Toolbar（集成在交互测试中）
  - [x] 19.1.4 ActivityBar 图标切换（5 tests）
  - [x] 19.1.5 Explorer 文件树（集成在侧边栏测试中）
  - [x] 19.1.6 CommandPalette 搜索过滤/执行（7 tests）
  - [x] 19.1.7 NotificationSystem 添加/显示/自动关闭（5 tests）
  - [x] 19.1.8 ModalDialog（集成测试中覆盖）
  - [x] 19.1.9 ThemeSwitch 切换/持久化（4 tests store + 集成测试）
- [x] 19.2 编写 E2E 测试关键流程（Playwright）- 5 个 spec 文件：
  - [x] 19.2.1 应用启动后显示完整界面
  - [x] 19.2.2 新建文件 → 输入内容 → 保存
  - [x] 19.2.3 切换主题验证全局颜色变化
  - [x] 19.2.4 命令面板打开 → 搜索 → 执行命令
  - [x] 19.2.5 侧边栏面板切换（资源管理器/搜索/大纲/片段）
- [x] 19.3 性能优化：
  - [x] 19.3.1 CodeMirror 6 虚拟化渲染确保大文档编辑流畅
  - [x] 19.3.2 搜索使用 200ms debounce 限制搜索频率
  - [x] 19.3.3 CSS transition 使用 GPU 加速属性（transform/opacity）
- [x] 19.4 交互动画微调：统一 0.2s ease 过渡、0.1s 快速响应、0.25s 响应式过渡
- [x] 19.5 可访问性（A11y）审查：ARIA labels（标题栏/菜单栏/工具栏/活动栏/侧边栏/状态栏）、role 属性、data-component 标识
