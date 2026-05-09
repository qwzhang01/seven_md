## Why

作为桌面应用（Tauri），当前存在两个明显的 UX 问题：

1. **拖拽全选问题**：鼠标在非编辑区域按住拖动时，会触发浏览器默认的文本选择行为，导致 UI 元素（工具栏、侧边栏、标签页等）被"全选高亮"，体验非常不像原生桌面应用。
2. **右键菜单不完善**：在大量空白区域（预览面板、编辑器空白处、主内容区等）右键点击会弹出浏览器默认的 "Reload" 菜单，这对桌面应用来说完全不合理。需要统一规划全局右键菜单策略。

## What Changes

- **全局禁用非编辑区域的文本选择**：对非编辑区域（工具栏、侧边栏、标签栏、状态栏、活动栏等 UI chrome 区域）设置 `user-select: none`，仅保留编辑器内容区和预览面板正文区的文本可选。
- **全局拦截默认右键菜单**：在应用根级别阻止浏览器默认 contextmenu 事件，彻底杜绝 "Reload" 菜单出现。
- **新增全局/区域性右键菜单规划**：
  - **编辑器区域**（已有）：剪切/复制/粘贴/全选/查找/格式化/AI改写
  - **预览面板**（新增）：复制选中文本、复制为 Markdown、全选、查找
  - **标签栏空白处**（新增）：新建文件、新建窗口
  - **侧边栏空白处**（已有部分）：新建文件、新建文件夹、刷新、在 Finder 中打开工作区
  - **主内容空白区域**（新增兜底）：新建文件、打开文件、打开文件夹、命令面板
  - **工具栏/状态栏**（新增）：无菜单或仅显示版本信息

## Capabilities

### New Capabilities
- `global-selection-control`: 全局文本选择控制，禁止非内容区域的文本选择和拖拽高亮
- `global-context-menu`: 全局右键菜单策略，统一管理不同区域的右键菜单行为，阻止浏览器默认菜单

### Modified Capabilities
- `context-menu-format`: 编辑器右键菜单需要配合全局策略进行事件冒泡调整
- `tab-context-menu`: 标签右键菜单需要扩展标签栏空白处的右键行为

## Impact

- **受影响代码**：
  - `src/AppV2.tsx` — 全局 contextmenu 拦截注册
  - `src/index.css` — 全局 user-select 样式规则
  - `src/components/editor-v2/PreviewPaneV2.tsx` — 新增预览面板右键菜单
  - `src/components/titlebar-v2/TabBar.tsx` — 标签栏空白处右键菜单
  - 各区域组件可能需要微调 contextmenu 事件处理
- **无 API 变更**
- **无依赖变更**
- **无 Breaking Changes**
