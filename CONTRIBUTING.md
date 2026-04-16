# Contributing to Seven MD

感谢你考虑为 Seven MD 做贡献！🎉

## 📋 目录

- [行为准则](#行为准则)
- [我能做什么贡献？](#我能做什么贡献)
- [开发流程](#开发流程)
- [提交规范](#提交规范)
- [代码规范](#代码规范)
- [Pull Request 流程](#pull-request-流程)

## 行为准则

本项目采用贡献者公约作为行为准则。参与此项目即表示你同意遵守其条款。请阅读 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) 了解详情。

## 我能做什么贡献？

### 🐛 报告 Bug

如果你发现了 bug，请通过 [GitHub Issues](../../issues) 提交报告。提交前请：

1. 搜索已有的 issues，确认该 bug 未被报告
2. 使用 Bug Report 模板创建新 issue
3. 提供详细的重现步骤和环境信息

### 💡 提出新功能

如果你有新功能的想法：

1. 先搜索已有的 issues 和 discussions
2. 通过 Feature Request 模板提交 issue
3. 清晰描述功能需求和使用场景

### 📝 改进文档

文档改进包括：

- 修正拼写或语法错误
- 添加缺失的文档
- 改进现有文档的清晰度
- 翻译文档

### 🔧 提交代码

请参考下面的开发流程和代码规范。

## 开发流程

### 环境准备

1. **Fork 并克隆仓库**

```bash
git clone https://github.com/YOUR_USERNAME/seven_md.git
cd seven_md
```

2. **安装依赖**

```bash
# 安装 Node.js 依赖
npm install

# 安装 Rust（如果未安装）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

3. **运行开发服务器**

```bash
npm run tauri:dev
```

### 分支管理

- `main` - 主分支，保持稳定
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - Bug 修复分支
- `hotfix/*` - 紧急修复分支

创建新分支：

```bash
git checkout -b feature/your-feature-name
```

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关
- `ci`: CI 配置相关

### 示例

```bash
feat(editor): add syntax highlighting for code blocks

fix(preview): resolve markdown rendering issue with tables

docs(readme): update installation instructions
```

## 代码规范

### TypeScript/React

- 使用 TypeScript 严格模式
- 使用函数组件和 Hooks
- 遵循 ESLint 和 Prettier 配置
- 组件命名使用 PascalCase
- 函数/变量命名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

### Rust

- 遵循 Rust 标准代码风格
- 使用 `cargo fmt` 格式化代码
- 使用 `cargo clippy` 检查代码质量
- 添加必要的注释和文档

### 通用规范

- 保持代码简洁清晰
- 添加必要的注释
- 编写有意义的 commit message
- 更新相关文档

## Pull Request 流程

### 提交 PR 前

1. ✅ 确保代码通过所有测试
2. ✅ 运行 `npm run lint` 检查代码规范
3. ✅ 更新相关文档
4. ✅ 添加必要的测试用例
5. ✅ 遵循 commit message 规范

### PR 标题

使用与 commit message 相同的格式：

```
feat: add dark mode support
fix: resolve memory leak in preview pane
```

### PR 描述

使用 Pull Request 模板，包括：

- 变更说明
- 关联的 Issue
- 测试方法
- 截图（如适用）

### Review 流程

1. 至少需要一位 reviewer 审核
2. 解决所有 review 意见
3. 通过 CI 检查
4. Squash and merge 到主分支

## 🙏 感谢

感谢所有贡献者的付出！你的每一份贡献都让这个项目变得更好。

如有疑问，欢迎在 [Discussions](../../discussions) 中提问。
