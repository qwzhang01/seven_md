# Windows 安装指南

## 概述

本文档提供在 Windows 系统上安装和运行 Seven MD 的详细指南。

## 系统要求

### 最低要求
- **操作系统**: Windows 10 或更高版本 (64位)
- **内存**: 4GB RAM
- **存储空间**: 200MB 可用空间
- **显示器**: 1024x768 分辨率

### 推荐配置
- **操作系统**: Windows 11 (64位)
- **内存**: 8GB RAM 或更多
- **存储空间**: 500MB 可用空间
- **显示器**: 1920x1080 分辨率或更高

## 安装方法

### 方法一：使用安装包（推荐）

#### NSIS 安装包 (.exe)

1. 从 [GitHub Releases](https://github.com/qwzhang01/seven_md/releases) 下载最新版本的 `SevenMD_版本号_x64-setup.exe`
2. 双击运行安装程序
3. 按照安装向导的提示进行操作：
   - 选择安装语言
   - 接受许可协议
   - 选择安装目录（默认：`C:\Program Files\Seven MD`）
   - 选择是否创建桌面快捷方式和开始菜单项
   - 点击"安装"开始安装
4. 安装完成后，点击"完成"启动应用

#### MSI 安装包 (.msi)

1. 下载 `SevenMD_版本号_x64.msi` 文件
2. 右键点击文件，选择"安装"
3. 或使用命令行安装：
   ```cmd
   msiexec /i "SevenMD_版本号_x64.msi" /qn
   ```

### 方法二：便携版（无需安装）

1. 下载 `SevenMD_版本号_x64-portable.zip`
2. 解压到任意目录
3. 运行 `Seven MD.exe` 即可使用

### 方法三：从源代码构建

#### 开发环境设置

1. **安装 Node.js** (18+)
   - 下载并安装 [Node.js](https://nodejs.org/)
   - 验证安装：`node --version`

2. **安装 Rust**
   - 使用 winget 安装：
     ```powershell
     winget install Rustlang.Rust.MSVC
     ```
   - 或使用 rustup：
     ```powershell
     curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs/ | sh
     ```
   - 重启终端后验证：`rustc --version`

3. **安装 Microsoft Visual C++ Build Tools**
   - 下载并安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - 或安装 [Visual Studio](https://visualstudio.microsoft.com/) 并选择 C++ 开发工具

#### 构建步骤

1. 克隆仓库：
   ```bash
   git clone https://github.com/qwzhang01/seven_md.git
   cd seven_md
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 开发模式运行：
   ```bash
   npm run tauri:dev
   ```

4. 构建生产版本：
   ```bash
   npm run tauri:build
   ```

## 首次运行

### 启动应用
- **安装版**: 从开始菜单或桌面快捷方式启动
- **便携版**: 双击 `Seven MD.exe`
- **开发版**: 运行 `npm run tauri:dev`

### 初始设置
1. 首次启动时会显示欢迎界面
2. 可以选择主题（暗黑/浅色）
3. 设置默认文件保存位置
4. 配置 Markdown 渲染选项

## 功能验证

安装完成后，请验证以下功能是否正常工作：

### 基本功能
- [ ] 应用正常启动
- [ ] 界面显示正常
- [ ] 主题切换功能
- [ ] 文件打开/保存

### Windows 特定功能
- [ ] 窗口控制按钮（最小化/最大化/关闭）
- [ ] 系统托盘图标
- [ ] 文件关联（.md 文件）
- [ ] 高 DPI 显示支持

## 故障排除

### 常见问题

#### 应用无法启动
- **解决方案**: 检查系统要求是否满足
- **解决方案**: 以管理员身份运行
- **解决方案**: 重新安装 Visual C++ Redistributable

#### 界面显示异常
- **解决方案**: 检查显示缩放设置
- **解决方案**: 更新显卡驱动程序
- **解决方案**: 重置应用设置

#### 文件关联无效
- **解决方案**: 重新安装应用
- **解决方案**: 手动设置文件关联

#### 性能问题
- **解决方案**: 关闭不必要的后台应用
- **解决方案**: 增加虚拟内存
- **解决方案**: 更新到最新版本

### 日志文件位置

应用日志位于以下位置：
- `%APPDATA%\Seven MD\logs\`
- `C:\Users\用户名\AppData\Roaming\Seven MD\logs\`

## 卸载

### 使用控制面板
1. 打开"设置" → "应用" → "应用和功能"
2. 找到 "Seven MD"
3. 点击"卸载"

### 使用安装程序
- 运行安装程序，选择"卸载"

### 手动卸载（便携版）
- 删除解压的文件夹即可

## 更新

### 自动更新
- 应用支持自动更新检查
- 新版本发布时会提示更新

### 手动更新
1. 下载最新版本安装包
2. 运行安装程序覆盖安装

## 技术支持

如果遇到问题，请：
1. 查看本文档的故障排除部分
2. 检查 [GitHub Issues](https://github.com/qwzhang01/seven_md/issues)
3. 提交新的 Issue 描述问题

## 版本历史

| 版本 | 日期 | 主要更新 |
|------|------|----------|
| 1.0.0 | YYYY-MM-DD | 初始 Windows 版本发布 |

---

**注意**: 本文档会随版本更新而更新，请确保查看最新版本。