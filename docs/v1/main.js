/**
 * MD Mate - 主交互逻辑
 * 包含：右键菜单、主题切换、标签页管理、文件树、搜索、大纲、命令面板、AI助手等
 */

// ========== 全局状态 ==========
const state = {
    theme: 'dark',
    viewMode: 'split', // split | editor | preview
    sidebarOpen: true,
    sidebarTab: 'explorer', // explorer | search | outline | snippets
    sidebarWidth: 260,
    activeTab: 'readme.md',
    openTabs: ['readme.md', 'spec.md', 'changelog.md'],
    modifiedFiles: new Set(['readme.md']),
    fontSize: 13,
    wordWrap: true,
    findBarOpen: false,
    commandPaletteOpen: false,
    aiPanelOpen: false,
    aiTab: 'chat', // chat | rewrite | translate | explain
    notifications: [],
    treeExpanded: { 'md-mate': true, 'docs': true, 'src': false, 'templates': false },
    menuOpen: null, // 已废弃：macOS 使用系统原生菜单
    contextMenuOpen: false,
    contextMenuPos: { x: 0, y: 0 },
};

// 文件系统模拟
const fileSystem = {
    'md-mate': {
        type: 'folder',
        children: {
            'docs': {
                type: 'folder',
                children: {
                    'readme.md': { type: 'file', content: '# MD Mate - AI 时代的 Markdown 编辑器\n\nMD Mate 是为 AI 时代而生的 Markdown 编辑器，让你像写代码一样写文档。\n\n## 功能特性\n\n### 实时预览\n\n编辑器右侧实时渲染 Markdown 预览，所见即所得。\n\n### 语法高亮\n\n支持 Markdown 语法高亮，代码块支持多种语言着色。\n\n### 主题切换\n\n支持多种主题切换，包括深色、浅色、Monokai、Solarized、Nord、Dracula、GitHub 等。\n\n### AI 辅助写作\n\n集成 AI 助手，帮你智能编写与理解文档内容。\n\n## 安装与使用\n\n```bash\n# macOS 下载安装\nbrew install --cask md-mate\n\n# 或从官网下载\n# https://mdmate.app\n```\n\n## 开发计划\n\n### v1.0 里程碑\n\n- [x] 基础 Markdown 编辑\n- [x] 实时预览\n- [x] 语法高亮\n- [x] 主题切换\n- [ ] AI 辅助写作\n- [ ] 协同编辑\n\n### v2.0 规划\n\n- [ ] 插件系统\n- [ ] Git 集成\n- [ ] 多语言支持\n- [ ] 云同步\n\n## 贡献指南\n\n欢迎贡献代码！请阅读 [贡献指南](CONTRIBUTING.md)。\n\n## 许可证\n\nMIT License\n\n---\n\n> 📌 **注意**: MD Mate 目前处于早期开发阶段，功能可能不完善。' },
                    'spec.md': { type: 'file', content: '# MD Mate 产品规格\n\n## 用途\n\nMD Mate 涵盖了操作侧控制台的认证、会话管理和基于角色的访问控制（RBAC），包括：\n\n1. **登录表单行为**：包括"记住我"存储策略。\n2. **令牌自动注入**。\n3. **401处理**：处理401错误。\n4. **登出功能**。\n\n该能力跨越了前端的管理Web应用（使用Vue和TDesign）和后端的Go后端服务（称为"ops-end"服务），并建立了它们之间的共享合同。\n\n### 后端HTTP端点\n\n- `POST /ops/admin/login`：用于登录。\n- `GET /ops/admin/profile`：获取用户资料。\n- `POST /ops/admin/change-password`：更改密码。\n- `POST /ops/admin/logout`：登出。\n\n### 安全卫生\n\n- 账户锁定（防止暴力破解）\n- 没有泄露的凭据\n- HTTP-403状态码用于角色不匹配的情况\n\n## 需求\n\n1. **登录页面**：一个包含用户名和密码字段的登录页面，样式使用TDesign组件。\n\n2. **角色模型**：提供一个角色模型（例如`super_admin`或`editor`），并配有匹配的前端菜单。\n\n3. **安全卫生**：登录部分的安全卫生包括账户锁定、没有泄露的凭据等。' },
                    'changelog.md': { type: 'file', content: '# 更新日志\n\n## v0.1.0 (2024-01-15)\n\n### 新增\n- 基础 Markdown 编辑功能\n- 实时预览\n- 语法高亮\n- 深色/浅色主题\n\n## v0.2.0 (2024-03-01)\n\n### 新增\n- Monokai、Solarized、Nord、Dracula、GitHub 主题\n- 命令面板 (Ctrl+Shift+P)\n- 右键菜单\n- AI 辅助写作\n\n### 改进\n- 性能优化\n- UI 细节改进\n\n## v0.3.0 (计划中)\n\n### 计划新增\n- 协同编辑\n- Git 集成\n- 插件系统\n- 云同步' },
                }
            },
            'src': {
                type: 'folder',
                children: {
                    'main.go': { type: 'file', content: 'package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"os"\n\n\t"github.com/md-mate/core"\n)\n\nfunc main() {\n\tfmt.Println("MD Mate v0.2.0")\n\n\t// 初始化配置\n\tconfig := core.LoadConfig()\n\n\t// 启动HTTP服务\n\tmux := http.NewServeMux()\n\tcore.RegisterRoutes(mux, config)\n\n\tfmt.Printf("Server starting on :%s\\n", config.Port)\n\tif err := http.ListenAndServe(":"+config.Port, mux); err != nil {\n\t\tfmt.Fprintf(os.Stderr, "Server error: %v\\n", err)\n\t\tos.Exit(1)\n\t}\n}' },
                    'config.go': { type: 'file', content: 'package core\n\nimport (\n\t"os"\n)\n\n// Config holds application configuration\ntype Config struct {\n\tPort     string\n\tDebug    bool\n\tSecret   string\n}\n\n// LoadConfig reads configuration from environment\nfunc LoadConfig() *Config {\n\treturn &Config{\n\t\tPort:   getEnv("PORT", "8080"),\n\t\tDebug:  getEnv("DEBUG", "false") == "true",\n\t\tSecret: getEnv("SECRET", "default-secret"),\n\t}\n}\n\nfunc getEnv(key, fallback string) string {\n\tif val := os.Getenv(key); val != "" {\n\t\treturn val\n\t}\n\treturn fallback\n}' },
                    'handler.go': { type: 'file', content: 'package core\n\nimport (\n\t"encoding/json"\n\t"net/http"\n)\n\n// APIResponse is a generic API response structure\ntype APIResponse struct {\n\tSuccess bool        `json:"success"`\n\tData    interface{} `json:"data,omitempty"`\n\tError   string      `json:"error,omitempty"`\n}\n\n// RegisterRoutes sets up HTTP routes\nfunc RegisterRoutes(mux *http.ServeMux, config *Config) {\n\tmux.HandleFunc("/api/health", healthHandler)\n\tmux.HandleFunc("/api/profile", profileHandler)\n}\n\nfunc healthHandler(w http.ResponseWriter, r *http.Request) {\n\tjson.NewEncoder(w).Encode(APIResponse{\n\t\tSuccess: true,\n\t\tData:    map[string]string{"status": "ok"},\n\t})\n}\n\nfunc profileHandler(w http.ResponseWriter, r *http.Request) {\n\tjson.NewEncoder(w).Encode(APIResponse{\n\t\tSuccess: true,\n\t\tData:    map[string]string{"name": "MD Mate User"},\n\t})\n}' },
                }
            },
            'templates': {
                type: 'folder',
                children: {
                    'index.html': { type: 'file', content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>MD Mate</title>\n</head>\n<body>\n    <h1>Welcome to MD Mate</h1>\n</body>\n</html>' },
                }
            },
            '.gitignore': { type: 'file', content: '# Binaries\n*.exe\n*.dll\n*.so\n*.dylib\n\n# Test\n*.test\n\n# Output\n/out/\n/dist/\n\n# IDE\n.idea/\n.vscode/\n*.swp' },
            'go.mod': { type: 'file', content: 'module github.com/md-mate/core\n\ngo 1.21\n\nrequire (\n\tgithub.com/gin-gonic/gin v1.9.0\n)' },
            'go.sum': { type: 'file', content: 'github.com/gin-gonic/gin v1.9.0 h1:...=\ngithub.com/gin-gonic/gin v1.9.0/go.mod h1:...' },
        }
    }
};

// ========== DOM 元素引用 ==========
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(state.theme);
    initTitlebarTabs();
    initEditorTabs();
    initSidebar();
    initMacMenuIPC();
    initToolbar();
    initEditor();
    initPreview();
    initFindBar();
    initCommandPalette();
    initAIPanel();
    initContextMenu();
    initStatusBar();
    initKeyboardShortcuts();
    initGutterResize();
    initSidebarResize();
});

