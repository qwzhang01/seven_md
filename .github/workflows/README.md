# GitHub Actions 自动构建和发布

本项目使用 GitHub Actions 实现多平台自动构建和发布功能。

## 发布流程

### 触发条件
- 当推送包含 `v*` 格式的标签时自动触发（例如：`v1.0.0`、`v1.2.3-beta.1`）

### 构建平台
- **macOS**: 支持 Intel 和 Apple Silicon 架构
- **Windows**: 支持 x86_64 架构
- **Linux**: 支持 x86_64 架构

## 使用方法

### 1. 创建发布版本

```bash
# 更新版本号（如果需要）
npm version patch  # 或 minor、major

# 创建并推送标签
git tag v1.0.0
git push origin v1.0.0
```

### 2. 查看构建状态

1. 前往 GitHub 仓库的 "Actions" 标签页
2. 查看 "Build and Release" 工作流运行状态
3. 等待所有平台的构建完成

### 3. 发布版本

构建完成后：
1. 前往 GitHub 仓库的 "Releases" 页面
2. 找到自动创建的草稿版本
3. 编辑发布说明并发布版本

## 构建产物

每个平台都会生成相应的安装包：

- **macOS**: `.dmg` 安装包
- **Windows**: `.msi` 和 `.exe` 安装包
- **Linux**: `.AppImage` 和 `.deb` 包

## 配置说明

### 环境变量
- `TAURI_PLATFORM`: 指定构建目标平台
- `GITHUB_TOKEN`: GitHub API 令牌（自动提供）

### 缓存策略
- Node.js 依赖缓存
- Rust/Cargo 构建缓存
- 加速后续构建过程

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Rust 工具链是否正确安装
   - 确认所有依赖项已正确配置

2. **发布失败**
   - 确认 GitHub Token 有足够的权限
   - 检查标签格式是否正确

3. **平台特定问题**
   - macOS: 需要 Xcode Command Line Tools
   - Windows: 需要 Visual Studio Build Tools
   - Linux: 需要标准开发工具链

### 手动触发

如果需要手动触发构建，可以在 Actions 页面手动运行工作流。

## 相关文件

- `.github/workflows/release.yml`: 主构建工作流
- `src-tauri/tauri.conf.json5`: Tauri 构建配置
- `package.json`: 项目构建脚本