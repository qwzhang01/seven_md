## 1. 导入 lucide-react 图标

- [x] 1.1 从 `lucide-react` 导入所需图标组件：Scissors, Clipboard, FileText, Plus, Type, Search, Sparkles, Bot

## 2. 更新 MenuItem 接口

- [x] 2.1 在 MenuItem 接口中添加可选的 `icon` 字段（支持 React 组件类型）

## 3. 替换 Emoji 为图标组件

- [x] 3.1 替换"剪切"菜单项：从 ✂️ emoji 改为 `<Scissors size={14} />`
- [x] 3.2 替换"复制"菜单项：从 📋 emoji 改为 `<Clipboard size={14} />`
- [x] 3.3 替换"粘贴"菜单项：从 📄 emoji 改为 `<FileText size={14} />`
- [x] 3.4 替换"插入"菜单项：从 ➕ emoji 改为 `<Plus size={14} />`
- [x] 3.5 替换"全选"菜单项：从 🔤 emoji 改为 `<Type size={14} />`
- [x] 3.6 替换"查找"菜单项：从 🔍 emoji 改为 `<Search size={14} />`
- [x] 3.7 替换"格式化文档"菜单项：从 📝 emoji 改为 `<Sparkles size={14} />`（符合交互说明）
- [x] 3.8 替换"AI 改写"菜单项：从 🤖 emoji 改为 `<Bot size={14} />`

## 4. 更新渲染逻辑

- [x] 4.1 修改 MenuItemRow 组件，支持渲染图标组件
- [x] 4.2 确保图标颜色继承 `var(--text-primary)` CSS 变量