// ========== 主题系统 ==========
function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    state.theme = theme;
    // 更新主题菜单选中状态
    $$('.theme-option').forEach(el => {
        el.classList.toggle('active', el.dataset.theme === theme);
    });
    showNotification(`主题已切换为 ${getThemeName(theme)}`, 'info');
}

function getThemeName(theme) {
    const names = {
        dark: '深色模式', light: '浅色模式', monokai: 'Monokai',
        solarized: 'Solarized', nord: 'Nord', dracula: 'Dracula', github: 'GitHub'
    };
    return names[theme] || theme;
}

function toggleTheme() {
    const themes = ['dark', 'light', 'monokai', 'solarized', 'nord', 'dracula', 'github'];
    const idx = themes.indexOf(state.theme);
    const next = themes[(idx + 1) % themes.length];
    applyTheme(next);
}

// ========== 标题栏标签 ==========
function initTitlebarTabs() {
    renderTitlebarTabs();
}

function renderTitlebarTabs() {
    const container = $('#titlebarTabs');
    container.innerHTML = state.openTabs.map(tab => {
        const active = tab === state.activeTab ? 'active' : '';
        const modified = state.modifiedFiles.has(tab) ? '<span class="file-modified dot"></span>' : '';
        return `<div class="titlebar-tab ${active}" data-tab="${tab}">
            <i class="ri-file-text-line"></i>
            <span>${tab}</span>${modified}
        </div>`;
    }).join('');

    // 点击切换标签
    container.querySelectorAll('.titlebar-tab').forEach(tabEl => {
        tabEl.addEventListener('click', (e) => {
            switchTab(tabEl.dataset.tab);
        });
    });
}

// ========== 编辑器标签 ==========
function initEditorTabs() {
    renderEditorTabs();
}

function renderEditorTabs() {
    const tabBar = $('#editorTabBar');
    tabBar.innerHTML = state.openTabs.map(tab => {
        const active = tab === state.activeTab ? 'active' : '';
        const modified = state.modifiedFiles.has(tab) ? '<span class="tab-modified dot"></span>' : '';
        return `<div class="tab ${active}" data-tab="${tab}">
            <i class="ri-file-text-line tab-icon"></i>
            <span class="tab-name">${tab}</span>
            ${modified}
            <button class="tab-close"><i class="ri-close-line"></i></button>
        </div>`;
    }).join('');

    // 切换标签
    tabBar.querySelectorAll('.tab').forEach(tabEl => {
        tabEl.addEventListener('click', (e) => {
            if (e.target.closest('.tab-close')) return;
            switchTab(tabEl.dataset.tab);
        });
    });

    // 关闭标签
    tabBar.querySelectorAll('.tab-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tab = btn.closest('.tab').dataset.tab;
            closeTab(tab);
        });
    });
}

function switchTab(tabName) {
    state.activeTab = tabName;
    if (!state.openTabs.includes(tabName)) {
        state.openTabs.push(tabName);
    }
    renderEditorTabs();
    renderTitlebarTabs();
    loadFileContent(tabName);
    updateStatusBar();
}

function closeTab(tabName) {
    if (state.openTabs.length <= 1) {
        showNotification('至少保留一个标签页', 'warning');
        return;
    }
    const idx = state.openTabs.indexOf(tabName);
    state.openTabs.splice(idx, 1);
    state.modifiedFiles.delete(tabName);
    if (state.activeTab === tabName) {
        state.activeTab = state.openTabs[Math.min(idx, state.openTabs.length - 1)];
    }
    renderEditorTabs();
    renderTitlebarTabs();
    loadFileContent(state.activeTab);
}

// ========== 编辑器 ==========
function initEditor() {
    const editor = $('#editorContent');
    loadFileContent(state.activeTab);

    // 编辑器输入事件
    editor.addEventListener('input', () => {
        state.modifiedFiles.add(state.activeTab);
        renderEditorTabs();
        renderTitlebarTabs();
        updatePreview();
        // 防抖更新大纲
        clearTimeout(outlineState.debounceTimer);
        outlineState.debounceTimer = setTimeout(updateOutline, 300);
        updateStatusBar();
    });

    // 编辑器滚动同步行号
    editor.addEventListener('scroll', () => {
        syncLineNumbers();
    });

    // 编辑器点击更新光标位置
    editor.addEventListener('click', updateStatusBar);
    editor.addEventListener('keyup', () => {
    updateStatusBar();
    // 防抖更新大纲
    clearTimeout(outlineState.debounceTimer);
    outlineState.debounceTimer = setTimeout(updateOutline, 300);
});
}

function loadFileContent(fileName) {
    const content = getFileContent(fileName);
    const editor = $('#editorContent');
    editor.innerText = content;
    generateLineNumbers(content);
    updatePreview();
    updateOutline();
    updateStatusBar();
}

function getFileContent(path) {
    const parts = path.split('/');
    let node = fileSystem['md-mate'];
    for (let i = 0; i < parts.length; i++) {
        if (node.children && node.children[parts[i]]) {
            node = node.children[parts[i]];
        } else {
            return '';
        }
    }
    return node.content || '';
}

function generateLineNumbers(content) {
    const lines = (content || '').split('\n').length;
    const container = $('#lineNumbers');
    container.innerHTML = Array.from({ length: lines }, (_, i) =>
        `<div class="line-number">${i + 1}</div>`
    ).join('');
}

function syncLineNumbers() {
    const editor = $('#editorContent');
    const lineNumbers = $('#lineNumbers');
    lineNumbers.style.transform = `translateY(-${editor.scrollTop}px)`;
}

function updateStatusBar() {
    const editor = $('#editorContent');
    const text = editor.innerText;
    const lines = text.split('\n');
    const cursorPos = getCursorPosition(editor);
    $('#statusCursorPos').textContent = `行 ${cursorPos.line}, 列 ${cursorPos.col}`;
    const errors = $('#statusErrors');
    errors.innerHTML = `<i class="ri-error-warning-line"></i> 0 <i class="ri-alert-line"></i> 0`;
}

function getCursorPosition(editor) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return { line: 1, col: 1 };
    const range = sel.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(editor);
    preRange.setEnd(range.startContainer, range.startOffset);
    const textBefore = preRange.toString();
    const lines = textBefore.split('\n');
    return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

// ========== 预览 ==========
function initPreview() {
    updatePreview();
}

