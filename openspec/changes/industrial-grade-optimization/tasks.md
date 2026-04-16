## 1. P0 - 错误边界实现

- [x] 1.1 安装依赖：无需额外依赖（React 内置 ErrorBoundary）
- [x] 1.2 创建 `src/components/ErrorBoundary/ErrorBoundary.tsx` 组件
- [x] 1.3 创建 `src/components/ErrorBoundary/FallbackUI.tsx` 错误显示界面
- [x] 1.4 在 `src/App.tsx` 添加全局 ErrorBoundary
- [x] 1.5 在 Sidebar 添加 ErrorBoundary
- [x] 1.6 在 MainContent 添加 ErrorBoundary
- [x] 1.7 创建 `src/components/ErrorBoundary/ErrorBoundary.test.tsx` 测试文件
- [x] 1.8 验证错误边界在开发环境显示详细信息
- [x] 1.9 验证错误边界在生产环境隐藏敏感信息

## 2. P0 - 日志系统搭建

### 2.1 前端日志

- [x] 2.1.1 安装依赖：`npm install loglevel @types/loglevel`
- [x] 2.1.2 创建 `src/utils/logger.ts` 日志配置文件
- [x] 2.1.3 创建 `src/utils/logger.test.ts` 测试文件
- [x] 2.1.4 创建 Tauri command 用于写入日志文件（Rust 端）
- [x] 2.1.5 创建日志持久化插件 `src/utils/loggerPersistence.ts`
- [x] 2.1.6 配置开发环境日志级别为 DEBUG
- [x] 2.1.7 配置生产环境日志级别为 INFO
- [x] 2.1.8 替换现有 `console.log` 为 `logger.info/debug`

### 2.2 Rust 后端日志

- [x] 2.2.1 在 `src-tauri/Cargo.toml` 添加依赖：log, env_logger, thiserror
- [x] 2.2.2 配置 `src-tauri/src/logger.rs` 日志模块
- [x] 2.2.3 实现日志文件写入功能
- [x] 2.2.4 实现日志轮转（保留 7 天）
- [x] 2.2.5 在 `main.rs` 初始化日志系统
- [x] 2.2.6 为现有 Tauri commands 添加日志记录
- [x] 2.2.7 创建 Rust 日志测试 `src-tauri/src/logger/test.rs`
## 3. P0 - 测试覆盖率提升

### 3.1 核心组件测试

- [x] 3.1.1 创建 `src/App.test.tsx` 测试文件
- [x] 3.1.2 创建 `src/components/Sidebar/Sidebar.test.tsx` 测试文件
- [x] 3.1.3 创建 `src/components/EditorPane/EditorPane.test.tsx` 测试文件
- [x] 3.1.4 创建 `src/components/PreviewPane/PreviewPane.test.tsx` 测试文件
- [x] 3.1.5 创建 `src/components/FileTree/FileTree.test.tsx` 测试文件
- [x] 3.1.6 完善 `src/components/TitleBar/index.test.tsx` 测试

### 3.2 Reducer 测试

- [x] 3.2.1 创建 `src/context/reducer.test.ts` 测试文件
- [x] 3.2.2 测试所有 action 类型的状态转换
- [x] 3.2.3 测试边界情况（undefined state, invalid action）

### 3.3 Hooks 测试

- [x] 3.3.1 完善 `src/hooks/useFileOperations.test.ts` 测试
- [x] 3.3.2 创建 `src/hooks/useTheme.test.ts` 测试文件
- [x] 3.3.3 创建 `src/hooks/useKeyboardShortcuts.test.ts` 测试文件
### 3.4 Rust 后端测试

- [x] 3.4.1 创建 `src-tauri/src/commands.rs` 测试模块
- [x] 3.4.2 为文件读取命令添加测试
- [x] 3.4.3 为文件写入命令添加测试
- [x] 3.4.4 为错误处理添加测试

### 3.5 集成测试

- [x] 3.5.1 创建 `src/tests/integration/fileOperations.test.tsx`
- [x] 3.5.2 创建 `src/tests/integration/themeToggle.test.tsx`
- [x] 3.5.3 创建 `src/tests/integration/sidebarToggle.test.tsx`

### 3.6 覆盖率配置

- [x] 3.6.1 配置 `vitest.config.ts` 覆盖率报告
- [x] 3.6.2 设置覆盖率阈值（80%）
- [x] 3.6.3 运行覆盖率报告验证达标（当前：80.87%，目标：80%）

## 4. P1 - 性能监控

### 4.1 渲染性能监控

- [x] 4.1.1 创建 `src/hooks/usePerformanceMonitor.ts`
- [x] 4.1.2 创建 `src/hooks/usePerformanceMonitor.test.ts`
- [x] 4.1.3 在核心组件中集成性能监控
- [x] 4.1.4 配置慢渲染阈值（>16ms）

### 4.2 文件操作性能监控

