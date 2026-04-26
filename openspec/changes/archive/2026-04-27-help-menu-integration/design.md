## Context

`AppV2.tsx` 中注册了帮助菜单的事件监听器，但部分功能未正确实现。需要检查并修复以下菜单项的点击行为：
- 欢迎页（当前显示"开发中"）
- 检查更新（当前显示"开发中"）

## Goals / Non-Goals

**Goals:**
- 修复欢迎页：实现欢迎对话框或引导页
- 修复检查更新：实现版本检查逻辑
- 确认其他菜单项正常工作

**Non-Goals:**
- 不改变菜单栏的结构和布局
- 不实现完整的首次使用引导流程

## Decisions

### 欢迎页实现

创建简化的欢迎对话框：

```tsx
// WelcomeDialog.tsx
export function WelcomeDialog({ onClose }) {
  return (
    <Dialog open onClose={onClose}>
      <Dialog.Title>欢迎使用 Seven Markdown</Dialog.Title>
      <Dialog.Content>
        <h2>最近打开</h2>
        <RecentFiles />
        <h2>快速操作</h2>
        <QuickActions />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onClick={onClose}>开始使用</Button>
      </Dialog.Actions>
    </Dialog>
  )
}
```

### 检查更新实现

使用 Tauri 的 `updater` 插件或手动检查：

```typescript
// 检查更新逻辑
const checkForUpdate = async () => {
  try {
    // 方案 A: 使用 Tauri updater
    // const update = await check()
    
    // 方案 B: 手动检查（简单实现）
    const currentVersion = '1.0.0'
    // 比较版本号，显示提示
  } catch (e) {
    addNotification({ type: 'error', message: '检查更新失败' })
  }
}
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| updater 需要配置更新服务器 | 初期使用手动版本检查 |
