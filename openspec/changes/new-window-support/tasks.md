# New Window Support - Tasks

## 1. Tauri Window Configuration

- [x] 1.1 检查 `src-tauri/tauri.conf.json` 窗口配置
- [x] 1.2 确认 webviewWindow 依赖已安装 (@tauri-apps/api v2 已包含)
- [x] 1.3 配置允许创建多个窗口 (Tauri v2 默认支持多窗口)

## 2. Window Creation Function

- [x] 2.1 创建 `createNewWindow` 函数
- [x] 2.2 使用 `WebviewWindow` API 创建窗口
- [x] 2.3 设置窗口标题、大小、居中

## 3. Integration

- [x] 3.1 绑定 `Ctrl+Shift+N` 快捷键
- [x] 3.2 绑定"新建窗口"菜单项
- [x] 3.3 添加错误处理

## 4. Testing

- [ ] 4.1 测试快捷键创建新窗口
- [ ] 4.2 测试菜单创建新窗口
- [ ] 4.3 测试多窗口独立运行
