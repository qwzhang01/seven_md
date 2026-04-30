## 1. 文件夹选中状态管理

- [x] 1.1 在 `ExplorerPanel` 组件中添加 `selectedFolderPath: string | null` 本地 state
- [x] 1.2 为文件树中的文件夹节点添加点击事件，点击时更新 `selectedFolderPath`
- [x] 1.3 点击文件（非文件夹）时清除 `selectedFolderPath`（设为 null）
- [x] 1.4 为选中的文件夹节点添加高亮 CSS 样式（区别于 hover 样式）

## 2. 文件夹感知新建文件/文件夹

- [x] 2.1 修改"新建文件"按钮的处理逻辑：若 `selectedFolderPath` 不为空，则在该路径下创建；否则在根目录创建
- [x] 2.2 修改"新建文件夹"按钮的处理逻辑：同上，感知 `selectedFolderPath`
- [x] 2.3 新建后自动展开目标文件夹（若处于折叠状态）
- [x] 2.4 新建完成后保持 `selectedFolderPath` 不变（文件夹仍处于选中状态）

## 3. 文件系统移动操作

- [x] 3.1 在 `workspace-store` 中添加 `moveItem(sourcePath: string, targetFolderPath: string)` action
- [x] 3.2 在 `moveItem` 中调用 Tauri `fs.renameFile` 执行实际文件系统移动
- [x] 3.3 移动成功后刷新文件树（重新读取目录结构）
- [x] 3.4 移动失败时捕获错误并通过 notification 系统显示错误提示
- [x] 3.5 移动成功后遍历 `openFiles`，将匹配旧路径的 Tab 更新为新路径

## 4. 拖拽交互 — 拖拽源

- [x] 4.1 为文件树中的文件节点添加 `draggable={true}` 属性
- [x] 4.2 为文件树中的文件夹节点添加 `draggable={true}` 属性
- [x] 4.3 实现 `onDragStart` 处理器：将节点完整路径写入 `dataTransfer.setData('text/plain', path)`
- [x] 4.4 拖拽开始时为源节点添加半透明 CSS 样式（降低 opacity）
- [x] 4.5 拖拽结束时（`onDragEnd`）移除源节点半透明样式

## 5. 拖拽交互 — 放置目标

- [x] 5.1 为文件夹节点添加 `onDragOver` 处理器：调用 `e.preventDefault()` 允许放置，并检查是否为有效目标
- [x] 5.2 为文件夹节点添加 `onDragEnter` 处理器：使用 dragCounter 计数器，进入时 +1，高亮目标文件夹
- [x] 5.3 为文件夹节点添加 `onDragLeave` 处理器：dragCounter -1，为 0 时取消高亮（避免子元素触发误消除）
- [x] 5.4 为文件夹节点添加 `onDrop` 处理器：读取 `dataTransfer.getData('text/plain')` 获取源路径，执行移动
- [x] 5.5 在 `onDrop` 中校验：若目标路径以源路径开头（拖入自身/子孙），则拒绝操作
- [x] 5.6 在 `onDrop` 中校验：若源路径的父目录与目标路径相同，则跳过（无需移动）
- [x] 5.7 为文件树根区域添加放置目标支持（拖拽到根目录）

## 6. 拖拽视觉反馈样式

- [x] 6.1 添加 `is-drag-over` CSS class 样式：蓝色边框或背景色高亮
- [x] 6.2 添加 `is-drag-invalid` CSS class 样式：红色边框，用于禁止放置的目标
- [x] 6.3 在 `onDragOver` 中根据是否为有效目标切换 `is-drag-over` / `is-drag-invalid` 样式
- [x] 6.4 拖拽结束后清除所有拖拽相关 CSS class

## 7. 测试验证

- [x] 7.1 验证：选中文件夹后新建文件，文件创建在该文件夹内
- [x] 7.2 验证：未选中文件夹时新建文件，文件创建在根目录
- [x] 7.3 验证：拖拽文件到另一个文件夹，文件移动成功，文件树更新
- [x] 7.4 验证：拖拽文件夹到另一个文件夹，整个文件夹（含内容）移动成功
- [x] 7.5 验证：拖拽文件夹到自身或子孙文件夹，操作被拒绝，文件树不变
- [x] 7.6 验证：移动已打开的文件后，对应 Tab 路径自动更新，保存功能正常
- [x] 7.7 验证：拖拽过程中目标文件夹高亮，拖拽结束后高亮消失