function updatePreview() {
    const editor = $('#editorContent');
    const content = editor.innerText || '';
    const preview = $('#previewContent');
    if (typeof marked !== 'undefined') {
        preview.innerHTML = marked.parse(content);
    } else {
        // 简单的 Markdown 渲染回退
        preview.innerHTML = simpleMarkdownRender(content);
    }
}

function simpleMarkdownRender(text) {
    let html = text
        // 转义 HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // 标题
        .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
        .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
        .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
        .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
        .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
        .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
        // 粗体和斜体
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // 行内代码
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // 代码块
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
        // 链接
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        // 水平线
        .replace(/^---$/gm, '<hr>')
        // 引用
        .replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>')
        // 无序列表
        .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
        // 任务列表
        .replace(/^- \[x\]\s+(.+)$/gm, '<li><input type="checkbox" checked disabled> $1</li>')
        .replace(/^- \[ \]\s+(.+)$/gm, '<li><input type="checkbox" disabled> $1</li>')
        // 段落
        .replace(/\n\n/g, '</p><p>')
        // 换行
        .replace(/\n/g, '<br>');
    return `<p>${html}</p>`;
}

// ========== 大纲（已移至底部统一实现） ==========

function jumpToLine(lineNum) {
    const editor = $('#editorContent');
    const lines = editor.innerText.split('\n');
    let pos = 0;
    for (let i = 0; i < lineNum - 1 && i < lines.length; i++) {
        pos += lines[i].length + 1;
    }
    // 滚动编辑器到对应行
    const lineEl = $$('#lineNumbers .line-number')[lineNum - 1];
    if (lineEl) {
        lineEl.scrollIntoView({ block: 'center' });
    }
}

// ========== 侧边栏 ==========
function initSidebar() {
    // 活动栏图标切换（VS Code 风格）
    $$('.activity-bar-item').forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.dataset.tab;
            // 如果点击已激活的图标，则收起侧边栏
            if (item.classList.contains('active')) {
                item.classList.remove('active');
                $$('.sidebar-panel').forEach(p => p.classList.remove('active'));
                const sidebar = $('#sidebar');
                sidebar.classList.add('collapsed');
                state.sidebarOpen = false;
                state.sidebarTab = null;
                return;
            }
            // 激活当前图标
            $$('.activity-bar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            // 切换面板
            $$('.sidebar-panel').forEach(p => p.classList.remove('active'));
            const panelId = 'panel' + capitalize(tabName);
            const panel = $(`#${panelId}`);
            if (panel) panel.classList.add('active');
            // 确保侧边栏展开
            const sidebar = $('#sidebar');
            sidebar.classList.remove('collapsed');
            state.sidebarOpen = true;
            state.sidebarTab = tabName;
        });
    });

    // 文件树展开/折叠
    $$('.explorer-header').forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
        });
    });

    // 文件树文件夹展开/折叠
    $$('.tree-item.folder > .tree-row').forEach(row => {
        row.addEventListener('click', () => {
            const item = row.closest('.tree-item');
            item.classList.toggle('open');
            const children = item.querySelector('.tree-children');
            if (children) children.classList.toggle('hidden');
            const arrow = row.querySelector('.tree-arrow');
            if (arrow) {
                arrow.classList.toggle('ri-arrow-right-s-line', !item.classList.contains('open'));
                arrow.classList.toggle('ri-arrow-down-s-line', item.classList.contains('open'));
            }
        });
    });

    // 文件树文件点击
    $$('.tree-item.file').forEach(item => {
        item.addEventListener('click', () => {
            const filePath = item.dataset.file;
            if (filePath) {
                switchTab(filePath.split('/').pop());
            }
        });
    });

    // 切换侧边栏按钮
    $('#btnToggleSidebar').addEventListener('click', toggleSidebar);

    // 初始化搜索面板交互
    initSearchPanel();
    // 初始化大纲面板交互
    initOutlinePanel();
    // 初始化片段面板交互
    initSnippetsPanel();
}

