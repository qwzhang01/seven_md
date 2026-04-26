## ADDED Requirements

### Requirement: Mermaid 流程图片段
片段面板 SHALL 在"代码"分类下新增 Mermaid 流程图模板，用户点击后插入到编辑器光标位置。

#### Scenario: 插入 Mermaid 流程图
- **WHEN** 用户在片段面板"代码"分类下点击"Mermaid 流程图"片段
- **THEN** 编辑器光标位置 SHALL 插入 Mermaid 流程图模板代码，并显示"已插入片段"通知

### Requirement: API 文档模板片段
片段面板 SHALL 在"代码"分类下新增 API 文档模板，用户点击后插入到编辑器光标位置。

#### Scenario: 插入 API 文档模板
- **WHEN** 用户在片段面板"代码"分类下点击"API 文档"片段
- **THEN** 编辑器光标位置 SHALL 插入 API 文档 Markdown 模板代码，并显示"已插入片段"通知

### Requirement: 片段搜索覆盖新模板
新增的 Mermaid 和 API 文档片段 SHALL 能被片段面板的搜索功能检索到。

#### Scenario: 搜索 Mermaid
- **WHEN** 用户在片段面板搜索框输入"mermaid"
- **THEN** 搜索结果 SHALL 显示 Mermaid 流程图片段

#### Scenario: 搜索 API
- **WHEN** 用户在片段面板搜索框输入"api"
- **THEN** 搜索结果 SHALL 显示 API 文档片段
