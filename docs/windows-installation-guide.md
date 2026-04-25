# Windows 安装指南

---

## 系统要求

| 项目 | 最低要求 | 推荐配置 |
|------|---------|---------|
| 操作系统 | Windows 10（64 位） | Windows 11（64 位） |
| 内存 | 4GB RAM | 8GB RAM+ |
| 存储空间 | 200MB | 500MB |
| 显示器 | 1024×768 | 1920×1080+ |

---

## 安装方法

### 方法一：NSIS 安装包（推荐）

1. 从 [GitHub Releases](https://github.com/qwzhang01/seven_md/releases) 下载 `SevenMD_版本号_x64-setup.exe`
2. 双击运行安装程序
3. 按向导操作：选择语言 → 接受协议 → 选择目录（默认 `C:\Program Files\Seven MD`） → 安装
4. 安装完成后启动应用

### 方法二：MSI 安装包

```cmd
# 下载 .msi 文件后，双击安装或使用命令行：
msiexec /i "SevenMD_版本号_x64.msi" /qn
```

### 方法三：便携版（免安装）

1. 下载 `SevenMD_版本号_x64-portable.zip`
2. 解压到任意目录
3. 运行 `Seven MD.exe`

### 方法四：从源码构建

#### 开发环境

1. **Node.js 18+** → [下载](https://nodejs.org/)
2. **Rust** → `winget install Rustlang.Rust.MSVC`
3. **Visual C++ Build Tools** → [下载](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

#### 构建步骤

```bash
git clone https://github.com/qwzhang01/seven_md.git
cd seven_md
npm install
npm run tauri:dev     # 开发模式
npm run tauri:build   # 生产构建
```

---

## 首次运行

1. **安装版**：从开始菜单或桌面快捷方式启动
2. **便携版**：双击 `Seven MD.exe`
3. 首次启动显示欢迎界面，可选择主题和默认保存位置

---

## 功能验证

安装后请验证：

- [ ] 应用正常启动，界面显示正常
- [ ] 主题切换功能正常
- [ ] 文件打开 / 保存正常
- [ ] 窗口控制按钮（最小化/最大化/关闭）正常
- [ ] .md 文件关联正常
- [ ] 高 DPI 显示正常

---

## 设置文件关联

右键点击 `.md` 文件 → "打开方式" → "选择其他应用" → 选择 Seven MD → 勾选"始终使用此应用"。

---

## 卸载

| 方式 | 操作 |
|------|------|
| 控制面板 | 设置 → 应用 → 应用和功能 → 找到 Seven MD → 卸载 |
| 安装程序 | 运行安装程序选择"卸载" |
| 便携版 | 直接删除解压目录 |

---

## 更新

- **自动更新**：应用会检查新版本并提示更新
- **手动更新**：下载最新安装包覆盖安装

---

如遇问题，请参阅 [Windows 故障排除指南](./windows-troubleshooting.md)。