function toggleSidebar() {
    const sidebar = $('#sidebar');
    if (sidebar.classList.contains('collapsed') && state.sidebarTab) {
        // 如果侧边栏是收起状态且有选中的标签，展开它
        sidebar.classList.remove('collapsed');
        state.sidebarOpen = true;
    } else {
        // 否则收起侧边栏
        sidebar.classList.add('collapsed');
        state.sidebarOpen = false;
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== macOS 原生菜单通信 ==========
// macOS 使用系统原生菜单（Electron Menu API），此处仅处理从主进程发来的菜单命令
function initMacMenuIPC() {
    // 监听 Electron 主进程发来的菜单命令
    if (window.electronAPI && window.electronAPI.onMenuAction) {
        window.electronAPI.onMenuAction((action) => {
            handleMenuAction(action);
        });
    }
    // 非 Electron 环境下，快捷键仍通过全局键盘事件处理（见 initKeyboardShortcuts）
}

function handleMenuAction(action) {
    // 处理主题切换动作（格式：theme:xxx）
    if (action && action.startsWith('theme:')) {
        const themeName = action.split(':')[1];
        applyTheme(themeName);
        return;
    }
    
    switch (action) {
        // 文件菜单
        case 'newFile': createNewFile(); break;
        case 'newWindow': showNotification('新建窗口功能开发中...', 'info'); break;
        case 'openFile': showNotification('打开文件功能开发中...', 'info'); break;
        case 'openFolder': showNotification('打开文件夹功能开发中...', 'info'); break;
        case 'save': saveFile(); break;
        case 'saveAs': showNotification('另存为功能开发中...', 'info'); break;
        case 'saveAll': showNotification('全部保存功能开发中...', 'info'); break;
        case 'closeFile': showNotification('关闭文件功能开发中...', 'info'); break;
        case 'exportPdf': showNotification('导出 PDF 功能开发中...', 'info'); break;
        case 'exportHtml': exportHtml(); break;
        // 编辑菜单
        case 'undo': document.execCommand('undo'); break;
        case 'redo': document.execCommand('redo'); break;
        case 'cut': document.execCommand('cut'); break;
        case 'copy': document.execCommand('copy'); break;
        case 'paste': document.execCommand('paste'); break;
        case 'pasteAndMatchStyle': document.execCommand('paste'); break;
        case 'selectAll': document.execCommand('selectAll'); break;
        case 'find': toggleFindBar(); break;
        case 'findNext': showNotification('查找下一个功能开发中...', 'info'); break;
        case 'findPrevious': showNotification('查找上一个功能开发中...', 'info'); break;
        case 'replace': toggleFindBar(true); break;
        // 视图菜单
        case 'cmdPalette': toggleCommandPalette(); break;
        case 'toggleSidebar': toggleSidebar(); break;
        case 'toggleOutline': showNotification('切换大纲面板', 'info'); break;
        case 'toggleAIPanel': toggleAIPanel(); break;
        case 'zoomIn': changeFontSize(1); break;
        case 'zoomOut': changeFontSize(-1); break;
        case 'zoomReset': state.fontSize = 13; applyFontSize(); break;
        case 'toggleFullEditor': setViewMode('editor'); break;
        case 'toggleFullPreview': setViewMode('preview'); break;
        case 'toggleSplit': setViewMode('split'); break;
        case 'toggleFullscreen': showNotification('全屏功能开发中...', 'info'); break;
        case 'toggleLineNumbers': showNotification('行号切换功能开发中...', 'info'); break;
        case 'toggleMinimap': showNotification('迷你地图功能开发中...', 'info'); break;
        case 'toggleWordWrap': showNotification('自动换行切换功能开发中...', 'info'); break;
        // 插入菜单
        case 'insHeading': insertAtCursor('## '); break;
        case 'insBold': wrapSelection('**', '**'); break;
        case 'insItalic': wrapSelection('*', '*'); break;
        case 'insCode': wrapSelection('`', '`'); break;
        case 'insCodeBlock': insertAtCursor('\n```\n\n```\n'); break;
        case 'insLink': wrapSelection('[', '](url)'); break;
        case 'insImage': insertAtCursor('![描述](url)'); break;
        case 'insTable': insertAtCursor('\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n'); break;
        case 'insHr': insertAtCursor('\n---\n'); break;
        case 'insUl': insertAtCursor('- '); break;
        case 'insOl': insertAtCursor('1. '); break;
        case 'insTask': insertAtCursor('- [ ] '); break;
        case 'insBlockquote': insertAtCursor('> '); break;
        case 'insH4': insertAtLineStart('#### '); break;
        case 'insH5': insertAtLineStart('##### '); break;
        case 'insH6': insertAtLineStart('###### '); break;
        case 'insFootnote': insertAtCursor('[^1]\n\n[^1]: '); break;
        case 'insDetails': insertAtCursor('<details>\n<summary>折叠标题</summary>\n\n折叠内容\n\n</details>\n'); break;
        // 格式菜单
        case 'fmtBold': wrapSelection('**', '**'); break;
        case 'fmtItalic': wrapSelection('*', '*'); break;
        case 'fmtStrike': wrapSelection('~~', '~~'); break;
        case 'fmtH1': insertAtLineStart('# '); break;
        case 'fmtH2': insertAtLineStart('## '); break;
        case 'fmtH3': insertAtLineStart('### '); break;
        case 'fmtCode': wrapSelection('`', '`'); break;
        case 'fmtLink': wrapSelection('[', '](url)'); break;
        case 'fmtClear': showNotification('清除格式功能开发中...', 'info'); break;
        // 帮助菜单
        case 'welcome': showNotification('欢迎页功能开发中...', 'info'); break;
        case 'markdownGuide': showNotification('Markdown 指南功能开发中...', 'info'); break;
        case 'keyboardShortcuts': showKeyboardShortcuts(); break;
        case 'about': showAbout(); break;
        case 'checkUpdate': showNotification('检查更新功能开发中...', 'info'); break;
        case 'openPreferences': showNotification('偏好设置功能开发中...', 'info'); break;
        default:
            console.warn('未处理的菜单动作:', action);
    }
}

function createNewFile() {
    const name = prompt('请输入文件名（含扩展名）：', 'untitled.md');
    if (!name) return;
    if (!state.openTabs.includes(name)) {
        state.openTabs.push(name);
        // 添加到文件系统
        const docsNode = fileSystem['md-mate'].children['docs'];
        docsNode.children[name] = { type: 'file', content: `# ${name.replace('.md', '')}\n\n` };
        switchTab(name);
    }
}

function saveFile() {
    const editor = $('#editorContent');
    const content = editor.innerText;
    // 模拟保存
    const fileNode = findFileNode(state.activeTab);
    if (fileNode) {
        fileNode.content = content;
        state.modifiedFiles.delete(state.activeTab);
        renderEditorTabs();
        renderTitlebarTabs();
        showNotification(`${state.activeTab} 已保存`, 'success');
    }
}

function findFileNode(name, node, parentPath) {
    if (!node) node = fileSystem['md-mate'];
    if (!parentPath) parentPath = '';
    if (node.children) {
        for (const [key, val] of Object.entries(node.children)) {
            const path = parentPath ? `${parentPath}/${key}` : key;
            if (key === name) return val;
            const found = findFileNode(name, val, path);
            if (found) return found;
        }
    }
    return null;
}

function exportHtml() {
    const editor = $('#editorContent');
    const content = editor.innerText;
    const preview = $('#previewContent');
    const htmlContent = `<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<title>${state.activeTab}</title>\n</head>\n<body>\n${preview.innerHTML}\n</body>\n</html>`;
    showNotification('HTML 已导出到剪贴板', 'success');
    navigator.clipboard.writeText(htmlContent).catch(() => {});
}

function insertAtCursor(text) {
    const editor = $('#editorContent');
    editor.focus();
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    editor.dispatchEvent(new Event('input'));
}

function wrapSelection(before, after) {
    const editor = $('#editorContent');
    editor.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const selectedText = range.toString();
    range.deleteContents();
    const wrapper = document.createElement('span');
    wrapper.innerText = `${before}${selectedText}${after}`;
    range.insertNode(wrapper);
    // 将文本节点分离
    wrapper.parentNode.normalize();
    editor.dispatchEvent(new Event('input'));
}

function insertAtLineStart(prefix) {
    const editor = $('#editorContent');
    editor.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    // 找到当前行的开头
    const lineStart = findLineStart(editor, range);
    const insertRange = document.createRange();
    insertRange.setStart(range.startContainer, lineStart);
    insertRange.setEnd(range.startContainer, lineStart);
    insertRange.insertNode(document.createTextNode(prefix));
    editor.dispatchEvent(new Event('input'));
}

function findLineStart(editor, range) {
    const container = range.startContainer;
    const text = container.nodeType === 3 ? container.textContent : container.innerText;
    const offset = range.startOffset;
    let pos = offset;
    while (pos > 0 && text[pos - 1] !== '\n') {
        pos--;
    }
    return pos;
}

// ========== 工具栏 ==========
function initToolbar() {
    $$('.toolbar .tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action) handleMenuAction(action);
        });
    });

    // 视图模式按钮
    $('#btnViewMode').addEventListener('click', () => {
        const modes = ['split', 'editor', 'preview'];
        const idx = modes.indexOf(state.viewMode);
        setViewMode(modes[(idx + 1) % modes.length]);
    });
}

function setViewMode(mode) {
    state.viewMode = mode;
    const wrap = $('#editorPreviewWrap');
    wrap.className = 'editor-preview-wrap view-' + mode;
    // 更新按钮图标
    const icons = { split: 'ri-layout-column-line', editor: 'ri-code-box-line', preview: 'ri-eye-line' };
    const btn = $('#btnViewMode');
    btn.querySelector('i').className = icons[mode];
    const modeNames = { split: '分栏视图', editor: '仅编辑器', preview: '仅预览' };
    showNotification(`视图切换为: ${modeNames[mode]}`, 'info');
}

function changeFontSize(delta) {
    state.fontSize = Math.max(10, Math.min(24, state.fontSize + delta));
    applyFontSize();
}

function applyFontSize() {
    const editor = $('#editorContent');
    editor.style.fontSize = state.fontSize + 'px';
}

// ========== 查找替换 ==========
function initFindBar() {
    // Ctrl+F 打开查找
    // Ctrl+H 打开替换
    $('#findClose').addEventListener('click', () => {
        $('#findBar').classList.add('hidden');
        state.findBarOpen = false;
    });

    $('#findInput').addEventListener('input', performFind);
    $('#replaceInput').addEventListener('input', () => {});

    $$('[data-action="findNext"]').forEach(btn => btn.addEventListener('click', () => findNext(1)));
    $$('[data-action="findPrev"]').forEach(btn => btn.addEventListener('click', () => findNext(-1)));
    $$('[data-action="replaceOne"]').forEach(btn => btn.addEventListener('click', replaceOne));
    $$('[data-action="replaceAll"]').forEach(btn => btn.addEventListener('click', replaceAll));
}

function toggleFindBar(withReplace) {
    const bar = $('#findBar');
    bar.classList.remove('hidden');
    state.findBarOpen = true;
    $('#findInput').focus();
    if (withReplace) {
        bar.classList.add('with-replace');
    }
}

