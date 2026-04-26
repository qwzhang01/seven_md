# 代码贡献指南

感谢您对 **Seven Markdown** 项目的关注！本指南将帮助您快速上手参与开发。

> 💡 **项目愿景**：Seven Markdown 是 AI 时代的 Markdown 写作工作站，也是"各垂直领域 AI Agent"愿景的第一步。了解更多请阅读 [README.md](../README.md) 和 [FUTURE_TODO.md](./FUTURE_TODO.md)。

---

## 目录

- [行为准则](#行为准则)
- [开发环境搭建](#开发环境搭建)
- [项目结构](#项目结构)
- [编码规范](#编码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [测试要求](#测试要求)

---

## 行为准则

- 尊重每一位参与者
- 提供建设性反馈
- 帮助他人学习成长
- 遵循 [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)

---

## 开发环境搭建

### 前置依赖

- **Node.js** 18+ 及 npm 9+
- **Rust** 1.70+（stable channel）
- **Git** 版本控制
- **macOS** 10.15+ 或 **Windows** 10+

### Fork 和克隆

```bash
# Fork 后克隆
git clone https://github.com/YOUR_USERNAME/seven_md.git
cd seven_md

# 添加上游远程仓库
git remote add upstream https://github.com/qwzhang01/seven_md.git
```

### 安装依赖

```bash
# 前端依赖
npm install

# Rust 依赖（首次构建自动安装）
cd src-tauri && cargo build
```

### 启动开发模式

```bash
# Tauri 开发模式（带热重载）
npm run tauri:dev

# 仅前端开发（无 Rust 后端）
npm run dev
```

### 验证环境

```bash
# 运行测试
npm run test:run

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

---

## 项目结构

```
seven_md/
├── src/                        # 前端源代码
│   ├── components/             # React 组件
│   │   ├── titlebar-v2/       # 标题栏（TrafficLights + TabBar + TitleBarActions）
│   │   ├── toolbar-v2/        # 工具栏（Toolbar + ToolbarButton + ToolbarGroup）
│   │   ├── activitybar-v2/    # 活动栏
│   │   ├── sidebar-v2/        # 侧边栏（Explorer/Search/Outline/Snippets 4 面板）
│   │   ├── editor-v2/         # 编辑器（EditorPaneV2 + PreviewPaneV2 + Gutter + 右键菜单 + 查找替换）
│   │   ├── ai-panel/          # AI 助手（AIPanel + Chat/Rewrite/Translate/Explain 4 模式）
│   │   ├── cmd-palette/       # 命令面板
│   │   ├── notification-v2/   # 通知系统（4 类型 + hover 暂停）
│   │   ├── modal-v2/          # 模态对话框（Modal + ConfirmDialog + DirtyTabModal）
│   │   ├── dialogs/           # 业务对话框
│   │   ├── statusbar-v2/      # 状态栏
│   │   └── ErrorBoundary/     # 错误边界
│   ├── stores/                 # Zustand 状态管理（8 个 store）
│   ├── commands/               # 命令注册与执行
│   ├── hooks/                  # 自定义 Hooks（含 useKeyboardShortcuts）
│   ├── utils/                  # 工具函数
│   ├── styles/                 # 全局样式
│   ├── themes/                 # 主题定义
│   ├── types/                  # TypeScript 类型
│   ├── i18n/                   # 国际化
│   ├── test/                   # 测试文件
│   ├── AppV2.tsx               # 主应用组件（注册 Tauri 菜单事件）
│   └── main.tsx                # 入口
├── src-tauri/                  # Rust 后端
│   ├── src/
│   │   ├── main.rs             # 应用入口 + Tauri 原生菜单定义
│   │   ├── commands.rs         # Tauri IPC 命令
│   │   └── logger.rs           # 日志模块
│   └── Cargo.toml
├── e2e/                        # Playwright E2E 测试
├── docs/                       # 文档（含 FUTURE_TODO.md 规划路线图）
└── openspec/                   # OpenSpec 设计规范（含 10+ 进行中变更）
```

> ⚠️ **重要提示**：菜单栏使用 **Tauri 原生菜单**（在 `src-tauri/src/main.rs` 中定义），**不是前端 HTML 组件**。因此 `src/components/` 下 *没有* `menubar-v2` 目录。如需新增菜单项：
> 1. 在 `src-tauri/src/main.rs` 中添加 `MenuItem::with_id(...)`
> 2. 在 `src/AppV2.tsx` 的菜单事件监听 `useEffect` 中添加处理分支
> 3. 对应命令注册到 `src/commands/`

---

## 编码规范

### TypeScript / React

#### 文件命名

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 组件 | PascalCase | `EditorPaneV2.tsx` |
| Hooks | camelCase（use 前缀） | `useFileOperations.ts` |
| Store | camelCase（use 前缀） | `useEditorStore.ts` |
| 工具函数 | camelCase | `pathValidator.ts` |
| 测试 | 与源文件同名 + `.test` | `EditorPaneV2.test.tsx` |

#### 组件结构

```tsx
// 1. 导入
import { useState, useEffect } from 'react'
import { useEditorStore } from '../../stores'
import { createLogger } from '../../utils/logger'

// 2. 类型定义
interface MyComponentProps {
  title: string
  onAction?: () => void
}

// 3. Logger 实例
const logger = createLogger('MyComponent')

// 4. 组件
export function MyComponent({ title, onAction }: MyComponentProps) {
  // 4a. 状态
  const [isOpen, setIsOpen] = useState(false)
  
  // 4b. Store
  const { content } = useEditorStore()
  
  // 4c. Effects
  useEffect(() => {
    logger.debug('Component mounted')
    return () => logger.debug('Component unmounted')
  }, [])
  
  // 4d. 事件处理
  const handleClick = () => {
    logger.info('Button clicked')
    onAction?.()
  }
  
  // 4e. 渲染
  return (
    <div className="bg-white dark:bg-gray-900">
      <h1>{title}</h1>
      <button onClick={handleClick}>操作</button>
    </div>
  )
}
```

#### 导入顺序

```tsx
// 1. React
import { useState, useEffect } from 'react'

// 2. 第三方库
import { invoke } from '@tauri-apps/api/core'

// 3. 内部模块（按路径深度排序）
import { useEditorStore } from '../../stores'
import { createLogger } from '../../utils/logger'
import { Button } from './Button'

// 4. 类型导入
import type { FileTreeNode } from '../../types'
```

#### 样式规范

- 使用 **Tailwind CSS** 工具类
- 支持亮色/暗色主题：`bg-white dark:bg-gray-900`
- 遵循已有的 CSS 变量体系（`var(--bg-primary)` 等）
- 确保响应式设计

### Zustand Store 规范

```ts
import { create } from 'zustand'

interface MyState {
  value: string
  setValue: (v: string) => void
  reset: () => void
}

export const useMyStore = create<MyState>((set) => ({
  value: '',
  setValue: (v) => set({ value: v }),
  reset: () => set({ value: '' }),
}))
```

### Rust 规范

| 类型 | 命名规则 |
|------|---------|
| 函数 | `snake_case` |
| 类型/结构体 | `PascalCase` |
| 常量 | `SCREAMING_SNAKE_CASE` |
| 模块 | `snake_case` |

```rust
use std::path::Path;
use log::{debug, error};

const MAX_FILE_SIZE: usize = 10 * 1024 * 1024;

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    debug!("Reading file: {}", path);
    // 实现逻辑
    Ok(content)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_read_file() {
        // 测试代码
    }
}
```

---

## 提交规范

### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型说明

| 类型 | 描述 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码风格调整（不影响功能） |
| `refactor` | 代码重构 |
| `test` | 新增/更新测试 |
| `chore` | 构建/配置变更 |
| `perf` | 性能优化 |

### 示例

```
feat(editor): 支持代码块语法高亮

为预览区的 JavaScript、Python、Rust 代码块添加语法高亮。

Closes #123
```

```
fix(file-ops): 优雅处理文件权限错误

当文件读取因权限问题失败时，显示友好的错误提示而非崩溃。

Fixes #456
```

### 最佳实践

- 使用祈使语态（"add feature" 而非 "added feature"）
- 每次提交聚焦一个逻辑变更
- 关联相关 Issue

---

## Pull Request 流程

### 提交前检查

```bash
# 1. 同步上游
git fetch upstream
git rebase upstream/main

# 2. 运行全部检查
npm run lint
npm run type-check
npm run test:run
cd src-tauri && cargo test && cargo clippy

# 3. 按需更新文档和测试
```

### PR 标题

使用与 Commit 相同的格式：`feat(editor): 新增功能描述`

### PR 描述模板

```markdown
## 变更描述
简要说明改动内容。

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 破坏性变更
- [ ] 文档更新

## 测试说明
描述如何测试这些变更。

## 检查清单
- [ ] 代码符合编码规范
- [ ] 本地测试通过
- [ ] 新功能已补充测试
- [ ] 文档已更新
```

### 审查流程

1. 所有 PR 需至少一位审查者批准
2. CI 检查必须全部通过
3. 回复所有审查意见
4. 如需要，合并前 squash commits

---

## 测试要求

### 覆盖率要求

- **整体** ≥ 80%
- **核心组件** ≥ 90%
- **工具函数** ≥ 85%
- **Hooks** ≥ 80%

### 必须测试的内容

- **新功能** 必须包含对应测试
- **Bug 修复** 必须包含回归测试
- **组件**：渲染、交互、边界情况
- **Store**：状态变更、action 行为
- **工具函数**：多输入组合测试

### 详细说明

请参阅 [TESTING.md](./TESTING.md) 获取完整的测试指南。

---

## 有问题？

1. 查看现有文档
2. 搜索 GitHub Issues
3. 创建新 Issue 并打上 `question` 标签

感谢您为 Seven Markdown 做出贡献！
