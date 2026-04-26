## 1. 修复 AppV2.tsx 中的 duration

- [x] 1.1 将 `AppV2.tsx` 第 74 行打开文件失败通知的 `duration: 4000` 改为 `duration: 5000`

## 2. 审查其他通知调用

- [x] 2.1 搜索代码库中所有 `duration:` 配置，确保统一使用 5000ms
- [x] 2.2 如有其他不一致的地方，一并修复
