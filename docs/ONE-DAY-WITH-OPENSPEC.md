# 用 Spec Driven 开发一个工业级 Markdown 阅读器，我是怎么做到的

> GitHub：[https://github.com/qwzhang01/seven_md](https://github.com/qwzhang01/seven_md)

---

关于 Spec Driven 开发方法论，我之前写过一篇专门的介绍：[《规范驱动开发（Spec-Driven Development）：AI 时代的软件工程新范式
》](https://mp.weixin.qq.com/s/GuiIPGNkJ9lb_ug5xulLnw)

这篇文章不重复方法论，直接讲实战——**我是怎么用 Spec Driven 在 1 天内把一个 macOS Markdown 阅读器做到工业级水准的。**

---

## 先看最终产物

**Seven MD** —— 一个 macOS 原生 Markdown 阅读器：

- 📁 文件夹浏览、多级文件树、可折叠布局
- 📝 左右分栏实时预览（源码 + 渲染）
- 🎨 GFM / KaTeX 数学公式 / Mermaid 图表 / 代码高亮
- 🌙 暗黑 / 浅色主题切换 + 状态持久化
- 🍎 macOS 原生菜单栏 + 键盘快捷键
- 🔒 纯本地运行，零网络依赖
- ♿ 无障碍访问（ARIA + 键盘导航）
- 🌐 中英文国际化（react-i18next）
- 📊 性能监控 + 结构化日志（前端 + Rust 双端）
- 🧪 测试覆盖率 **80.87%**（Vitest 实测）
- 🔐 CSP 安全策略 + 路径遍历防护 + 输入验证

技术栈：**Tauri v2 + React 19 + TypeScript + Rust**

---

## 这 1 天，实际完成了什么

1 天里，我推进了 **4 个独立的 change**，每个 change 都有完整的 proposal → design → spec → tasks 文档链路：

| Change                          | 核心内容                                                      | 状态    |
| ------------------------------- | ------------------------------------------------------------- | ------- |
| `add-folder-sidebar`            | 文件夹浏览、多级文件树、可折叠布局                            | ✅ 归档 |
| `enhance-core-experience`       | 自定义标题栏、状态栏、面包屑导航、编辑器增强                  | ✅ 归档 |
| `add-standard-menubar`          | macOS 原生菜单栏、键盘快捷键、最近文件                        | ✅ 归档 |
| `industrial-grade-optimization` | 测试覆盖率 80%+、日志系统、性能监控、安全加固、国际化、无障碍 | ✅ 完成 |

最后一个 change 的 `tasks.md` 有 **317 行**，涵盖 10 个大类、数十个子任务。

---

## 工程实战：Spec 是怎么写的

### 一个真实的 Spec 长什么样

以 `file-tree/spec.md` 为例，这是文件树组件的规格文档，格式是标准的 BDD（行为驱动）风格：

```markdown
### Requirement: File tree displays hierarchical structure

The system SHALL display files and directories in a hierarchical tree structure.

#### Scenario: Display root level contents

- **WHEN** a folder is opened
- **THEN** system displays all markdown files and directories at the root level

#### Scenario: Display nested directory

- **WHEN** directory contains subdirectories
- **THEN** system displays subdirectories with expand/collapse indicators
- **AND** user can expand subdirectories to see their contents

### Requirement: File tree filters content

#### Scenario: Show only markdown files

- **WHEN** file tree displays directory contents
- **THEN** system shows only .md files and directories
- **AND** system hides hidden files (starting with .)

#### Scenario: Sort order

- **WHEN** file tree displays contents
- **THEN** system sorts directories first, then files
- **AND** items are sorted alphabetically within each group
```

这不是注释，不是 README，**这是可执行的行为契约**。

AI 拿到这份 spec，生成的代码会自动满足每一个 Scenario。测试也从这里来——每个 Scenario 对应一个测试用例。

### 一个 Change 的完整文档结构

```
openspec/changes/add-folder-sidebar/
├── proposal.md          # 为什么做，做什么，Non-goals
├── design.md            # 组件架构、数据流、状态管理方案
├── specs/
│   ├── file-tree/spec.md          # 文件树行为规格
│   ├── collapsible-panes/spec.md  # 可折叠面板规格
│   ├── file-operations/spec.md    # 文件操作规格
│   └── folder-persistence/spec.md # 持久化规格
└── tasks.md             # 原子级任务清单
```

每个 spec 都包含：接口定义、行为描述、边界条件、测试要求。

---

## 工程实战：Tasks 是怎么拆的

`tasks.md` 是整个流程里最有价值的产出之一。以 `industrial-grade-optimization` 为例，任务拆解到了这个粒度：

```markdown
## 2. P0 - 日志系统搭建

### 2.1 前端日志

- [x] 2.1.1 安装依赖：npm install loglevel @types/loglevel
- [x] 2.1.2 创建 src/utils/logger.ts 日志配置文件
- [x] 2.1.3 创建 src/utils/logger.test.ts 测试文件
- [x] 2.1.4 创建 Tauri command 用于写入日志文件（Rust 端）
- [x] 2.1.5 创建日志持久化插件 src/utils/loggerPersistence.ts
- [x] 2.1.6 配置开发环境日志级别为 DEBUG
- [x] 2.1.7 配置生产环境日志级别为 INFO
- [x] 2.1.8 替换现有 console.log 为 logger.info/debug

### 2.2 Rust 后端日志

- [x] 2.2.1 在 src-tauri/Cargo.toml 添加依赖：log, env_logger, thiserror
- [x] 2.2.2 配置 src-tauri/src/logger.rs 日志模块
- [x] 2.2.3 实现日志文件写入功能
- [x] 2.2.4 实现日志轮转（保留 7 天）
- [x] 2.2.5 在 main.rs 初始化日志系统
```

注意几个细节：

1. **任务有优先级**（P0/P1/P2），AI 按优先级顺序执行
2. **任务有具体路径**，不是"实现日志"，而是"创建 `src/utils/logger.ts`"
3. **前后端都覆盖**，Rust 端和 TypeScript 端的任务在同一个清单里
4. **测试任务和功能任务并列**，不是事后补，是同步写

---

## 工程实战：三个让我印象深刻的细节

### 细节一：三层错误边界

在 `error-boundary/spec.md` 里，我只写了"需要错误边界，侧边栏和主内容区要隔离"。

AI 推导出了这个架构：

```
全局 ErrorBoundary（App 层）
├── Sidebar ErrorBoundary（侧边栏崩溃不影响主内容）
└── MainContent ErrorBoundary（编辑器崩溃不影响文件树）
```

这是有经验的工程师才会想到的设计——**局部故障不应该导致全局崩溃**。

### 细节二：安全加固的完整性

`security-hardening/spec.md` 里定义了安全要求，最终实现包含：

- `src/utils/pathValidator.ts` — 路径遍历攻击防护（`../` 注入、空字节注入）
- `src/utils/inputSanitizer.ts` — HTML 内容清理
- `tauri.conf.json5` — CSP 策略配置 + 权限最小化
- `npm audit` + `cargo audit` — 依赖安全审计集成到 CI

这些在传统开发里往往是"以后再说"的事，在 Spec Driven 流程里，它们和功能开发是**平等的任务**，有 spec，有 tasks，有验收标准。

### 细节三：测试覆盖率 80.87% 是怎么来的

`test-coverage/spec.md` 里明确写了：

- 覆盖率目标：≥80%
- 必须测试的场景：边界条件、错误状态、异步操作
- 禁止的测试反模式：测试实现细节

对应的 tasks 拆解到了每一个测试文件：

```markdown
### 3.1 核心组件测试

- [x] 3.1.1 创建 src/App.test.tsx
- [x] 3.1.2 创建 src/components/Sidebar/Sidebar.test.tsx
- [x] 3.1.3 创建 src/components/EditorPane/EditorPane.test.tsx
- [x] 3.1.4 创建 src/components/PreviewPane/PreviewPane.test.tsx
- [x] 3.1.5 创建 src/components/FileTree/FileTree.test.tsx

### 3.2 Reducer 测试

- [x] 3.2.1 创建 src/context/reducer.test.ts
- [x] 3.2.2 测试所有 action 类型的状态转换
- [x] 3.2.3 测试边界情况（undefined state, invalid action）

### 3.4 Rust 后端测试

- [x] 3.4.1 创建 src-tauri/src/commands.rs 测试模块
- [x] 3.4.2 为文件读取命令添加测试
- [x] 3.4.3 为文件写入命令添加测试
```

80.87% 不是估算，是 Vitest 跑出来的真实数字。

---

## 工程能力体现在哪里

用 Spec Driven 开发，工程能力体现在**你能写出什么质量的 spec**。

一个好的 spec 需要：

- **明确的边界**：proposal 里写清楚 Non-goals，AI 不会越界
- **可测试的行为**：每个 Scenario 都能直接转化为测试用例
- **优先级排序**：P0/P1/P2 决定了 AI 的执行顺序
- **完整的约束**：性能阈值、安全要求、覆盖率目标都要写进 spec

这套文档体系还有一个隐藏价值：**任何人（包括未来的你）都能快速理解项目**。

所有的设计决策、技术选型、接口定义都在文档里，不在某个人的脑子里。

---

## 项目地址

**Seven MD** 基于 MIT 协议开源：

👉 [https://github.com/qwzhang01/seven_md](https://github.com/qwzhang01/seven_md)

`openspec/` 目录下保留了所有的 proposal、design、spec、tasks 文档，可以直接参考这套文档结构用在自己的项目里。

---

_如果你对 Spec Driven 方法论感兴趣，可以看这篇：[《规范驱动开发（Spec-Driven Development）：AI 时代的软件工程新范式》](https://mp.weixin.qq.com/s/GuiIPGNkJ9lb_ug5xulLnw)_
