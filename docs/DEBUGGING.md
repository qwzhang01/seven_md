# 调试指南

本文档说明如何高效调试 Seven MD 应用。

---

## 目录

- [开发工具](#开发工具)
- [前端调试](#前端调试)
- [后端调试](#后端调试)
- [性能调试](#性能调试)
- [常见问题排查](#常见问题排查)
- [调试清单](#调试清单)

---

## 开发工具

### 必备工具

1. **Chrome DevTools** - 内嵌于 Tauri webview
2. **Rust Analyzer** - VS Code 中的 Rust 调试支持
3. **React DevTools** - React 组件和状态检查

### 启动调试环境

```bash
# 开发模式运行（自动开启 DevTools）
npm run tauri:dev
```

### 打开 DevTools

- macOS：`Cmd+Option+I`
- 或右键点击 → "Inspect"

---

## 前端调试

### 日志系统

项目使用结构化日志工具 `createLogger`：

```typescript
import { createLogger } from '../utils/logger'

const logger = createLogger('MyComponent')

// 5 个级别
logger.trace('详细追踪信息')
logger.debug('调试信息')
logger.info('一般信息')
logger.warn('警告')
logger.error('错误', { error: String(error) })
```

| 级别 | 开发环境 | 生产环境 | 用途 |
|------|---------|---------|------|
| trace | ✓ | ✗ | 详细流程追踪 |
| debug | ✓ | ✗ | 调试信息 |
| info | ✓ | ✓ | 重要事件 |
| warn | ✓ | ✓ | 潜在问题 |
| error | ✓ | ✓ | 错误和异常 |

### Zustand Store 调试

项目使用 **Zustand** 进行状态管理（8 个 Store），调试方式如下：

```typescript
// 方式 1：直接在 DevTools Console 中读取 Store 状态
// （Zustand Store 可以在任何地方通过 getState() 访问）
import { useEditorStore } from '../stores'
console.log('编辑器状态:', useEditorStore.getState())

// 方式 2：订阅状态变化
useEditorStore.subscribe((state) => {
  console.log('Store 变更:', state)
})

// 方式 3：在组件中使用 useEffect 追踪
import { useUIStore } from '../stores'

function MyComponent() {
  const sidebarVisible = useUIStore(s => s.sidebarVisible)
  
  useEffect(() => {
    console.log('侧边栏状态:', sidebarVisible)
  }, [sidebarVisible])
}
```

**常用 Store 一览**：

| Store | 调试场景 |
|-------|---------|
| `useEditorStore` | 编辑器内容、光标位置、选区 |
| `useUIStore` | 侧边栏/面板可见性、视图模式 |
| `useThemeStore` | 主题状态 |
| `useFileStore` | 文件树、当前文件路径 |
| `useAIStore` | AI 对话消息、加载状态 |
| `useNotificationStore` | 通知队列 |
| `useCommandStore` | 已注册命令列表 |
| `useSettingsStore` | 用户偏好设置 |

### React DevTools

1. 安装 React DevTools 浏览器扩展
2. 打开 DevTools → "Components" / "Profiler" 标签
3. 检查组件 props、state、hooks

### 使用断点

1. DevTools → Sources
2. 找到源文件（可能在 webpack:// 下）
3. 点击行号设置断点
4. 触发对应操作命中断点

右键断点可添加条件表达式：`state.file.path !== null`

---

## 后端调试

### Rust 日志

```rust
use log::{debug, info, warn, error};

fn my_function() {
    debug!("调试信息");
    info!("一般信息");
    warn!("警告信息");
    error!("错误信息");
}
```

### 快速调试

```rust
println!("变量值: {:?}", my_variable);
```

### VS Code Rust 调试

1. 安装 `vadimcn.vscode-lldb` 扩展
2. 创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Tauri Development Debug",
      "cargo": {
        "args": [
          "build",
          "--manifest-path=./src-tauri/Cargo.toml"
        ]
      },
      "preLaunchTask": "ui:dev"
    }
  ]
}
```

### Tauri Command 调试

```rust
#[tauri::command]
async fn my_command(path: String) -> Result<String, String> {
    log::debug!("收到命令，路径: {}", path);
    // 业务逻辑
    log::debug!("返回结果");
    Ok(result)
}
```

---

## 性能调试

### 组件渲染计时

```tsx
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'

function MyComponent() {
  const { metrics } = usePerformanceMonitor('MyComponent', {
    slowRenderThreshold: 16, // ms
    warnOnSlowRender: true,
    logRenders: true,
  })
}
```

### 内存监控

```tsx
import { useMemoryMonitor } from '../hooks/usePerformanceMonitor'

function App() {
  // 开发模式下每 30 秒输出内存使用情况
  useMemoryMonitor(true)
}
```

### React Profiler

1. 打开 React DevTools → "Profiler" 标签
2. 点击录制按钮
3. 执行操作
4. 停止录制，查看各组件渲染耗时

### 内存泄漏排查

1. DevTools → Memory
2. 拍摄堆快照
3. 执行操作
4. 再次拍摄快照
5. 对比两个快照查找泄漏对象

---

## 常见问题排查

### 应用无法启动

**现象**：白屏或启动崩溃

1. 检查 Console 错误（`Cmd+Option+I`）
2. 检查终端 Rust 日志
3. 重新安装依赖：`npm install && cd src-tauri && cargo build`

### 文件操作失败

**现象**：无法打开或保存文件

1. 检查 `tauri.conf.json5` 权限配置
2. 验证文件路径有效性
3. 检查文件系统权限
4. 查看日志中的路径验证错误

### 主题不生效

**现象**：切换主题后无变化

1. 检查 `<html>` 元素的 data-theme 属性
2. 在 React DevTools 中检查 `useThemeStore` 状态
3. 查看 localStorage 中的保存值

```ts
// 快速调试
console.log('当前主题:', useThemeStore.getState().theme)
```

### 预览不更新

**现象**：编辑器内容变化但预览不同步

1. 检查 `useEditorStore` 中 content 是否更新
2. 检查防抖计时器是否卡住
3. 查看 Markdown 解析是否有错误

### 内存持续增长

**现象**：长时间使用后越来越慢

1. DevTools → Memory 拍摄堆快照
2. 检查是否有未清理的事件监听器
3. 检查 useEffect 是否有清理函数

```tsx
useEffect(() => {
  const handler = () => {}
  window.addEventListener('resize', handler)
  
  // 务必清理！
  return () => window.removeEventListener('resize', handler)
}, [])
```

---

## 调试清单

遇到问题时，按以下清单逐项排查：

1. [ ] 检查浏览器 Console 错误
2. [ ] 检查终端 Rust 日志
3. [ ] 在 React DevTools 中验证组件状态
4. [ ] 检查 Zustand Store 状态（`useXxxStore.getState()`）
5. [ ] 检查网络请求（如有）
6. [ ] 验证文件权限
7. [ ] 检查 Tauri 配置
8. [ ] 排查竞态条件（timing/race conditions）
9. [ ] 排查内存泄漏

---

## 获取帮助

如果无法自行解决：

1. 搜索 [GitHub Issues](https://github.com/qwzhang01/seven_md/issues)
2. 创建最小可复现的案例
3. 收集相关日志和截图
4. 提交新 Issue，附上：
   - 复现步骤
   - 预期行为
   - 实际行为
   - Console / Rust 日志
   - 运行环境信息