function performFind() {
    const query = $('#findInput').value;
    if (!query) {
        $('#findInfo').textContent = '无结果';
        return;
    }
    const editor = $('#editorContent');
    const text = editor.innerText;
    const caseSensitive = $('#findCaseSensitive').checked;
    const wholeWord = $('#findWholeWord').checked;
    const useRegex = $('#findRegex').checked;

    let matches = [];
    if (useRegex) {
        try {
            const regex = new RegExp(query, caseSensitive ? 'g' : 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                matches.push(match.index);
            }
        } catch (e) {
            $('#findInfo').textContent = '正则表达式无效';
            return;
        }
    } else {
        const searchText = caseSensitive ? text : text.toLowerCase();
        const searchQuery = caseSensitive ? query : query.toLowerCase();
        let start = 0;
        while ((start = searchText.indexOf(searchQuery, start)) !== -1) {
            matches.push(start);
            start += searchQuery.length;
        }
    }

    $('#findInfo').textContent = matches.length > 0 ? `${matches.length} 个结果` : '无结果';
}

function findNext(direction) {
    // 简化的查找下一个实现
}

function replaceOne() {
    showNotification('替换功能开发中...', 'info');
}

function replaceAll() {
    showNotification('全部替换功能开发中...', 'info');
}

// ========== 命令面板 ==========
function initCommandPalette() {
    $('#btnCommandPalette').addEventListener('click', toggleCommandPalette);
    $('#commandClose').addEventListener('click', () => {
        $('#commandPalette').classList.add('hidden');
        state.commandPaletteOpen = false;
    });
    $('.command-overlay').addEventListener('click', () => {
        $('#commandPalette').classList.add('hidden');
        state.commandPaletteOpen = false;
    });

    $('#commandInput').addEventListener('input', filterCommands);

    $$('.command-item').forEach(item => {
        item.addEventListener('click', () => {
            executeCommand(item.dataset.command);
            $('#commandPalette').classList.add('hidden');
            state.commandPaletteOpen = false;
        });
    });
}

function toggleCommandPalette() {
    const palette = $('#commandPalette');
    palette.classList.toggle('hidden');
    state.commandPaletteOpen = !palette.classList.contains('hidden');
    if (state.commandPaletteOpen) {
        $('#commandInput').value = '';
        $('#commandInput').focus();
        $$('.command-item').forEach(item => item.style.display = 'flex');
    }
}

function filterCommands() {
    const query = $('#commandInput').value.toLowerCase();
    $$('.command-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });
}

function executeCommand(command) {
    const [category, action] = command.split(':');
    switch (category) {
        case 'theme': applyTheme(action); break;
        case 'view': setViewMode(action); break;
        case 'editor': handleEditorCommand(action); break;
        case 'file': handleFileCommand(action); break;
        case 'insert': handleMenuAction('ins' + capitalize(action)); break;
        case 'ai': handleAICommand(action); break;
    }
}

function handleEditorCommand(action) {
    switch (action) {
        case 'format': formatDocument(); break;
        case 'wordwrap': toggleWordWrap(); break;
    }
}

function handleFileCommand(action) {
    switch (action) {
        case 'save': saveFile(); break;
        case 'saveAs': showNotification('另存为功能开发中...', 'info'); break;
        case 'exportPdf': showNotification('导出 PDF 功能开发中...', 'info'); break;
        case 'exportHtml': exportHtml(); break;
    }
}

function handleAICommand(action) {
    switch (action) {
        case 'assist': toggleAIPanel(); break;
        case 'rewrite': showAI Rewrite(); break;
        case 'translate': showAITranslate(); break;
    }
}

function formatDocument() {
    showNotification('格式化文档功能开发中...', 'info');
}

function toggleWordWrap() {
    state.wordWrap = !state.wordWrap;
    const editor = $('#editorContent');
    editor.style.whiteSpace = state.wordWrap ? 'pre-wrap' : 'pre';
    editor.style.wordWrap = state.wordWrap ? 'break-word' : 'normal';
    showNotification(`自动换行: ${state.wordWrap ? '开启' : '关闭'}`, 'info');
}

// ========== AI 助手 ==========
function initAIPanel() {
    $('#btnAI').addEventListener('click', toggleAIPanel);
    $('#aiClose').addEventListener('click', () => {
        $('#aiPanel').classList.add('hidden');
        state.aiPanelOpen = false;
    });

    // AI 标签切换
    $$('.ai-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.ai-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            $$('.ai-body > div').forEach(p => {
                p.classList.remove('active');
                p.style.display = 'none';
            });
            const tabName = tab.dataset.aiTab;
            const panel = $(`#ai${capitalize(tabName)}`);
            if (panel) {
                panel.classList.add('active');
                panel.style.display = 'flex';
            }
            state.aiTab = tabName;
        });
    });

    // 发送消息
    $('#aiSend').addEventListener('click', sendAIMessage);
    $('#aiInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAIMessage();
        }
    });

    // AI 改写选项
    $$('.ai-rewrite-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            $$('.ai-rewrite-opt').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        });
    });

    // AI 翻译选项
    $$('.ai-translate-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            $$('.ai-translate-opt').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        });
    });

    // 应用改写/翻译
    $('#aiRewriteApply').addEventListener('click', applyAIRewrite);
    $('#aiTranslateApply').addEventListener('click', applyAITranslate);
}

function toggleAIPanel() {
    const panel = $('#aiPanel');
    panel.classList.toggle('hidden');
    state.aiPanelOpen = !panel.classList.contains('hidden');
    if (state.aiPanelOpen) {
        $('#aiInput').focus();
    }
}

function sendAIMessage() {
    const input = $('#aiInput');
    const text = input.value.trim();
    if (!text) return;

    // 添加用户消息
    addAIChatMessage('user', text);
    input.value = '';

    // 模拟 AI 回复
    setTimeout(() => {
        const replies = [
            '我可以帮你改进这段 Markdown 的格式和结构。',
            '这段文档的描述很清晰，但可以添加更多示例来增强可读性。',
            '建议将长段落拆分为更小的部分，并使用标题来组织内容。',
            '你的 Markdown 语法使用正确！继续保持。',
            '可以尝试使用任务列表来跟踪待办事项，更加直观。'
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        addAIChatMessage('assistant', reply);
    }, 800);
}

function addAIChatMessage(role, text) {
    const messages = $('#aiMessages');
    const msg = document.createElement('div');
    msg.className = `ai-message ${role}`;
    const avatarIcon = role === 'user' ? 'ri-user-line' : 'ri-robot-line';
    msg.innerHTML = `<div class="ai-avatar"><i class="${avatarIcon}"></i></div>
        <div class="ai-text">${text}</div>`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function applyAIRewrite() {
    showNotification('AI 改写功能开发中...', 'info');
}

function applyAITranslate() {
    showNotification('AI 翻译功能开发中...', 'info');
}

// ========== 右键菜单 ==========
function initContextMenu() {
    // 阻止浏览器默认右键菜单
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY);
    });

    // 点击关闭右键菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu')) {
            hideContextMenu();
        }
    });

    // 右键菜单项点击
    $$('.context-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            if (action) {
                handleContextMenuAction(action);
            }
            hideContextMenu();
        });
    });
}

function showContextMenu(x, y) {
    const menu = $('#contextMenu');
    menu.classList.remove('hidden');
    // 确保菜单不超出视口
    const menuWidth = 220;
    const menuHeight = 300;
    const posX = Math.min(x, window.innerWidth - menuWidth);
    const posY = Math.min(y, window.innerHeight - menuHeight);
    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';
    state.contextMenuOpen = true;
}

function hideContextMenu() {
    const menu = $('#contextMenu');
    menu.classList.add('hidden');
    state.contextMenuOpen = false;
}

