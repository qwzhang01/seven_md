/**
 * MD Mate - macOS 原生菜单配置
 * 
 * 此文件定义了 Electron 主进程使用的应用程序菜单。
 * macOS 使用系统原生菜单栏，渲染进程通过 IPC 接收菜单动作。
 * 
 * 使用方式（在 Electron 主进程 main.js 中）：
 *   const { Menu } = require('electron');
 *   const menuTemplate = require('./menu-config');
 *   const menu = Menu.buildFromTemplate(menuTemplate);
 *   Menu.setApplicationMenu(menu);
 */

const isMac = process.platform === 'darwin';

/**
 * 菜单模板 - 完整的 macOS 应用菜单结构
 * 
 * 字段说明：
 * - label: 菜单项显示文本
 * - submenu: 子菜单数组
 * - accelerator: 快捷键（macOS 使用 Cmd，自动映射）
 * - click: 点击回调，通过 IPC 发送 action 到渲染进程
 * - type: 'separator' | 'checkbox' | 'radio' | 'normal'
 * - role: Electron 内置角色（如 undo, redo, copy 等）
 * - enabled: 是否可用
 * - visible: 是否可见
 * - checked: checkbox/radio 是否选中
 */
const menuTemplate = [
    // ===== 苹果菜单（macOS 专属，自动由系统添加"关于"、"偏好设置"等） =====
    ...(isMac ? [{
        label: app.name || 'MD Mate',
        submenu: [
            { label: '关于 MD Mate', action: 'about' },
            { type: 'separator' },
            { label: '偏好设置…', accelerator: 'Cmd+,', action: 'openPreferences' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : []),

    // ===== 文件菜单 =====
    {
        label: '文件',
        submenu: [
            {
                label: '新建文件',
                accelerator: 'CmdOrCtrl+N',
                action: 'newFile'
            },
            {
                label: '新建窗口',
                accelerator: 'CmdOrCtrl+Shift+N',
                action: 'newWindow'
            },
            { type: 'separator' },
            {
                label: '打开文件…',
                accelerator: 'CmdOrCtrl+O',
                action: 'openFile'
            },
            {
                label: '打开文件夹…',
                accelerator: 'CmdOrCtrl+Shift+O',
                action: 'openFolder'
            },
            {
                label: '最近打开',
                role: 'recentDocuments',
                submenu: [
                    { label: '清除最近打开', role: 'clearRecentDocuments' }
                ]
            },
            { type: 'separator' },
            {
                label: '保存',
                accelerator: 'CmdOrCtrl+S',
                action: 'save'
            },
            {
                label: '另存为…',
                accelerator: 'CmdOrCtrl+Shift+S',
                action: 'saveAs'
            },
            {
                label: '全部保存',
                accelerator: 'CmdOrCtrl+Alt+S',
                action: 'saveAll'
            },
            { type: 'separator' },
            {
                label: '导出为 PDF',
                action: 'exportPdf'
            },
            {
                label: '导出为 HTML',
                action: 'exportHtml'
            },
            { type: 'separator' },
            ...(isMac ? [
                { role: 'close', accelerator: 'Cmd+W' }
            ] : [
                { label: '关闭', accelerator: 'Ctrl+W', action: 'closeFile' }
            ])
        ]
    },

    // ===== 编辑菜单 =====
    {
        label: '编辑',
        submenu: [
            { role: 'undo', label: '撤销', accelerator: 'CmdOrCtrl+Z' },
            { role: 'redo', label: '重做', accelerator: 'CmdOrCtrl+Shift+Z' },
            { type: 'separator' },
            { role: 'cut', label: '剪切', accelerator: 'CmdOrCtrl+X' },
            { role: 'copy', label: '复制', accelerator: 'CmdOrCtrl+C' },
            { role: 'paste', label: '粘贴', accelerator: 'CmdOrCtrl+V' },
            {
                label: '粘贴并匹配样式',
                accelerator: 'CmdOrCtrl+Shift+V',
                action: 'pasteAndMatchStyle'
            },
            { type: 'separator' },
            {
                label: '查找',
                accelerator: 'CmdOrCtrl+F',
                action: 'find'
            },
            {
                label: '查找下一个',
                accelerator: 'CmdOrCtrl+G',
                action: 'findNext'
            },
            {
                label: '查找上一个',
                accelerator: 'CmdOrCtrl+Shift+G',
                action: 'findPrevious'
            },
            {
                label: '替换',
                accelerator: 'CmdOrCtrl+H',
                action: 'replace'
            },
            { type: 'separator' },
            {
                label: '全选',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectAll'
            }
        ]
    },

    // ===== 插入菜单 =====
    {
        label: '插入',
        submenu: [
            {
                label: '标题',
                submenu: [
                    { label: '标题 1', accelerator: 'CmdOrCtrl+1', action: 'fmtH1' },
                    { label: '标题 2', accelerator: 'CmdOrCtrl+2', action: 'fmtH2' },
                    { label: '标题 3', accelerator: 'CmdOrCtrl+3', action: 'fmtH3' },
                    { label: '标题 4', accelerator: 'CmdOrCtrl+4', action: 'insH4' },
                    { label: '标题 5', accelerator: 'CmdOrCtrl+5', action: 'insH5' },
                    { label: '标题 6', accelerator: 'CmdOrCtrl+6', action: 'insH6' },
                ]
            },
            { type: 'separator' },
            {
                label: '加粗',
                accelerator: 'CmdOrCtrl+B',
                action: 'insBold'
            },
            {
                label: '斜体',
                accelerator: 'CmdOrCtrl+I',
                action: 'insItalic'
            },
            {
                label: '删除线',
                accelerator: 'CmdOrCtrl+Shift+X',
                action: 'fmtStrike'
            },
            { type: 'separator' },
            {
                label: '行内代码',
                accelerator: 'CmdOrCtrl+E',
                action: 'insCode'
            },
            {
                label: '代码块',
                accelerator: 'CmdOrCtrl+Alt+C',
                action: 'insCodeBlock'
            },
            { type: 'separator' },
            {
                label: '链接',
                accelerator: 'CmdOrCtrl+K',
                action: 'insLink'
            },
            {
                label: '图片',
                accelerator: 'CmdOrCtrl+Shift+I',
                action: 'insImage'
            },
            { type: 'separator' },
            {
                label: '表格',
                action: 'insTable'
            },
            {
                label: '水平分割线',
                accelerator: 'CmdOrCtrl+Shift+H',
                action: 'insHr'
            },
            { type: 'separator' },
            {
                label: '无序列表',
                action: 'insUl'
            },
            {
                label: '有序列表',
                action: 'insOl'
            },
            {
                label: '任务列表',
                action: 'insTask'
            },
            { type: 'separator' },
            {
                label: '引用',
                action: 'insBlockquote'
            },
            {
                label: '脚注',
                action: 'insFootnote'
            },
            {
                label: '折叠区块',
                action: 'insDetails'
            }
        ]
    },

    // ===== 格式菜单 =====
    {
        label: '格式',
        submenu: [
            {
                label: '加粗',
                accelerator: 'CmdOrCtrl+B',
                action: 'fmtBold'
            },
            {
                label: '斜体',
                accelerator: 'CmdOrCtrl+I',
                action: 'fmtItalic'
            },
            {
                label: '删除线',
                action: 'fmtStrike'
            },
            { type: 'separator' },
            {
                label: '标题',
                submenu: [
                    { label: '标题 1', accelerator: 'CmdOrCtrl+1', action: 'fmtH1' },
                    { label: '标题 2', accelerator: 'CmdOrCtrl+2', action: 'fmtH2' },
                    { label: '标题 3', accelerator: 'CmdOrCtrl+3', action: 'fmtH3' },
                    { label: '标题 4', action: 'insH4' },
                    { label: '标题 5', action: 'insH5' },
                    { label: '标题 6', action: 'insH6' },
                ]
            },
            { type: 'separator' },
            {
                label: '代码',
                accelerator: 'CmdOrCtrl+E',
                action: 'fmtCode'
            },
            {
                label: '链接',
                accelerator: 'CmdOrCtrl+K',
                action: 'fmtLink'
            },
            { type: 'separator' },
            {
                label: '清除格式',
                accelerator: 'CmdOrCtrl+\\',
                action: 'fmtClear'
            }
        ]
    },

    // ===== 视图菜单 =====
    {
        label: '视图',
        submenu: [
            {
                label: '命令面板…',
                accelerator: 'CmdOrCtrl+Shift+P',
                action: 'cmdPalette'
            },
            { type: 'separator' },
            {
                label: '切换侧边栏',
                accelerator: 'CmdOrCtrl+B',
                action: 'toggleSidebar'
            },
            {
                label: '切换大纲面板',
                action: 'toggleOutline'
            },
            {
                label: '切换 AI 助手面板',
                accelerator: 'CmdOrCtrl+Shift+A',
                action: 'toggleAIPanel'
            },
            { type: 'separator' },
            {
                label: '编辑器视图',
                submenu: [
                    { label: '仅编辑器', accelerator: 'CmdOrCtrl+Alt+1', action: 'toggleFullEditor', type: 'radio' },
                    { label: '仅预览', accelerator: 'CmdOrCtrl+Alt+2', action: 'toggleFullPreview', type: 'radio' },
                    { label: '分栏视图', accelerator: 'CmdOrCtrl+Alt+3', action: 'toggleSplit', type: 'radio', checked: true },
                ]
            },
            { type: 'separator' },
            {
                label: '放大',
                accelerator: 'CmdOrCtrl+=',
                action: 'zoomIn'
            },
            {
                label: '缩小',
                accelerator: 'CmdOrCtrl+-',
                action: 'zoomOut'
            },
            {
                label: '重置缩放',
                accelerator: 'CmdOrCtrl+0',
                action: 'zoomReset'
            },
            { type: 'separator' },
            ...(isMac ? [
                { role: 'togglefullscreen', label: '全屏', accelerator: 'Ctrl+Cmd+F' }
            ] : [
                { label: '全屏', accelerator: 'F11', action: 'toggleFullscreen' }
            ]),
            { type: 'separator' },
            {
                label: '显示行号',
                type: 'checkbox',
                checked: true,
                action: 'toggleLineNumbers'
            },
            {
                label: '显示迷你地图',
                type: 'checkbox',
                checked: false,
                action: 'toggleMinimap'
            },
            {
                label: '自动换行',
                type: 'checkbox',
                checked: true,
                action: 'toggleWordWrap'
            }
        ]
    },

    // ===== 主题菜单 =====
    {
        label: '主题',
        submenu: [
            {
                label: '深色模式',
                type: 'radio',
                checked: true,
                action: 'theme:dark'
            },
            {
                label: '浅色模式',
                type: 'radio',
                action: 'theme:light'
            },
            { type: 'separator' },
            {
                label: 'Monokai',
                type: 'radio',
                action: 'theme:monokai'
            },
            {
                label: 'Solarized',
                type: 'radio',
                action: 'theme:solarized'
            },
            {
                label: 'Nord',
                type: 'radio',
                action: 'theme:nord'
            },
            {
                label: 'Dracula',
                type: 'radio',
                action: 'theme:dracula'
            },
            {
                label: 'GitHub',
                type: 'radio',
                action: 'theme:github'
            }
        ]
    },

    // ===== 窗口菜单（macOS 专属） =====
    ...(isMac ? [{
        label: '窗口',
        submenu: [
            { role: 'minimize', label: '最小化', accelerator: 'Cmd+M' },
            { role: 'zoom', label: '缩放' },
            { type: 'separator' },
            { role: 'front', label: '全部置于前面' },
        ]
    }] : []),

    // ===== 帮助菜单 =====
    {
        label: '帮助',
        role: 'help',
        submenu: [
            {
                label: 'MD Mate 帮助',
                accelerator: isMac ? 'Cmd+?' : 'F1',
                action: 'markdownGuide'
            },
            {
                label: '快捷键参考',
                action: 'keyboardShortcuts'
            },
            { type: 'separator' },
            {
                label: '欢迎页',
                action: 'welcome'
            },
            { type: 'separator' },
            {
                label: '检查更新…',
                action: 'checkUpdate'
            },
            { type: 'separator' },
            ...(isMac ? [
                { label: '关于 MD Mate', action: 'about' }
            ] : [
                { label: '关于 MD Mate', action: 'about' }
            ])
        ]
    }
];

/**
 * 构建 Electron Menu 实例
 * 将 action 字段转换为 click 回调，通过 IPC 发送到渲染进程
 * 
 * @param {Electron.BrowserWindow} mainWindow - 主窗口实例
 * @returns {Electron.Menu} 构建好的菜单实例
 */
function buildMenu(mainWindow) {
    const { Menu } = require('electron');
    
    // 递归处理菜单模板，将 action 转换为 click 回调
    function processTemplate(template) {
        return template.map(item => {
            const processed = { ...item };
            
            if (item.submenu && Array.isArray(item.submenu)) {
                processed.submenu = processTemplate(item.submenu);
            }
            
            // 如果有 action 字段，转换为 click 回调
            if (item.action && !item.click) {
                processed.click = (menuItem, browserWindow) => {
                    if (browserWindow) {
                        browserWindow.webContents.send('menu-action', item.action);
                    }
                };
                delete processed.action;
            }
            
            return processed;
        });
    }
    
    const processed = processTemplate(menuTemplate);
    return Menu.buildFromTemplate(processed);
}

// 导出
module.exports = { menuTemplate, buildMenu };
