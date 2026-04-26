# 测试指南

本文档说明 **Seven Markdown** 的测试体系、运行方式和编写规范。

---

## 目录

- [测试框架概览](#测试框架概览)
- [运行测试](#运行测试)
- [测试目录结构](#测试目录结构)
- [编写测试](#编写测试)
- [覆盖率要求](#覆盖率要求)
- [持续集成](#持续集成)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 测试框架概览

| 层级 | 框架 | 用途 |
|------|------|------|
| 前端单元测试 | Vitest + React Testing Library | 组件、Store、Hooks、工具函数 |
| 前端集成测试 | Vitest | 命令执行、标签管理、主题切换等跨模块流程 |
| E2E 测试 | Playwright | 用户完整操作流程验证 |
| 后端单元测试 | Rust 内置测试 | Tauri Command 层测试 |

---

## 运行测试

### 前端测试

```bash
# 运行全部前端测试
npm run test:run

# 交互式 Watch 模式
npm run test

# 带 UI 界面的测试
npm run test:ui

# 生成覆盖率报告
npm run test:coverage
# 报告输出到 coverage/ 目录

# 运行指定文件
npm run test:run -- src/test/stores/useFileStore.test.ts

# 按名称模式匹配
npm run test:run -- --grep "useTheme"
```

### 后端测试

```bash
cd src-tauri && cargo test
# 运行指定模块
cd src-tauri && cargo test commands
```

### E2E 测试

详见 [E2E-TESTING.md](./E2E-TESTING.md)。

---

## 测试目录结构

```
src/
├── test/                           # 集中测试目录
│   ├── setup.ts                    # 测试环境配置（DOM mock 等）
│   ├── components/                 # 组件测试
│   │   ├── ActivityBar.test.tsx
│   │   ├── CommandPalette.test.tsx
│   │   ├── NotificationItem.test.tsx
│   │   └── TabItem.test.tsx
│   ├── stores/                     # Store 测试
│   │   ├── useCommandStore.test.ts
│   │   ├── useFileStore.test.ts
│   │   ├── useNotificationStore.test.ts
│   │   ├── useThemeStore.test.ts
│   │   └── useUIStore.test.ts
│   └── integration/                # 集成测试
│       ├── command-execution.test.ts
│       ├── tab-management.test.ts
│       └── theme-switching.test.ts
├── hooks/                          # Hook 测试（与源码同目录）
│   ├── useAppState.test.tsx
│   ├── useExport.test.ts
│   ├── useFileOperationTiming.test.ts
│   ├── useFileOperations.test.tsx
│   ├── useFileSearch.test.ts
│   ├── useKeyboardNavigation.test.ts
│   ├── useKeyboardShortcuts.test.ts
│   ├── useKeyboardShortcuts.test.tsx
│   ├── useMenuState.test.tsx
│   ├── useRecentFiles.test.tsx
│   ├── useTabManagement.test.tsx
│   └── useTheme.test.ts
├── utils/                          # 工具函数测试（与源码同目录）
│   ├── exportUtils.test.ts
│   ├── fileIcons.test.tsx
│   ├── inputSanitizer.test.ts
│   ├── logger.test.ts
│   ├── memoryMonitor.test.ts
│   ├── pathValidator.test.ts
│   └── tabPersistence.test.ts
├── components/
│   └── ErrorBoundary/
│       └── ErrorBoundary.test.tsx
└── i18n/
    └── config.test.ts
```

---

## 编写测试

### 组件测试

使用 React Testing Library，关注用户可见行为：

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivityBar } from '../../components/activitybar-v2'

describe('ActivityBar', () => {
  it('应渲染所有面板图标', () => {
    render(<ActivityBar />)
    expect(screen.getByTitle(/资源管理器/)).toBeInTheDocument()
    expect(screen.getByTitle(/搜索/)).toBeInTheDocument()
    expect(screen.getByTitle(/大纲/)).toBeInTheDocument()
  })

  it('点击图标应切换激活状态', async () => {
    const user = userEvent.setup()
    render(<ActivityBar />)
    
    await user.click(screen.getByTitle(/搜索/))
    expect(screen.getByTitle(/搜索/)).toHaveClass('active')
  })
})
```

### Zustand Store 测试

直接调用 Store 的 action 验证状态变更：

```ts
import { useThemeStore } from '../../stores'

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'dark' })
  })

  it('应正确切换主题', () => {
    const { setTheme } = useThemeStore.getState()
    setTheme('nord')
    expect(useThemeStore.getState().theme).toBe('nord')
  })
})
```

### Hook 测试

使用 `renderHook` 测试自定义 Hook：

```tsx
import { renderHook, act } from '@testing-library/react'
import { useFileSearch } from './useFileSearch'

