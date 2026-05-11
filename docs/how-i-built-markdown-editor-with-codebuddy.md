# 我怎么在周末，用 CodeBuddy 给自己写了一个 Markdown 编辑器，又浪费了公司一些 Token

> 本文记录了我如何用 AI 大模型（CodeBuddy）在周末从零开发出一款专业级 Markdown 桌面编辑器 —— Seven Markdown 的完整过程。

---

## 起因：好用的都收费，自己动手丰衣足食

作为一个每天要写大量 Markdown 的开发者，我一直在寻找一款称手的编辑器。

市面上的选择很多：Typora 优雅但收费了，Obsidian 功能强大但太重（我只是写 Markdown，不是搞知识管理），各种在线编辑器又总觉得不够本地化。

其实我最习惯的还是 VS Code —— 毕竟写代码写文档都在一个地方，手感好、快捷键熟、插件生态丰富。本来我的想法很简单：**写一个 VS Code 插件**，增强一下 Markdown 编辑体验就够了。

为此我还认真查了一圈资料：VS Code Extension API、Markdown Language Service、WebView Panel……

然后我停下来想了想：

> 既然都要写插件了，现在 AI 这么强，为什么不让 AI 帮我写一个完整的编辑器呢？

反正我现在的工作日常就是写 Markdown，以后有时间再把 OpenCode 的 AI 引擎接进来，让它变成一个真正的 AI 写作 IDE。

于是，Seven Markdown 诞生了。

---

## 我的 AI 开发工作流：Spec-Driven Development

很多人以为用 AI 写代码就是对着 Chat 窗口一顿对话，然后把生成的代码复制粘贴过来。

不是的。

我的做法是 **Spec-Driven Development（规范驱动开发）**—— 先把需求写成严谨的规范文档，再让 AI 按规范逐模块实现。这套工作流的核心思想是：

> **你不是在和 AI 聊天，你是在给 AI 下工单。**

### 具体流程

```
1. Proposal（提案）     →  我要做什么，为什么做
2. Design（设计）       →  技术方案怎么做
3. Specs（规范）        →  每个模块的行为用 WHEN/THEN 精确描述
4. Tasks（任务拆分）    →  拆成可执行的小任务
5. Implementation（实现）→  让 CodeBuddy 按 Spec 逐个实现
```

举个例子，当我决定把项目从一个简单的 Markdown 阅读器升级为专业编辑器时，我写了一份 Proposal：

> "MD Mate 需要从现有的基础 Markdown 阅读器升级为**工业级 AI 驱动的 Markdown 编辑器**。基于最新的交互设计规范，我们需要实现一套类似 VS Code 的专业编辑器界面，提供实时预览、多主题切换、AI 辅助写作、完整的文件管理等核心能力。"

然后这份 Proposal 被拆解为 **20+ 个独立的功能模块 Spec**：

- `editor-core` — 编辑器核心
- `titlebar-system` — 标题栏系统
- `ai-assistant` — AI 助手面板
- `command-palette` — 命令面板
- `theme-system` — 主题系统
- `find-replace` — 查找替换
- ……

每个 Spec 都用 BDD 风格精确描述行为：

```markdown
## WHEN user presses Enter at end of a list item
THEN a new list item with the same marker is created on the next line

## WHEN user presses Enter on an empty list item  
THEN the list marker is removed and list continuation stops
```

这种写法的好处是：**AI 能精确理解你要什么，不会天马行空乱发挥。**

---

## 技术选型：让 AI 帮我做技术决策

在技术选型阶段，我和 CodeBuddy 进行了一轮讨论。我的需求很明确：

1. **桌面应用**（不想做 Web 版，要本地文件系统访问）
2. **跨平台**（我用 Mac，但以后可能要给 Windows 同事用）
3. **性能好**（Electron 太重了）
4. **前端用 React**（我熟）

最终选定的技术栈：

| 层级 | 选择 | 理由 |
|------|------|------|
| 桌面运行时 | **Tauri v2** | Rust 后端，比 Electron 轻 10 倍 |
| 前端框架 | **React 19 + TypeScript** | 类型安全，生态好 |
| 编辑器引擎 | **CodeMirror 6** | 现代架构，扩展性强 |
| 状态管理 | **Zustand** | 简洁，没有 Redux 那堆模板代码 |
| 样式方案 | **Tailwind CSS** | 实用优先，和 AI 生成代码配合好 |
| Markdown 渲染 | **react-markdown + remark/rehype** | 插件化，支持 GFM/数学公式/代码高亮 |
| 构建工具 | **Vite 5** | 快，开箱即用 |

这里有个小洞察：**Tailwind CSS 和 AI 代码生成特别搭**。因为 Tailwind 的工具类命名是高度结构化的，AI 生成 UI 代码时几乎不会出错。如果用传统 CSS 或 CSS-in-JS，AI 经常会编出不存在的 class 名或者样式冲突。

---

## 周末 48 小时：从零到可用

### Day 1：骨架搭建

