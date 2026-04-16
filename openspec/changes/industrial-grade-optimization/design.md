## Context

Seven MD 是一个基于 Tauri v2 + React 19 + TypeScript 构建的 macOS Markdown 阅读器桌面应用。当前项目架构合理，技术栈现代化，但在工业级软件的关键质量属性上存在不足：

- **测试覆盖率低**：仅约 20%，核心组件和业务逻辑未覆盖
- **错误处理薄弱**：缺少错误边界，组件错误会导致应用崩溃
- **日志系统缺失**：仅有 console.log，无法追溯生产环境问题
- **性能监控空白**：无法识别性能瓶颈
- **安全性待加固**：缺少 CSP、代码签名等安全措施
- **CI/CD 不完整**：未运行测试，无覆盖率报告

**约束条件**：
- 必须保持向后兼容，不能破坏现有功能
- 优化工作需要分阶段进行，优先级明确
- 新增依赖需谨慎评估，避免引入安全风险
- 需考虑打包体积和运行时性能影响

## Goals / Non-Goals

**Goals:**
1. 建立完善的测试体系，覆盖率达到 ≥80%
2. 实现全局错误捕获和恢复机制
3. 构建结构化日志系统，支持分级和持久化
4. 添加性能监控能力，识别性能瓶颈
5. 加固应用安全性，符合桌面应用安全最佳实践
6. 完善 CI/CD 流程，确保代码质量
7. 提升可访问性，符合 WCAG 2.1 AA 标准
8. 支持国际化，至少支持中英文

**Non-Goals:**
- 不涉及功能需求变更
- 不重构现有核心架构
- 不引入额外的第三方服务（如 Sentry）
- 不实现自动更新机制（可作为后续优化）
- 不涉及移动端适配

## Decisions

### 1. 测试框架选择

**决策**：使用 Vitest + React Testing Library + @testing-library/user-event

**理由**：
- Vitest 已在项目中配置，与 Vite 无缝集成，速度快
- React Testing Library 是 React 测试的标准选择
- 支持组件测试、hooks 测试、集成测试

**替代方案考虑**：
- Jest：配置更复杂，与 Vite 集成需要额外配置
- Cypress：更适合 E2E 测试，单元测试过于重量级

**Rust 后端测试**：
- 使用 Rust 内置测试框架 `#[cfg(test)]`
- 使用 `tauri::test` 进行集成测试

### 2. 日志系统架构

**决策**：
- 前端：使用 `loglevel` + 自定义 plugin 实现持久化
- 后端：使用 `log` + `env_logger` + 文件输出

**理由**：
- loglevel 轻量级（~1KB），满足前端日志需求
- log crate 是 Rust 生态标准选择
- 自定义 plugin 可实现日志持久化到本地文件

**日志分级策略**：
```
DEBUG   - 开发环境详细日志
INFO    - 关键操作日志（文件打开、保存等）
WARN    - 潜在问题（性能警告、弃用警告）
ERROR   - 错误但可恢复
```

**持久化方案**：
- 前端日志通过 Tauri IPC 调用写入后端文件
- 日志文件路径：`~/.seven-md/logs/app-{date}.log`
- 日志轮转：保留最近 7 天的日志

### 3. 错误边界设计

**决策**：实现多层级 ErrorBoundary

**层级结构**：
```
<App>                    // 全局 ErrorBoundary
  <TitleBar />
  <Sidebar>              // Sidebar ErrorBoundary
    <FileTree />
  </Sidebar>
  <MainContent>          // MainContent ErrorBoundary
    <EditorPane />
    <PreviewPane />
  </MainContent>
</App>
```

**错误恢复策略**：
- 显示友好错误界面，提供"重试"和"重新加载"按钮
- 记录错误详情到日志系统
- 支持错误上报（可选配置）

### 4. 性能监控方案

**决策**：自定义 hooks + Performance API

**监控指标**：
| 指标 | 实现方式 | 阈值 |
|------|---------|------|
| 组件渲染时间 | useEffect + performance.now() | >16ms 警告 |
| 文件操作耗时 | Tauri command 时间戳差值 | >100ms 警告 |
| 内存使用 | process.memoryUsage() (开发环境) | 持续增长警告 |

**实现方式**：
```typescript
// usePerformanceMonitor.ts
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()
    return () => {
      const renderTime = performance.now() - startTime
      if (renderTime > 16) {
        logger.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`)
      }
    }
  })
}
```

### 5. 安全加固措施

**决策**：多层次安全防护

**CSP 配置**：
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self' https://api.github.com;
```

