## Context

当前状态栏 (`StatusBar.tsx`) 的通知徽标和同步状态显示与原型规范存在差异：

1. **通知徽标**：仅在 `unreadCount > 0` 时显示数字，没有小红点样式的视觉强调
2. **同步状态**：两种状态都显示 "同步" 文字，仅通过透明度区分，缺乏明确的开关状态语义

原型设计要求通知铃铛有醒目的红色圆点徽标，同步状态需清晰表达"开/关"概念。

## Goals / Non-Goals

**Goals:**
- 为通知铃铛图标添加小红点样式的绝对定位徽标
- 同步状态按钮明确区分"同步: 开"和"同步: 关"
- 确保样式在暗黑/亮色主题下均清晰可见

**Non-Goals:**
- 不改变通知徽标的点击交互行为（已有 spec 定义）
- 不改变同步状态的实际功能逻辑
- 不添加新的通知功能或同步功能

## Decisions

### Decision 1: 小红点样式方案

**选择**：使用绝对定位的 `span` 元素 + Tailwind CSS 实现小红点

```tsx
<div class="relative">
  <BellIcon className="w-4 h-4" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
  )}
</div>
```

**替代方案考虑**：
- SVG 内置圆点：需要额外的 SVG 切换逻辑
- CSS `::after` 伪元素：需要额外的 CSS 类定义

### Decision 2: 同步状态文本

**选择**：使用三元表达式区分两种状态

```tsx
<span className={syncEnabled ? "opacity-100" : "opacity-60"}>
  同步: {syncEnabled ? "开" : "关"}
</span>
```

**替代方案考虑**：
- 使用两个独立的条件渲染元素：增加 DOM 复杂度
- 使用 CSS filter 改变颜色：暗黑主题适配复杂

## Risks / Trade-offs

| 风险 |  Mitigation |
|------|-------------|
| 小红点在某些图标颜色下不够醒目 | 确保红色 (`#ef4444`) 在暗黑/亮色主题下都有足够对比度 |
| 状态文本国际化 | 使用 i18n key 而非硬编码中文，支持后续国际化 |