第一天我主要完成了项目骨架和核心编辑功能。

跟 CodeBuddy 的协作节奏是这样的：

**我**：把 `editor-core` 的 Spec 丢给它
**CodeBuddy**：生成完整的 EditorPane 组件，包含 CodeMirror 6 初始化、Markdown 语法高亮、行号、括号匹配
**我**：Review 代码，调整一些细节（比如列表自动续行的逻辑）
**CodeBuddy**：修改完成，顺便加上了单元测试

一个完整的编辑器核心，从 Spec 到可运行代码，**大约 20 分钟**。

如果我自己从头写，光是 CodeMirror 6 的 API 文档就得看半天。

### Day 2：功能爆发

第二天的产出是惊人的。因为第一天的架构已经搭好，第二天就是按 Spec 逐个模块实现：

- ✅ VS Code 风格的完整布局（标题栏 + 菜单栏 + 工具栏 + 侧边栏 + 编辑器 + 状态栏）
- ✅ 7 种内置主题（Dark / Light / Nord / Solarized / Dracula / Monokai / GitHub）
- ✅ AI 助手面板（对话 / 改写 / 翻译 / 解释 四种模式）
- ✅ 命令面板（Ctrl+Shift+P 模糊搜索）
- ✅ 文件资源管理器（目录树 + 搜索）
- ✅ 实时预览（支持 Mermaid 图表、数学公式、代码高亮）
- ✅ 查找替换（正则、大小写敏感、全字匹配）
- ✅ 多标签页管理（拖拽排序、未保存标记）
- ✅ 通知系统
- ✅ 快捷键系统

**一个周末，44 个变更归档**，每个变更都有完整的提案 → 设计 → 任务 → 实现记录。

---

## CodeBuddy 帮我做了什么

让我具体说说 AI 在这个项目里的参与度。

### 1. 代码生成（90%+ 的代码由 AI 生成）

项目目前有 **138 个前端源码文件**（75 个 .ts + 57 个 .tsx + 6 个 .css），Rust 后端 4 个核心文件（总计 90KB+）。绝大部分代码是 CodeBuddy 按照我的 Spec 直接生成的。

我的角色更像是 **架构师 + Code Reviewer**：
- 定义模块边界和接口
- Review AI 生成的代码
- 处理跨模块集成问题
- 解决 AI 搞不定的细节 Bug

### 2. 架构设计（AI 提供方案，我做决策）

比如状态管理方案的选择，我让 CodeBuddy 分析了项目的状态复杂度后，它建议用 Zustand 并按业务域拆分 Store：

```
ThemeStore    — 主题状态
UIStore       — UI 布局状态
FileStore     — 文件操作状态
EditorStore   — 编辑器状态
CommandStore  — 命令注册
AIStore       — AI 助手状态
NotifyStore   — 通知状态
SettingsStore — 用户设置
WorkspaceStore— 工作区状态
```

9 个 Store，职责清晰，互不干扰。这种设计如果纯靠自己想，可能需要几次重构才能理顺。

### 3. 问题排查（Debug 效率翻倍）

开发过程中遇到的典型问题：

- **右键菜单层级冲突**：编辑器右键菜单和系统右键菜单打架 → CodeBuddy 设计了 `__contextMenuHandled` 标记 + 冒泡拦截方案
- **主题切换闪白屏**：React 挂载前有一瞬间白屏 → CodeBuddy 在 `main.tsx` 里加了主题预加载逻辑
- **文件系统监控失效**：Rust 端的 watcher 在某些情况下不触发 → CodeBuddy 帮我排查到是 debounce 时间设置的问题

### 4. 测试生成

CodeBuddy 还帮我生成了 **82 个单元测试** 和 **5 套 E2E 测试**（基于 Playwright）。包括无障碍测试（axe-core）。

说实话如果没有 AI，我大概率会偷懒不写测试。

---

## 一些有趣的实现细节

### 编辑器列表自动续行

这是一个看似简单但实际很有讲究的功能：

```typescript
// 当用户在列表项末尾按 Enter 时
// - 如果当前行有内容 → 自动续行（- 新项目）
// - 如果当前行是空列表项 → 删除标记，退出列表模式
// 支持: -, *, 1., - [ ], - [x]
```

CodeBuddy 第一版实现漏掉了 checkbox 列表的情况，我指出后它秒改，还加了边界用例测试。

### Mermaid 图表渲染

预览区支持 Mermaid 语法渲染流程图、时序图、甘特图。这个功能从 Spec 到实现只花了 10 分钟 —— AI 对 Mermaid 的 API 显然比我熟。

### 主题系统的 CSS 变量架构

7 个主题，每个主题定义了 50+ 个 CSS 变量，涵盖背景色、文字色、边框色、编辑器语法配色等。主题切换时通过修改 `data-theme` 属性实现热切换，带平滑过渡动画。

这种方案的优雅之处在于：**加新主题只需要写一个 JSON 配色方案**，不需要改任何组件代码。

---

