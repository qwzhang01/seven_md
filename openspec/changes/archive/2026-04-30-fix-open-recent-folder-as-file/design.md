## Context

最近文档功能已在上一个 change（`fix-recent-documents-feature`）中完成数据写入和读取的基础实现。当前问题是：`recent-documents` localStorage 中存储的条目包含 `type: 'folder'` 的文件夹记录，但两处"打开最近文档"的处理器均无条件调用 `readFile(path)`，导致对目录路径触发 OS error 21。

受影响的两处处理器：
1. `app:open-recent` 自定义事件处理器（`AppV2.tsx` ~line 500）：由 `WelcomeDialog` 点击最近文档触发
2. `menu-open-recent-doc` Tauri 原生菜单事件处理器（`AppV2.tsx` ~line 199）：由原生菜单"最近文档"子菜单点击触发

根本原因链：
- `WelcomeDialog.RecentDoc` 接口缺少 `type` 字段 → `handleOpenRecent` 只传递 `path` 字符串 → `app:open-recent` handler 无法知道类型 → 无条件 `readFile`
- `menu-open-recent-doc` handler 直接使用 Tauri 事件 payload（仅含 `path`），未查询 localStorage 中的 `type`

## Goals / Non-Goals

**Goals:**
- 修复 `app:open-recent` handler：当路径类型为 `folder` 时调用 `openFolder` 而非 `readFile`
- 修复 `menu-open-recent-doc` handler：从 localStorage 查找路径对应的 `type`，按类型分支处理
- 修复 `WelcomeDialog.RecentDoc` 接口：补充 `type` 字段，使 dispatch payload 携带类型信息
- 修复 `WelcomeDialog` 列表图标：文件夹显示 `FolderOpen`，文件显示 `FileText`

**Non-Goals:**
- 不修改 localStorage 存储格式（`type` 字段已存在于写入侧）
- 不修改原生菜单的 Tauri 事件 payload 格式（Rust 侧只传 path 字符串，维持现状）
- 不修改 `addRecentDocument` 工具函数

## Decisions

### Decision 1：`app:open-recent` 事件 payload 从 `string` 改为 `{ path, type }`

**选择**：将 `CustomEvent` 的 `detail` 从 `string`（仅 path）改为 `{ path: string; type: 'file' | 'folder' }`

**理由**：
- `WelcomeDialog` 是唯一的 dispatch 方，修改 payload 结构成本低
- handler 侧可直接从 `event.detail` 获取类型，无需再查 localStorage，逻辑更简洁
- 与 `addRecentDocument` 函数签名保持一致

**替代方案**：handler 侧从 localStorage 查找 type → 需要额外的 JSON parse，且存在 localStorage 数据不存在时的边界情况

### Decision 2：`menu-open-recent-doc` handler 从 localStorage 查找 type

**选择**：Tauri 原生菜单事件 payload 只含 `path`（Rust 侧不传 type），因此 handler 需从 localStorage 的 `recent-documents` 列表中查找对应条目的 `type`；若找不到则默认按 `file` 处理（向后兼容旧数据）

**理由**：
- 不修改 Rust 侧代码，降低改动范围
- localStorage 中的数据由 `addRecentDocument` 写入，包含 `type` 字段，可靠性足够

**替代方案**：修改 Rust 侧传递 type → 需要修改 Tauri 命令和菜单构建逻辑，超出本次范围

## Risks / Trade-offs

- **[风险] `menu-open-recent-doc` 查 localStorage 时数据不存在**（如用户手动清除了 localStorage 但原生菜单缓存未更新）→ 默认按 `file` 处理，最坏情况是对文件夹路径再次报错，但不会崩溃；可接受
- **[Trade-off] `app:open-recent` payload 结构变更**：若有其他地方监听该事件并期望 `detail` 为字符串，会静默失败 → 经过 grep 确认，只有 `AppV2.tsx` 监听该事件，无其他消费者