function handleContextMenuAction(action) {
    switch (action) {
        case 'ctxCut': document.execCommand('cut'); break;
        case 'ctxCopy': document.execCommand('copy'); break;
        case 'ctxPaste': document.execCommand('paste'); break;
        case 'ctxSelectAll': selectAllText(); break;
        case 'ctxFormat': formatDocument(); break;
        case 'ctxAI': toggleAIPanel(); break;
        case 'ctxInsert':
            // 子菜单通过 CSS hover 显示
            break;
        default:
            // 插入子菜单项
            if (action.startsWith('ins')) {
                handleMenuAction(action);
            }
            break;
    }
}

function selectAllText() {
    const editor = $('#editorContent');
    const range = document.createRange();
    range.selectNodeContents(editor);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

// ========== 状态栏 ==========
function initStatusBar() {
    updateStatusBar();

    // 通知按钮
    $('#statusNotifications').addEventListener('click', () => {
        showNotification('暂无新通知', 'info');
    });

    // 同步按钮
    $('#statusSync').addEventListener('click', () => {
        const icon = $('#statusSync i');
        icon.style.animation = 'spin 1s linear infinite';
        setTimeout(() => {
            icon.style.animation = 'none';
            $('#statusSync').classList.add('synced');
            showNotification('已同步', 'success');
        }, 1500);
    });

    // 语言
    $('#statusLanguage').addEventListener('click', () => {
        showNotification('Markdown 是当前唯一支持的语言', 'info');
    });

    // 编码
    $('#statusEncoding').addEventListener('click', () => {
        showNotification('当前编码: UTF-8', 'info');
    });
}

// ========== 键盘快捷键 ==========
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+S 保存
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveFile();
        }
        // Ctrl+N 新建
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            createNewFile();
        }
        // Ctrl+O 打开
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            showNotification('打开文件功能开发中...', 'info');
        }
        // Ctrl+F 查找
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            toggleFindBar();
        }
        // Ctrl+H 替换
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            toggleFindBar(true);
        }
        // Ctrl+Shift+P 命令面板
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            toggleCommandPalette();
        }
        // Ctrl+B 切换侧边栏
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            toggleSidebar();
        }
        // Ctrl+K 插入链接
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            wrapSelection('[', '](url)');
        }
        // Escape 关闭弹出层
        if (e.key === 'Escape') {
            closeAllPopups();
        }
        // Ctrl++ 放大
        if (e.ctrlKey && e.key === '=') {
            e.preventDefault();
            changeFontSize(1);
        }
        // Ctrl+- 缩小
        if (e.ctrlKey && e.key === '-') {
            e.preventDefault();
            changeFontSize(-1);
        }
        // Ctrl+0 重置缩放
        if (e.ctrlKey && e.key === '0') {
            e.preventDefault();
            state.fontSize = 13;
            applyFontSize();
        }
    });
}

function closeAllPopups() {
    hideContextMenu();
    $('#commandPalette').classList.add('hidden');
    state.commandPaletteOpen = false;
    $('#findBar').classList.add('hidden');
    state.findBarOpen = false;
    $('#aiPanel').classList.add('hidden');
    state.aiPanelOpen = false;
}

// ========== 分栏拖拽 ==========
function initGutterResize() {
    const gutter = $('#gutter');
    let isDragging = false;
    let startX, startLeftWidth, startRightWidth;

    gutter.addEventListener('mousedown', (e) => {
        isDragging = true;
        gutter.classList.add('dragging');
        const wrap = $('#editorPreviewWrap');
        const editorPane = $('#editorPane');
        const previewPane = $('#previewPane');
        startX = e.clientX;
        startLeftWidth = editorPane.offsetWidth;
        startRightWidth = previewPane.offsetWidth;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const wrap = $('#editorPreviewWrap');
        const editorPane = $('#editorPane');
        const previewPane = $('#previewPane');
        const totalWidth = wrap.offsetWidth;
        const newLeftWidth = Math.max(150, Math.min(totalWidth - 150, startLeftWidth + dx));
        const newRightWidth = totalWidth - newLeftWidth - 6; // 6px for gutter
        editorPane.style.flex = `0 0 ${newLeftWidth}px`;
        previewPane.style.flex = `1`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        gutter.classList.remove('dragging');
    });
}

// ========== 侧边栏拖拽 ==========
function initSidebarResize() {
    const resizeHandle = $('#sidebarResize');
    let isDragging = false;
    let startX, startWidth;

    resizeHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        resizeHandle.classList.add('dragging');
        startX = e.clientX;
        startWidth = $('#sidebar').offsetWidth;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const newWidth = Math.max(180, Math.min(500, startWidth + dx));
        $('#sidebar').style.width = newWidth + 'px';
        state.sidebarWidth = newWidth;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        resizeHandle.classList.remove('dragging');
    });
}

// ========== 通知系统 ==========
function showNotification(message, type) {
    type = type || 'info';
    const container = $('#notifications');
    const icons = {
        info: 'ri-information-line',
        warning: 'ri-alert-line',
        error: 'ri-error-warning-line',
        success: 'ri-check-line'
    };
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = `<i class="${icons[type]}"></i><span class="notification-text">${message}</span>
        <button class="notification-close"><i class="ri-close-line"></i></button>`;
    container.appendChild(notif);

    // 关闭按钮
    notif.querySelector('.notification-close').addEventListener('click', () => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(100%)';
        setTimeout(() => notif.remove(), 300);
    });

    // 自动消失
    setTimeout(() => {
        if (notif.parentNode) {
            notif.style.opacity = '0';
            notif.style.transform = 'translateX(100%)';
            setTimeout(() => notif.remove(), 300);
        }
    }, 4000);
}

// ========== 模态对话框 ==========
function showModal(title, body, onConfirm) {
    const overlay = $('#modalOverlay');
    $('#modalHeader').textContent = title;
    $('#modalBody').innerHTML = body;
    overlay.classList.remove('hidden');

    const confirm = $('#modalConfirm');
    const cancel = $('#modalCancel');
    const cleanup = () => {
        overlay.classList.add('hidden');
        confirm.removeEventListener('click', onOk);
        cancel.removeEventListener('click', onClose);
    };
    const onOk = () => {
        cleanup();
        if (onConfirm) onConfirm();
    };
    const onClose = () => {
        cleanup();
    };
    confirm.addEventListener('click', onOk);
    cancel.addEventListener('click', onClose);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) onClose();
    });
}

function showAbout() {
    showModal('关于 MD Mate',
        `<p style="line-height:1.8;">
            <strong>MD Mate</strong> v0.2.0<br>
            AI 时代的 Markdown 编辑器<br><br>
            为 Markdown 而生，像写代码一样写文档。<br>
            AI 驱动，智能编写与理解。<br>
            极致阅读体验，专注内容本身。<br>
            macOS 原生，流畅高效。<br><br>
            © 2024 MD Mate Team<br>
            MIT License
        </p>`,
        null
    );
}

function showKeyboardShortcuts() {
    showModal('快捷键参考',
        `<div style="display:grid;grid-template-columns:auto 1fr;gap:4px 16px;font-size:13px;line-height:2;">
            <span style="color:var(--text-menu-shortcut)">Ctrl+S</span><span>保存</span>
            <span style="color:var(--text-menu-shortcut)">Ctrl+N</span><span>新建文件</span>
            <span style="color:var(--text-menu-shortcut)">Ctrl+O</span><span>打开文件</span>
            <span style="color:var(--text-menu-shortcut)">Ctrl+F</span><span>查找</span>
            <span style="color:var(--text-menu-shortcut)">Ctrl+H</span><span>替换</span>
            <span style="color:var(--text-menu-shortcut)">Ctrl+B</span><span>切换侧边栏</span>
            <span style="color:var(--text-menu-shortcut)">Ctrl+K</span><span>插入链接</span>
            <span style="color:var(--text-menu-shortcut)">Ctrl+Shift+P</span><span>命令面板</span>
            <span style="color:var(--text-menu-shortcut)">Ctrl++</span><span>放大</span>
            <span style="color:var(--text-menu-shortcut)">Ctrl+-</span><span>缩小</span>
            <span style="color:var(--text-menu-shortcut)">Ctrl+0</span><span>重置缩放</span>
            <span style="color:var(--text-menu-shortcut)">Esc</span><span>关闭弹出层</span>
        </div>`,
        null
    );
}

