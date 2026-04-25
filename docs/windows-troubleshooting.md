# Windows 故障排除指南

---

## 启动问题

### 应用无法启动

**现象**：双击图标无反应或闪退

| 方案 | 操作 |
|------|------|
| 安装运行库 | 安装 [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe) |
| 提升权限 | 右键 → "以管理员身份运行" |
| 兼容模式 | 右键 → 属性 → 兼容性 → 以兼容模式运行 |

### SmartScreen 拦截

**现象**：Windows SmartScreen 阻止运行

点击"更多信息" → "仍要运行"。

### 启动缓慢

1. 检查并禁用不必要的启动项（任务管理器 → 启动）
2. 清理临时文件（运行 `%temp%`）
3. 增加虚拟内存（系统属性 → 高级 → 性能设置 → 虚拟内存）

---

## 显示问题

### 界面模糊或错位

1. 右键应用图标 → 属性 → 兼容性 → "更改高 DPI 设置"
2. 勾选"替代高 DPI 缩放行为" → 选择"系统（增强）"
3. 更新显卡驱动

---

## 功能问题

### 文件关联无效

双击 `.md` 文件无法用 Seven MD 打开：

1. 右键 `.md` 文件 → "打开方式" → "选择其他应用" → 选择 Seven MD → 勾选"始终使用此应用"
2. 或通过 Seven MD 应用内的设置重新关联

### 拖拽打开文件无效

- 以管理员身份运行时可能限制拖拽功能 → 尝试以普通用户身份运行
- 任务管理器中重启 Windows Explorer

### 快捷键冲突

- 检查是否有其他应用占用了相同快捷键
- Seven MD 设置 → 快捷键 → 重置为默认

---

## 性能问题

### 内存占用过高

1. 避免同时打开过多大型文件，关闭不需要的标签
2. 设置 → 高级 → 清理缓存
3. 禁用不必要的插件

### CPU 使用率异常

1. 任务管理器查看 Seven MD 进程
2. 暂时关闭实时预览（设置 → 编辑器 → 禁用实时预览）

---

## 更新问题

### 无法检查更新

1. 确认网络连接正常
2. 如有代理，在设置 → 网络中配置
3. 从 [GitHub Releases](https://github.com/qwzhang01/seven_md/releases) 手动下载

### 自动更新失败

完全退出应用后重试，或手动下载安装包覆盖安装。

---

## 日志与调试

### 日志文件位置

```
%APPDATA%\Seven MD\logs\
即：C:\Users\<用户名>\AppData\Roaming\Seven MD\logs\
```

### 启用调试模式

```cmd
# 命令行启动
"C:\Program Files\Seven MD\Seven MD.exe" --debug

# 或设置环境变量
set SEVEN_MD_DEBUG=1
```

### 生成错误报告

- **内置报告**：帮助 → 生成错误报告
- **手动收集**：应用版本 + Windows 版本 + 错误截图 + 日志文件

---

## 重置应用

### 完全重置

```cmd
# 1. 关闭应用
# 2. 删除配置目录
rmdir /s "%APPDATA%\Seven MD"
# 3. 重新启动应用
```

### 部分重置

设置 → 高级 → 重置所有设置

---

## 系统诊断

```cmd
# 检查系统文件完整性
sfc /scannow

# 检查磁盘错误
chkdsk C: /f
```

---

## 获取帮助

1. 查看 [GitHub Wiki](https://github.com/qwzhang01/seven_md/wiki)
2. 提交 [GitHub Issue](https://github.com/qwzhang01/seven_md/issues)（附详细错误描述和系统信息）
3. 参与 [GitHub Discussions](https://github.com/qwzhang01/seven_md/discussions)