- [x] 4.2.1 创建 `src/hooks/useFileOperationTiming.ts`
- [x] 4.2.2 创建 `src/hooks/useFileOperationTiming.test.ts`
- [ ] 4.2.3 在文件操作中集成性能监控
- [x] 4.2.4 配置慢操作阈值（>100ms）

### 4.3 内存监控（开发环境）

- [x] 4.3.1 创建 `src/utils/memoryMonitor.ts`
- [x] 4.3.2 实现内存使用追踪（仅开发环境）
- [x] 4.3.3 配置内存增长警告阈值

### 4.4 性能仪表盘（开发环境）

- [x] 4.4.1 创建 `src/components/DevTools/PerformanceDashboard.tsx`
- [x] 4.4.2 实现性能指标可视化
- [x] 4.4.3 添加开发者工具栏入口

## 5. P1 - 安全加固

### 5.1 CSP 配置

- [x] 5.1.1 在 `tauri.conf.json5` 配置 CSP 策略
- [x] 5.1.2 测试 CSP 不影响正常功能
- [x] 5.1.3 实现 CSP 违规报告（开发环境）

### 5.2 代码签名配置

- [ ] 5.2.1 配置 macOS 签证证书环境变量
- [ ] 5.2.2 在 `tauri.conf.json5` 配置签名信息
- [ ] 5.2.3 配置 Hardened Runtime
- [ ] 5.2.4 配置 Entitlements
- [ ] 5.2.5 测试签名构建流程

### 5.3 权限最小化

- [x] 5.3.1 审查 `tauri.conf.json5` allowlist
- [x] 5.3.2 移除不必要的 API 权限
- [x] 5.3.3 限制文件访问范围
- [x] 5.3.4 测试权限限制不影响功能

### 5.4 输入验证

- [x] 5.4.1 创建 `src/utils/pathValidator.ts` 路径验证工具
- [x] 5.4.2 创建 `src/utils/pathValidator.test.ts` 测试
- [x] 5.4.3 创建 `src/utils/inputSanitizer.ts` 输入清理工具
- [ ] 5.4.4 在文件操作中集成路径验证
- [ ] 5.4.5 在用户输入处理中集成清理

### 5.5 依赖安全审计

- [x] 5.5.1 运行 `npm audit` 检查前端依赖
- [x] 5.5.2 运行 `cargo audit` 检查 Rust 依赖
- [x] 5.5.3 修复发现的安全漏洞

## 6. P1 - CI/CD 完善

### 6.1 测试集成

- [x] 6.1.1 在 `.github/workflows/ci.yml` 添加测试步骤
- [x] 6.1.2 添加前端测试运行
- [x] 6.1.3 添加 Rust 测试运行
- [x] 6.1.4 添加覆盖率报告生成
- [x] 6.1.5 集成 Codecov 上传

### 6.2 代码质量检查

- [x] 6.2.1 添加 ESLint 检查步骤
- [x] 6.2.2 添加 TypeScript 类型检查步骤
- [x] 6.2.3 添加 Rustfmt 检查步骤
- [x] 6.2.4 添加 Clippy 检查步骤

### 6.3 安全审计集成

- [x] 6.3.1 添加 `npm audit` 步骤
- [x] 6.3.2 添加 `cargo audit` 步骤
- [x] 6.3.3 配置漏洞发现时构建失败

### 6.4 构建自动化

- [x] 6.4.1 添加 macOS 开发构建步骤
- [x] 6.4.2 添加 macOS 生产构建步骤
- [ ] 6.4.3 集成代码签名到 CI
- [ ] 6.4.4 集成公证到 CI

### 6.5 发布自动化

- [ ] 6.5.1 创建 `.github/workflows/release.yml`
- [ ] 6.5.2 配置版本标签自动创建
- [ ] 6.5.3 配置 GitHub Release 创建
- [ ] 6.5.4 配置构建产物上传

## 7. P2 - 可访问性

### 7.1 ARIA 标签

- [x] 7.1.1 为所有按钮添加 `aria-label`
- [x] 7.1.2 为图标按钮添加描述性标签
- [ ] 7.1.3 为表单字段添加关联标签
- [x] 7.1.4 为动态内容添加 `aria-live` 区域

### 7.2 键盘导航

- [x] 7.2.1 创建 `src/hooks/useKeyboardNavigation.ts`
- [x] 7.2.2 实现 Tab 键焦点导航
- [x] 7.2.3 实现 Enter/Space 按钮激活
- [x] 7.2.4 实现 Escape 关闭模态框
- [x] 7.2.5 实现焦点陷阱（模态框）
- [x] 7.2.6 实现焦点恢复（模态框关闭后）

### 7.3 键盘快捷键