// ========== 片段插入（旧版兼容） ==========
document.addEventListener('click', (e) => {
    const insertBtn = e.target.closest('.snippet-insert');
    if (insertBtn) {
        const snippetItem = insertBtn.closest('.snippet-item');
        const snippet = snippetItem.dataset.snippet;
        const snippets = getSnippetTemplates();
        if (snippets[snippet]) {
            insertAtCursor('\n' + snippets[snippet] + '\n');
            showNotification('片段已插入', 'success');
        }
    }
});

// ========== 搜索面板交互 ==========
const searchState = {
    query: '',
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
    results: [],
    totalMatches: 0,
    currentMatch: -1,
    debounceTimer: null
};

function initSearchPanel() {
    const searchInput = $('#searchInput');
    const caseBtn = $('#searchCaseSensitive');
    const wholeBtn = $('#searchWholeWord');
    const regexBtn = $('#searchRegex');

    // 搜索输入（带防抖）
    searchInput.addEventListener('input', () => {
        clearTimeout(searchState.debounceTimer);
        searchState.debounceTimer = setTimeout(() => {
            searchState.query = searchInput.value;
            performSidebarSearch();
        }, 200);
    });

    // 回车搜索
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchState.results.length > 0) {
                searchState.currentMatch = (searchState.currentMatch + 1) % searchState.results.length;
                jumpToSearchResult(searchState.results[searchState.currentMatch]);
            }
        }
    });

    // 选项按钮切换
    caseBtn.addEventListener('click', () => {
        searchState.caseSensitive = !searchState.caseSensitive;
        caseBtn.classList.toggle('active', searchState.caseSensitive);
        performSidebarSearch();
    });

    wholeBtn.addEventListener('click', () => {
        searchState.wholeWord = !searchState.wholeWord;
        wholeBtn.classList.toggle('active', searchState.wholeWord);
        performSidebarSearch();
    });

    regexBtn.addEventListener('click', () => {
        searchState.useRegex = !searchState.useRegex;
        regexBtn.classList.toggle('active', searchState.useRegex);
        performSidebarSearch();
    });
}

function performSidebarSearch() {
    const query = searchState.query;
    const statusEl = $('#searchStatusText');
    const resultsEl = $('#searchResults');

    if (!query.trim()) {
        statusEl.textContent = '输入关键词开始搜索';
        resultsEl.innerHTML = '';
        searchState.results = [];
        searchState.totalMatches = 0;
        searchState.currentMatch = -1;
        return;
    }

    // 显示搜索中状态
    statusEl.innerHTML = '<span class="search-spinner"></span> 搜索中...';

    // 搜索所有文件
    const results = [];
    let totalMatches = 0;
    const fileEntries = getAllFileEntries();

    for (const entry of fileEntries) {
        const content = getFileContent(entry.path);
        if (!content) continue;

        const lines = content.split('\n');
        const matches = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const matchResult = searchInLine(line, query, searchState.caseSensitive, searchState.wholeWord, searchState.useRegex);
            if (matchResult) {
                matches.push({
                    line: i + 1,
                    text: line,
                    matchStart: matchResult.start,
                    matchEnd: matchResult.end
                });
                totalMatches++;
            }
        }

        if (matches.length > 0) {
            results.push({
                fileName: entry.name,
                filePath: entry.path,
                matches: matches
            });
        }
    }

    searchState.results = results;
    searchState.totalMatches = totalMatches;
    searchState.currentMatch = -1;

    // 更新状态
    statusEl.textContent = totalMatches > 0
        ? `找到 ${totalMatches} 个结果（${results.length} 个文件）`
        : '未找到匹配结果';

    // 渲染结果
    if (results.length === 0) {
        resultsEl.innerHTML = `
            <div class="search-no-results">
                <i class="ri-search-line"></i>
                <span>未找到 "${escapeHtml(query)}" 的匹配结果</span>
            </div>`;
        return;
    }

    resultsEl.innerHTML = results.map(file => `
        <div class="search-result-file">
            <div class="search-result-header" data-file="${file.filePath}">
                <i class="ri-file-text-line"></i>
                <span>${file.fileName}</span>
                <span class="search-match-count">${file.matches.length}</span>
            </div>
            ${file.matches.slice(0, 20).map(m => `
                <div class="search-result-item" data-file="${file.filePath}" data-line="${m.line}">
                    <span class="search-line-num">${m.line}</span>
                    ${highlightSearchResult(m.text, m.matchStart, m.matchEnd)}
                </div>
            `).join('')}
            ${file.matches.length > 20 ? `<div class="search-result-item" style="color:var(--text-tertiary);font-style:italic;">...还有 ${file.matches.length - 20} 个结果</div>` : ''}
        </div>
    `).join('');

    // 绑定点击事件
    resultsEl.querySelectorAll('.search-result-item[data-line]').forEach(item => {
        item.addEventListener('click', () => {
            const filePath = item.dataset.file;
            const lineNum = parseInt(item.dataset.line);
            // 切换到该文件
            const fileName = filePath.split('/').pop();
            switchTab(fileName);
            // 跳转到对应行
            setTimeout(() => jumpToLine(lineNum), 100);
        });
    });

    resultsEl.querySelectorAll('.search-result-header[data-file]').forEach(header => {
        header.addEventListener('click', () => {
            const filePath = header.dataset.file;
            const fileName = filePath.split('/').pop();
            switchTab(fileName);
        });
    });
}

function searchInLine(line, query, caseSensitive, wholeWord, useRegex) {
    try {
        let regex;
        if (useRegex) {
            regex = new RegExp(query, caseSensitive ? '' : 'i');
        } else if (wholeWord) {
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            regex = new RegExp(`\\b${escaped}\\b`, caseSensitive ? '' : 'i');
        } else {
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            regex = new RegExp(escaped, caseSensitive ? '' : 'i');
        }
        const match = regex.exec(line);
        if (match) {
            return { start: match.index, end: match.index + match[0].length };
        }
    } catch (e) {
        // 无效正则
    }
    return null;
}

function highlightSearchResult(text, matchStart, matchEnd) {
    const before = escapeHtml(text.substring(0, matchStart));
    const match = escapeHtml(text.substring(matchStart, matchEnd));
    const after = escapeHtml(text.substring(matchEnd));
    // 截断过长文本
    const maxLen = 50;
    const displayBefore = before.length > maxLen ? '...' + before.slice(-maxLen) : before;
    const displayAfter = after.length > maxLen ? after.slice(0, maxLen) + '...' : after;
    return `${displayBefore}<span class="search-match-highlight">${match}</span>${displayAfter}`;
}

function jumpToSearchResult(result) {
    if (!result || result.matches.length === 0) return;
    const fileName = result.filePath.split('/').pop();
    switchTab(fileName);
    const match = result.matches[0];
    setTimeout(() => jumpToLine(match.line), 100);
}

