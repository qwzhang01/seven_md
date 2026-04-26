## Why

Seven Markdown 的正式品牌名称为 **"Seven Markdown"**，Slogan 为 **"Write Markdown Like Code"**，Logo 为 **ME 图标**（蓝紫渐变色调）。然而当前实现中多处使用了历史遗留的简称 "Seven MD" 和错误的 Emoji 图标，违反了品牌一致性原则。

品牌名称的不一致会影响产品形象和用户体验，尤其是在 About 对话框、菜单和版权声明等显眼位置。

## What Changes

1. **AboutDialog 名称修正**：将 "Seven MD" 更改为 "Seven Markdown"，并添加 Slogan "Write Markdown Like Code"
2. **AboutDialog Logo 替换**：将 📝 Emoji 替换为 ME Logo 图标（蓝紫渐变）
3. **Tauri 菜单名称修正**：将 "About Seven MD"/"Quit Seven MD" 更改为 "About Seven Markdown"/"Quit Seven Markdown"
4. **版权声明名称修正**：将 "Seven MD Contributors" 更改为 "Seven Markdown Contributors"

## Capabilities

### New Capabilities

- 无

### Modified Capabilities

- `help-menu-dialogs`：About 对话框的品牌名称、slogan 和 logo 图标需要修正
- `menubar-system`：Tauri 原生菜单中的 "About MD Mate"/"Quit Seven MD" 需要修正

## Impact

### 涉及文件

- `src/components/dialogs/AboutDialog.tsx`：About 对话框的品牌名称、slogan 和图标
- `src-tauri/src/main.rs`：Tauri 原生菜单的 "About" 和 "Quit" 标签文本