describe('useFileSearch', () => {
  it('应返回搜索结果', () => {
    const { result } = renderHook(() => useFileSearch())
    
    act(() => {
      result.current.search('markdown')
    })
    
    expect(result.current.results.length).toBeGreaterThan(0)
  })
})
```

### 工具函数测试

标准单元测试，推荐使用参数化测试：

```ts
import { validatePath } from './pathValidator'

describe('validatePath', () => {
  it.each([
    ['/Users/test/file.md', true],
    ['../../../etc/passwd', false],
    ['', false],
  ])('validatePath("%s") => %s', (input, expected) => {
    expect(validatePath(input).valid).toBe(expected)
  })
})
```

### 集成测试

验证多模块协作流程：

```ts
import { useCommandStore } from '../../stores'

describe('命令执行流程', () => {
  it('注册的命令应可通过 ID 执行', () => {
    const { registerCommand, executeCommand } = useCommandStore.getState()
    const handler = vi.fn()
    
    registerCommand({ id: 'test.hello', title: 'Hello', handler })
    executeCommand('test.hello')
    
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
```

### Rust 后端测试

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_file_success() {
        let result = read_file("test.md");
        assert!(result.is_ok());
    }

    #[test]
    fn test_read_file_not_found() {
        let result = read_file("nonexistent.md");
        assert!(result.is_err());
    }
}
```

---

## 覆盖率要求

| 指标 | 最低要求 |
|------|---------|
| 整体覆盖率 | 80% |
| 核心组件 | 90% |
| 工具函数 | 85% |
| Hooks | 80% |

覆盖率在 `vitest.config.ts` 中配置：

```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'lcov', 'html'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  }
}
```

---

## 持续集成

所有测试在 GitHub Actions CI 中自动运行：

1. **前端测试** → `npm run test:run`
2. **覆盖率** → `npm run test:coverage` + 上传 Codecov
3. **后端测试** → `cd src-tauri && cargo test`
4. **Lint + 类型检查** → `npm run lint && npm run type-check`

**CI 通过条件**：
- 所有测试通过
- 覆盖率达标
- 无 TypeScript / Rust 编译错误
- 无 Lint 错误

---

## 最佳实践

### 1. 测试行为而非实现

```tsx
// ✅ 好：测试用户可见的行为
expect(screen.getByText('欢迎')).toBeInTheDocument()

// ❌ 差：测试内部实现细节
expect(component.state.isOpen).toBe(true)
```

### 2. 优先使用语义查询

按优先级排序：`getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByTestId`

### 3. 测试错误状态

```tsx
it('请求失败时应显示错误信息', async () => {
  mockApi.rejects(new Error('网络错误'))
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText('网络错误')).toBeInTheDocument()
  })
})
```

### 4. 测试后清理

```tsx
afterEach(() => {
  vi.clearAllMocks()
  cleanup()
})
```

### 5. 使用清晰的测试名称

```tsx
// ✅ 好
it('文件不存在时应显示错误消息', () => {})

// ❌ 差
it('错误', () => {})
```

---

## 常见问题

### 测试本地失败

```bash
# 1. 清理重装
rm -rf node_modules && npm install

# 2. 清理 Vitest 缓存
rm -rf node_modules/.vitest

# 3. 检查 Node.js 版本是否 ≥ 18
```

### 覆盖率不达标

1. 运行 `npm run test:coverage` 查看未覆盖行
2. 优先覆盖核心路径和错误分支
3. 使用参数化测试覆盖边界情况

### 测试不稳定（Flaky）

1. `afterEach` 中确保清理状态
2. 异步操作使用 `waitFor` 而非固定延时
3. 避免真实定时器，使用 `vi.useFakeTimers()`