function getAllFileEntries() {
    const entries = [];
    function walk(node, path) {
        if (!node.children) return;
        for (const [name, val] of Object.entries(node.children)) {
            const fullPath = path ? `${path}/${name}` : name;
            if (val.type === 'folder') {
                walk(val, fullPath);
            } else if (name.endsWith('.md') || name.endsWith('.go') || name.endsWith('.html') || name.endsWith('.mod') || name.endsWith('.sum') || name.startsWith('.')) {
                entries.push({ name, path: fullPath, type: val.type });
            }
        }
    }
    walk(fileSystem['md-mate'], '');
    return entries;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ========== 大纲面板交互 ==========
const outlineState = {
    filter: '',
    headings: [],
    debounceTimer: null
};

function initOutlinePanel() {
    const filterInput = $('#outlineFilter');

    // 大纲筛选
    filterInput.addEventListener('input', () => {
        outlineState.filter = filterInput.value.trim();
        renderOutline();
    });

    // 初始渲染
    updateOutline();
}

function updateOutline() {
    const editor = $('#editorContent');
    const content = editor.innerText || '';
    const lines = content.split('\n');
    const headings = [];

    lines.forEach((line, idx) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            headings.push({ level, text: match[2], line: idx + 1 });
        }
    });

    outlineState.headings = headings;
    renderOutline();
}

function renderOutline() {
    const tree = $('#outlineTree');
    const headings = outlineState.headings;
    const filter = outlineState.filter.toLowerCase();

    if (headings.length === 0) {
        tree.innerHTML = `
            <div class="outline-empty" id="outlineEmpty">
                <i class="ri-list-unordered"></i>
                <span>编辑文档后自动生成大纲</span>
            </div>`;
        return;
    }

    // 筛选
    const filtered = filter
        ? headings.filter(h => h.text.toLowerCase().includes(filter))
        : headings;

    if (filtered.length === 0) {
        tree.innerHTML = `
            <div class="outline-empty">
                <i class="ri-search-line"></i>
                <span>未找到匹配的标题</span>
            </div>`;
        return;
    }

    tree.innerHTML = filtered.map(item => {
        const displayText = filter
            ? highlightFilterMatch(item.text, filter)
            : escapeHtml(item.text);
        return `<div class="outline-item heading-${item.level}" data-line="${item.line}">
            <span class="outline-badge">H${item.level}</span>
            <span class="outline-text">${displayText}</span>
        </div>`;
    }).join('');

    // 点击大纲跳转
    tree.querySelectorAll('.outline-item').forEach(item => {
        item.addEventListener('click', () => {
            const lineNum = parseInt(item.dataset.line);
            // 高亮当前选中
            tree.querySelectorAll('.outline-item').forEach(i => i.classList.remove('outline-active'));
            item.classList.add('outline-active');
            jumpToLine(lineNum);
        });
    });
}

function highlightFilterMatch(text, filter) {
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<span class="outline-filter-match">$1</span>');
}

// ========== 片段面板交互 ==========
const snippetsState = {
    filter: ''
};

function getSnippetTemplates() {
    return {
        table: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |',
        codeblock: '```javascript\n// 代码\n```',
        tasklist: '- [x] 已完成\n- [ ] 未完成',
        note: '> 📌 **注意**: 此处需要特别注意',
        image: '![描述](url)',
        footnote: '[^1] 脚注内容\n\n[^1]: 完整的脚注说明写在这里',
        details: '<details>\n<summary>点击展开</summary>\n\n这里是折叠的内容\n\n</details>',
        mermaid: '```mermaid\ngraph TD\n    A[开始] --> B{判断}\n    B -->|是| C[执行]\n    B -->|否| D[结束]\n    C --> D\n```',
        prdtpl: '## 需求背景\n\n描述需求的来源和背景。\n\n## 目标\n\n- 目标1\n- 目标2\n\n## 功能描述\n\n### 功能点1\n\n**用户故事**: 作为xxx，我希望xxx，以便xxx。\n\n**验收标准**:\n1. 条件1\n2. 条件2\n\n### 功能点2\n\n## 非功能需求\n\n- 性能:\n- 安全:\n- 兼容性:\n\n## 排期\n\n| 阶段 | 时间 | 产出 |\n| --- | --- | --- |\n| 设计 | | |\n| 开发 | | |\n| 测试 | | |',
        apitpl: '## 接口名称\n\n**URL**: `/api/xxx`\n**Method**: `GET`\n**认证**: 需要\n\n### 请求参数\n\n| 参数 | 类型 | 必填 | 说明 |\n| --- | --- | --- | --- |\n| id | string | 是 | 唯一标识 |\n\n### 请求示例\n\n```json\n{\n  "id": "123"\n}\n```\n\n### 响应参数\n\n| 参数 | 类型 | 说明 |\n| --- | --- | --- |\n| code | number | 状态码 |\n| data | object | 数据 |\n\n### 响应示例\n\n```json\n{\n  "code": 0,\n  "data": {}\n}\n```\n\n### 错误码\n\n| 错误码 | 说明 |\n| --- | --- |\n| 400 | 参数错误 |\n| 401 | 未认证 |',
        readmetpl: '# 项目名称\n\n> 一句话描述项目\n\n## 简介\n\n项目的详细描述。\n\n## 功能特性\n\n- 特性1\n- 特性2\n- 特性3\n\n## 安装\n\n```bash\nnpm install project-name\n```\n\n## 使用\n\n```javascript\nimport project from \'project-name\'\n\nproject.init()\n```\n\n## 配置\n\n| 参数 | 默认值 | 说明 |\n| --- | --- | --- |\n| option1 | true | 说明1 |\n\n## 开发\n\n```bash\n# 安装依赖\nnpm install\n\n# 启动开发服务器\nnpm run dev\n\n# 构建\nnpm run build\n```\n\n## 贡献\n\n欢迎提交 PR！\n\n## 许可证\n\nMIT'
    };
}

function initSnippetsPanel() {
    const filterInput = $('#snippetsFilter');

    // 片段搜索过滤
    filterInput.addEventListener('input', () => {
        snippetsState.filter = filterInput.value.trim().toLowerCase();
        filterSnippets();
    });

    // 分类折叠
    $$('.snippets-cat-header').forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
        });
    });

    // 片段项点击插入
    $$('.snippet-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // 如果点击的是插入按钮，不重复处理
            if (e.target.closest('.snippet-insert')) return;
            const snippetKey = item.dataset.snippet;
            const templates = getSnippetTemplates();
            if (templates[snippetKey]) {
                insertAtCursor('\n' + templates[snippetKey] + '\n');
                showNotification('片段已插入', 'success');
            }
        });
    });

    // 插入按钮点击
    $$('.snippet-insert').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const snippetItem = btn.closest('.snippet-item');
            const snippetKey = snippetItem.dataset.snippet;
            const templates = getSnippetTemplates();
            if (templates[snippetKey]) {
                insertAtCursor('\n' + templates[snippetKey] + '\n');
                showNotification('片段已插入', 'success');
            }
        });
    });
}

function filterSnippets() {
    const filter = snippetsState.filter;
    const categories = $$('.snippets-category');

    categories.forEach(cat => {
        const items = cat.querySelectorAll('.snippet-item');
        let hasVisibleItem = false;

        items.forEach(item => {
            const name = item.querySelector('.snippet-name').textContent.toLowerCase();
            const preview = item.querySelector('.snippet-preview').textContent.toLowerCase();
            const match = !filter || name.includes(filter) || preview.includes(filter);
            item.style.display = match ? '' : 'none';
            if (match) hasVisibleItem = true;
        });

        // 隐藏没有匹配项的分类
        cat.style.display = hasVisibleItem ? '' : 'none';
        // 如果有搜索词，自动展开分类
        if (filter && hasVisibleItem) {
            const header = cat.querySelector('.snippets-cat-header');
            header.classList.remove('collapsed');
        }
    });
}
