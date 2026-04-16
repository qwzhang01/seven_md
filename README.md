# Seven MD - macOS Markdown 阅读器

<div align="center">

![Seven MD Logo](docs/logo.png)

**一个现代化的 Markdown 阅读器，专为 macOS 设计**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/qwzhang01/seven_md.svg)](https://github.com/qwzhang01/seven_md/releases)
[![Build Status](https://github.com/qwzhang01/seven_md/workflows/CI/badge.svg)](https://github.com/qwzhang01/seven_md/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](README.md) | 简体中文

</div>

---

## ✨ 功能特性

- 📁 **文件夹浏览** - 打开文件夹，在侧边栏浏览文档目录结构
- 🖱️ **拖拽打开** - 支持拖拽或打开本地 .md 文件
- 📝 **分栏预览** - 左右分栏实时预览（左侧源码，右侧渲染）
- 🎛️ **灵活布局** - 侧边栏、编辑器、预览区均可独立折叠
- 🎨 **丰富的 Markdown 支持**
  - ✅ GitHub Flavored Markdown (GFM)
  - ✅ 数学公式 (KaTeX)
  - ✅ 流程图和图表 (Mermaid)
  - ✅ 代码语法高亮
  - ✅ 表格、任务列表、脚注
- 🌙 **主题切换** - 支持暗黑/浅色主题
- 💾 **状态持久化** - 自动记住上次打开的文件夹和布局设置
- 🍎 **原生集成** - Mac 原生菜单集成
- 🔒 **本地运行** - 纯本地应用，无网络依赖，保护隐私

## 📸 截图

<div align="center">
<img src="docs/screenshots/light-mode.png" alt="Light Mode" width="45%">
<img src="docs/screenshots/dark-mode.png" alt="Dark Mode" width="45%">
</div>

## 🚀 快速开始

### 前置要求

- **Node.js** 18+
- **Rust** 1.70+
- **macOS** 10.15+

### 安装

```bash
# 克隆仓库
git clone https://github.com/qwzhang01/seven_md.git
cd seven_md

# 安装依赖
npm install

# 开发模式运行
npm run tauri:dev
```

### 构建

```bash
# 构建生产版本
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录。

## 📖 使用说明

1. **打开文件**: 点击工具栏的"Open"按钮或直接拖拽 .md 文件到窗口
2. **编辑内容**: 在左侧编辑器实时编辑 Markdown 内容
3. **实时预览**: 右侧会自动渲染 Markdown 为格式化内容
4. **保存文件**: 点击"Save"按钮保存修改
5. **切换主题**: 点击主题按钮在暗黑/浅色模式间切换

## 🛠️ 技术栈

| 技术              | 说明                        |
| ----------------- | --------------------------- |
| **Tauri v2**      | Rust 后端，提供原生桌面能力 |
| **React 19**      | 现代化的前端框架            |
| **TypeScript**    | 类型安全                    |
| **Vite**          | 快速的开发构建工具          |
| **Tailwind CSS**  | 实用优先的 CSS 框架         |
| **ReactMarkdown** | Markdown 渲染引擎           |

## 📁 项目结构

```
seven_md/
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   ├── hooks/              # 自定义 Hooks
│   ├── App.tsx             # 主应用组件
│   └── main.tsx            # 应用入口
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── main.rs         # Rust 主文件
│   │   └── lib.rs          # 库文件
│   └── Cargo.toml          # Rust 依赖配置
├── .github/                # GitHub 配置
│   ├── workflows/          # CI/CD 工作流
│   └── ISSUE_TEMPLATE/     # Issue 模板
├── package.json            # Node.js 依赖
├── README.md               # 项目说明
├── CONTRIBUTING.md         # 贡献指南
├── CHANGELOG.md            # 变更日志
└── LICENSE                 # MIT 许可证
```

## 🤝 贡献

我们欢迎所有形式的贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解详情。

### 贡献者

感谢所有为这个项目做出贡献的人：

<a href="https://github.com/qwzhang01/seven_md/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=username/seven_md" />
</a>

## 📝 开发路线

- [x] 基础 Markdown 渲染
- [x] 代码语法高亮
- [x] 数学公式支持
- [x] Mermaid 图表支持
- [x] 暗黑/浅色主题
- [ ] 文件历史记录
- [ ] 自定义主题
- [ ] 导出 PDF
- [ ] 多标签页支持
- [ ] 插件系统

查看 [Issues](https://github.com/username/seven_md/issues) 了解更多计划功能。

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [Tauri](https://tauri.app/) - 构建更小、更快、更安全的桌面应用
- [React](https://react.dev/) - 用于构建用户界面的 JavaScript 库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [ReactMarkdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染组件

## 📮 联系方式

- **Issues**: [GitHub Issues](https://github.com/qwzhang01/seven_md/issues)
- **Discussions**: [GitHub Discussions](https://github.com/qwzhang01/seven_md/discussions)
- **Email**: qwzhang01@users.noreply.github.com

---

<div align="center">

如果这个项目对你有帮助，请给个 ⭐️ 支持一下！

Made with ❤️ by [avinzhang](https://github.com/qwzhang01)

</div>
