## Why

Seven MD 作为一个 macOS Markdown 阅读器桌面应用，当前架构合理且技术栈现代化，但作为工业级软件，在测试覆盖率、错误处理、监控、安全性等方面存在明显不足。这些缺陷可能导致生产环境下的稳定性问题、难以排查的 bug、以及安全风险。现在进行优化可以提升应用的可靠性、可维护性和用户体验。

## What Changes

### P0 - 关键优化（立即修复）
- **测试覆盖率提升**：从当前约 20% 提升至 ≥80%，覆盖核心组件、hooks、reducer 和 Rust 后端
- **错误边界实现**：添加 React ErrorBoundary 组件，防止单个组件错误导致整个应用崩溃
- **结构化日志系统**：引入前端日志库（loglevel）和 Rust 日志系统（log + env_logger），实现日志分级和持久化

### P1 - 重要优化
- **性能监控**：添加渲染性能监控、文件操作性能追踪、内存使用监控
- **安全性加固**：配置 CSP 策略、启用代码签名、完善 Tauri 安全配置
- **CI/CD 完善**：集成测试运行、代码覆盖率报告、自动发布流程

### P2 - 持续改进
- **可访问性（A11Y）**：添加 ARIA 标签、键盘导航、屏幕阅读器支持
- **国际化（i18n）**：引入 react-i18next，支持多语言切换
- **文档完善**：添加 API 文档、用户手册、开发指南扩展

## Capabilities

### New Capabilities
- `error-boundary`: 全局错误捕获和恢复机制，提供友好的错误提示界面
- `logging-system`: 结构化日志系统，支持日志分级（DEBUG/INFO/WARN/ERROR）、持久化存储、日志查询
- `performance-monitoring`: 性能监控能力，包括组件渲染时间、文件操作耗时、内存使用情况
- `test-coverage`: 完善的测试体系，包括单元测试、集成测试、E2E 测试，覆盖率 ≥80%
- `security-hardening`: 安全加固，包括 CSP 配置、代码签名、权限最小化
- `accessibility`: 可访问性支持，符合 WCAG 2.1 AA 标准
- `internationalization`: 国际化支持，支持中英文切换

### Modified Capabilities
- `ci-cd`: 增强 CI/CD 流程，添加测试运行、覆盖率报告、自动发布

## Impact

- **dependencies**: 
  - 前端：loglevel、@types/loglevel、react-i18next、@testing-library/react-hooks
  - Rust：log、env_logger、thiserror
- **affected-code**: 
  - `src/App.tsx` - 添加 ErrorBoundary 包裹
  - `src/context/AppContext.tsx` - 添加性能监控
  - `src-tauri/src/main.rs` - 添加日志系统
  - `src-tauri/tauri.conf.json5` - 安全配置
  - `.github/workflows/ci.yml` - CI 流程增强
- **affected-apis**: 
  - 新增日志 API：`logger.info()`、`logger.error()` 等
  - 新增性能监控 API：`usePerformanceMonitor()`
- **breaking-changes**: 无破坏性变更，所有优化均为增量添加