## Rust 后端：AI 也能写 Rust

项目的 Tauri 后端用 Rust 编写，主要负责：

- 文件系统操作（读写/创建/删除/重命名/搜索）
- 原生菜单系统（7 大菜单组）
- 文件系统监控（watcher 线程）
- 日志系统（带日期分割）
- 导出功能（HTML 导出）
- 终端集成
- Git 分支信息获取

Rust 代码总计约 **90KB**（`main.rs` 39KB + `commands.rs` 38KB + `logger.rs` 14KB）。

说实话我的 Rust 水平有限，但 CodeBuddy 在 Rust 方面的表现让我很惊讶。特别是错误处理的 `Result<T, E>` 链式调用、生命周期标注、以及 Tauri IPC 的 `#[tauri::command]` 宏用法，它都写得很标准。

当然中间也有翻车的时候 —— 比如文件 watcher 的线程安全问题，来回改了几轮才对。但比我自己查 Rust 文档要快得多。

---

## Token 消耗情况

既然标题说了"浪费公司 Token"，那就坦白交代一下消耗：

整个项目开发过程中，OpenSpec 的变更归档有 **44 个**，每个变更都包含完整的 Proposal → Design → Tasks → Implementation 对话链。保守估计：

- 每个小变更约消耗 10K-50K tokens
- 大型变更（如 V2 整体重构）约消耗 200K-500K tokens
- 总计估算：**约 3-5M tokens**

换算成人效：如果一个熟练的全栈工程师从头写这个项目（含 Rust 后端、React 前端、测试、文档），大约需要 **2-3 周**。

我用了 **一个周末** + 后续零散时间修 Bug 优化。

**ROI 非常高。**

---

## 最终成果

Seven Markdown 目前已经是一个功能完整的专业级 Markdown 桌面编辑器：

**编辑能力**：
- CodeMirror 6 引擎，Markdown 语法高亮
- 列表自动续行、Tab 缩进、括号匹配
- 查找替换（正则/大小写/全字匹配）
- 多标签页编辑 + 拖拽排序

**预览能力**：
- 实时预览，编辑器 ↔ 预览滚动同步
- GFM 表格、数学公式（KaTeX）、代码高亮
- Mermaid 图表渲染

**AI 能力**：
- 4 种模式：对话 / 改写 / 翻译 / 解释
- 支持 OpenAI 兼容 API（自定义 endpoint）

**工作区管理**：
- 文件资源管理器（目录树 + 拖拽）
- 文件搜索、大纲导航
- 文件系统变更监控

**体验细节**：
- 7 种内置主题 + 平滑切换动画
- VS Code 风格命令面板
- 完整快捷键系统
- 通知系统、状态栏
- 无障碍合规（ARIA、键盘导航）

---

## 经验总结

### 1. AI 最适合什么

- ✅ **模式化的代码生成**：组件、Store、Hook、工具函数 —— 这些有明确模式的代码，AI 又快又好
- ✅ **技术栈对接**：API 集成、配置文件、构建脚本 —— AI 记得住所有文档细节
- ✅ **测试编写**：单元测试、E2E 测试 —— AI 不会偷懒
- ✅ **Bug 排查**：给 AI 看错误日志和相关代码，通常能快速定位

### 2. AI 搞不定什么

- ❌ **复杂的跨模块集成**：当多个模块要协同工作时，AI 容易顾此失彼
- ❌ **性能调优的直觉**：它能写出正确的代码，但不一定是最高效的
- ❌ **产品决策**：什么功能该做、什么不该做，这需要人来判断
- ❌ **用户体验的微调**：按钮大 2px 还是小 2px，动画时长 200ms 还是 300ms —— 这些需要人的审美

### 3. 关键心得

> **给 AI 越清晰的输入，得到越好的输出。**

Spec-Driven Development 的核心价值就在这里。与其和 AI 反复扯皮"不对，我要的不是这个"，不如一开始就把需求写清楚。

花 10 分钟写一个好的 Spec，比花 30 分钟改 AI 乱生成的代码要高效得多。

---

## 下一步

Seven Markdown 还在持续迭代中。接下来我计划：

1. **集成 OpenCode** —— 接入本地 AI 模型，打造真正的 AI 写作 IDE
2. **Git 集成** —— 让它像 VS Code 一样管理版本
3. **插件系统** —— 开放扩展能力

我的愿景是：

> **编程有太多好用的 AI Agent，写文章也可以有。**

Seven Markdown 是我在"AI Agent 赋能专业领域"这个方向的第一个尝试。写代码有 Cursor、Copilot、Claude Code，那写文章、写研究报告、写技术文档，是不是也可以有一个专属的 AI IDE？

---

## 开源地址

- GitHub: [github.com/qwzhang01/seven_md](https://github.com/qwzhang01/seven_md)
- License: MIT
- 欢迎 Star ⭐ 和 PR

---

*"Talk is cheap, show me the prompt."* 
*—— 2026 年版的 Linus Torvalds（大概）*