- [ ] 7.3.1 实现 Cmd+O 打开文件
- [ ] 7.3.2 实现 Cmd+S 保存文件
- [ ] 7.3.3 实现 Cmd+, 打开设置
- [ ] 7.3.4 实现 Cmd+[ 切换侧边栏
- [ ] 7.3.5 创建快捷键文档

### 7.4 焦点管理

- [x] 7.4.1 创建 `src/utils/focusManager.ts`
- [x] 7.4.2 实现焦点指示器样式
- [ ] 7.4.3 确保焦点顺序符合视觉布局

### 7.5 屏幕阅读器支持

- [x] 7.5.1 实现加载状态播报
- [x] 7.5.2 实现错误状态播报
- [x] 7.5.3 实现成功操作播报

### 7.6 颜色对比度

- [ ] 7.6.1 审查所有文本颜色对比度
- [ ] 7.6.2 审查 UI 组件边界对比度
- [ ] 7.6.3 修复不达标的对比度问题

### 7.7 减少动画支持

- [x] 7.7.1 检测 `prefers-reduced-motion` 设置
- [x] 7.7.2 为减少动画用户禁用过渡动画
- [x] 7.7.3 创建 `src/styles/reducedMotion.css`

### 7.8 无障碍测试

- [ ] 7.8.1 使用 axe-core 运行无障碍审计
- [ ] 7.8.2 使用 VoiceOver 测试屏幕阅读器
- [ ] 7.8.3 使用键盘完全导航应用
- [ ] 7.8.4 修复发现的无障碍问题

## 8. P2 - 国际化

### 8.1 框架配置

- [x] 8.1.1 安装依赖：`npm install react-i18next i18next`
- [x] 8.1.2 创建 `src/i18n/config.ts` 配置文件
- [x] 8.1.3 在 `src/main.tsx` 初始化 i18n

### 8.2 语言包创建

- [x] 8.2.1 创建 `src/locales/en/common.json`
- [x] 8.2.2 创建 `src/locales/en/menu.json`
- [x] 8.2.3 创建 `src/locales/en/errors.json`
- [x] 8.2.4 创建 `src/locales/en/settings.json`
- [x] 8.2.5 创建 `src/locales/zh-CN/common.json`
- [x] 8.2.6 创建 `src/locales/zh-CN/menu.json`
- [x] 8.2.7 创建 `src/locales/zh-CN/errors.json`
- [x] 8.2.8 创建 `src/locales/zh-CN/settings.json`

### 8.3 字符串外置

- [x] 8.3.1 替换 TitleBar 中的硬编码文本
- [x] 8.3.2 替换 Sidebar 中的硬编码文本
- [x] 8.3.3 替换 MenuBar 中的硬编码文本
- [x] 8.3.4 替换 EditorPane 中的硬编码文本
- [x] 8.3.5 替换 PreviewPane 中的硬编码文本
- [x] 8.3.6 替换错误消息中的硬编码文本

### 8.4 语言选择器
- [x] 8.4.1 创建 `src/components/LanguageSelector.tsx`
- [x] 8.4.2 实现语言切换功能
- [x] 8.4.3 实现语言偏好持久化
- [x] 8.4.4 实现系统语言自动检测

### 8.5 日期数字格式化

- [x] 8.5.1 创建 `src/utils/formatters.ts`
- [x] 8.5.2 实现本地化日期格式化
- [x] 8.5.3 实现本地化数字格式化
- [x] 8.5.4 替换现有日期显示使用格式化函数

### 8.6 RTL 支持

- [x] 8.6.1 创建 `src/styles/rtl.css`
- [x] 8.6.2 实现语言方向检测
- [x] 8.6.3 为 RTL 语言应用镜像样式

## 9. 文档完善

### 9.1 API 文档

- [x] 9.1.1 为核心函数添加 TSDoc 注释
- [x] 9.1.2 为核心 hooks 添加 TSDoc 注释
- [x] 9.1.3 为核心组件添加 TSDoc 注释
- [x] 9.1.4 配置 TypeDoc 生成 API 文档

### 9.2 开发指南扩展

- [x] 9.2.1 创建 `docs/TESTING.md` 测试指南
- [x] 9.2.2 创建 `docs/DEBUGGING.md` 调试指南
- [x] 9.2.3 创建 `docs/CONTRIBUTING-CODE.md` 代码贡献指南
- [x] 9.2.4 更新 `docs/ARCHITECTURE.md` 添加新模块说明

### 9.3 用户手册

- [x] 9.3.1 创建 `docs/USER-GUIDE.md` 用户使用手册
- [ ] 9.3.2 添加功能说明截图
- [x] 9.3.3 添加快捷键参考表
- [x] 9.3.4 添加常见问题解答

## 10. 最终验证

- [ ] 10.1 运行完整测试套件并确保通过
- [ ] 10.2 验证测试覆盖率达到 80%
- [ ] 10.3 验证所有 CI 检查通过
- [ ] 10.4 进行手动功能测试
- [ ] 10.5 进行性能回归测试
- [ ] 10.6 进行安全审计
- [ ] 10.7 进行无障碍审计
- [ ] 10.8 进行国际化验证（中英文）
- [ ] 10.9 更新 CHANGELOG.md
- [ ] 10.10 创建发布标签