**代码签名**：
- macOS：使用 Developer ID Application 证书签名
- 启用 Hardened Runtime
- 配置 Entitlements

**Tauri 权限最小化**：
- 仅启用必要的 API 权限
- 配置 `allowlist` 限制文件访问范围

### 6. CI/CD 流程优化

**决策**：增强 GitHub Actions 工作流

**新增步骤**：
```yaml
jobs:
  test:
    - npm run test:run
    - npm run test:coverage
    - Upload to Codecov
  
  lint:
    - npm run lint
    - npm run typecheck
  
  security:
    - npm audit
    - cargo audit
  
  build:
    - Build for macOS
    - Code signing
    - Notarization
```

### 7. 可访问性实现

**决策**：渐进式 A11Y 增强

**实施策略**：
- 第一阶段：添加 ARIA 标签、键盘导航
- 第二阶段：屏幕阅读器支持
- 第三阶段：高对比度主题

**键盘快捷键**：
| 快捷键 | 功能 |
|--------|------|
| Cmd+O | 打开文件 |
| Cmd+S | 保存文件 |
| Cmd+, | 打开设置 |
| Cmd+[ | 侧边栏切换 |
| Escape | 关闭弹窗 |

### 8. 国际化方案

**决策**：react-i18next

**理由**：
- 成熟的国际化方案，社区活跃
- 支持命名空间，便于模块化管理
- 支持动态加载语言包

**语言包结构**：
```
src/locales/
  en/
    common.json
    menu.json
    errors.json
  zh-CN/
    common.json
    menu.json
    errors.json
```

## Risks / Trade-offs

### 风险 1：测试覆盖率目标难以达成
**风险描述**：80% 覆盖率目标可能在初期难以达成，影响开发进度
**缓解措施**：
- 设置阶段性目标：P0 功能 100% 覆盖 → 核心功能 80% → 全局 80%
- 优先测试核心业务逻辑，非关键 UI 可适当降低覆盖率

### 风险 2：日志持久化性能影响
**风险描述**：频繁写入日志文件可能影响应用性能
**缓解措施**：
- 使用批量写入策略，缓冲日志 5 秒后批量写入
- 仅在 ERROR 级别立即写入
- 生产环境默认 INFO 级别，减少日志量

### 风险 3：代码签名成本
**风险描述**：macOS 代码签名需要 Apple Developer 账号（$99/年）
**缓解措施**：
- 生产环境使用正式证书
- 开发/测试环境可跳过签名（添加警告提示）
- 文档说明如何配置签名

### 风险 4：性能监控误报
**风险描述**：性能监控可能产生大量警告，干扰开发
**缓解措施**：
- 开发环境显示详细性能日志
- 生产环境仅记录超过阈值的情况
- 提供配置项调整监控灵敏度

### 风险 5：国际化翻译质量
**风险描述**：翻译可能不准确或不自然
**缓解措施**：
- 使用专业翻译工具辅助
- 建立术语表，保持一致性
- 社区贡献翻译（后续）

## Migration Plan

### 阶段 1：P0 关键优化（预计 2 周）
1. **Week 1**：
   - 实现错误边界
   - 搭建日志系统框架
   - 为核心组件添加测试

2. **Week 2**：
   - 完善日志持久化
   - 完成 P0 功能测试覆盖
   - 集成到 CI 流程

### 阶段 2：P1 重要优化（预计 2 周）
1. **Week 3**：
   - 实现性能监控
   - 配置 CSP 策略
   - 增强 CI/CD

2. **Week 4**：
   - 代码签名配置
   - 完成核心功能测试覆盖
   - 集成覆盖率报告

### 阶段 3：P2 持续改进（预计 2 周）
1. **Week 5**：
   - 添加 ARIA 标签
   - 实现键盘导航
   - 配置国际化框架

2. **Week 6**：
   - 完成中英文翻译
   - 文档完善
   - 全面测试

### 回滚策略
- 所有变更通过 feature flag 控制，可随时关闭
- 日志系统可降级到 console.log
- 性能监控可通过配置禁用
- 国际化可通过配置回退到默认语言

## Open Questions

1. **错误上报服务**：是否需要集成 Sentry 等错误上报服务？还是仅本地日志？
2. **自动更新**：是否需要实现自动更新机制？
3. **多平台支持**：是否计划支持 Windows/Linux？影响代码签名和打包策略
4. **性能监控上报**：是否需要将性能数据上报到服务器进行分析？
