/**
 * 微信公众号导出面板
 * 右侧抽屉：主题选择 + 实时预览 + 一键复制
 */

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { X, Copy, AlertTriangle } from 'lucide-react'
import { useWechatStore } from '../stores/useWechatStore'
import { useFileStore, useNotificationStore } from '../../stores'
import { themeOptions } from '../theme-css'
import type { ThemeName } from '../theme-css'
import { buildThemeCSS } from '../theme/themeApplicator'
import { copyToWechat, renderPreviewHtml } from '../services/wechatExport'

export function WechatPanel() {
  const {
    isOpen, close,
    themeName, primaryColor, fontFamily, fontSize, customCSS,
    setTheme, setPrimaryColor,
  } = useWechatStore()
  const { addNotification } = useNotificationStore()
  const panelRef = useRef<HTMLDivElement>(null)

  // 获取当前编辑器内容
  const activeTab = useFileStore((s) => s.getActiveTab())
  const content = activeTab?.content ?? ''

  // 构建预览 HTML
  const previewHtml = useMemo(() => {
    if (!content || !isOpen) return ''
    return renderPreviewHtml(content, {
      themeName, primaryColor, fontFamily, fontSize, customCSS,
    })
  }, [content, isOpen, themeName, primaryColor, fontFamily, fontSize, customCSS])

  // 构建主题 CSS
  const themeCSS = useMemo(() => {
    if (!isOpen) return ''
    return buildThemeCSS({ themeName, primaryColor, fontFamily, fontSize, customCSS })
  }, [isOpen, themeName, primaryColor, fontFamily, fontSize, customCSS])

  // 复制到微信
  const handleCopy = useCallback(async () => {
    if (!content) {
      addNotification({ type: 'warning', message: '没有可导出的内容', autoClose: true, duration: 3000 })
      return
    }
    try {
      await copyToWechat(content, { themeName, primaryColor, fontFamily, fontSize, customCSS })
      addNotification({ type: 'success', message: '已复制到剪贴板，可直接粘贴到公众号编辑器', autoClose: true, duration: 3000 })
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : '复制失败',
        autoClose: true,
        duration: 5000,
      })
    }
  }, [content, themeName, primaryColor, fontFamily, fontSize, customCSS, addNotification])

  // ESC 关闭
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/30 transition-opacity"
        onClick={close}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 z-[9999] flex flex-col shadow-2xl animate-in slide-in-from-right"
        style={{
          width: 'min(520px, 90vw)',
          background: 'var(--bg-primary)',
          borderLeft: '1px solid var(--border-primary)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            微信公众号导出
          </h2>
          <button
            onClick={close}
            className="p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="关闭"
          >
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Controls */}
        <div
          className="px-4 py-3 shrink-0 flex flex-wrap items-center gap-4"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>主题</label>
            <div className="flex gap-1">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value as ThemeName)}
                  className="px-2 py-1 text-xs rounded transition-colors"
                  style={{
                    background: themeName === opt.value ? 'var(--bg-tertiary)' : 'transparent',
                    color: themeName === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: themeName === opt.value ? '1px solid var(--border-primary)' : '1px solid transparent',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>主色调</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
              style={{ background: 'none' }}
            />
            <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
              {primaryColor}
            </span>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white transition-colors"
            style={{ background: '#07c160' }}
          >
            <Copy size={12} />
            复制到公众号
          </button>
        </div>

        {/* Image Notice */}
        <div
          className="mx-4 mt-3 mb-2 flex items-start gap-2 px-3 py-2 rounded text-xs"
          style={{
            background: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            color: 'var(--text-secondary)',
          }}
        >
          <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: '#eab308' }} />
          <span>图片需手动上传到微信服务器才能在发布后正常显示。粘贴后请在微信编辑器中重新上传图片。</span>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto px-4 py-3">
          <style>{themeCSS}</style>
          <div
            id="wechat-preview"
            className="mx-auto"
            style={{
              maxWidth: '100%',
              padding: '20px',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid var(--border-default)',
              color: '#171717',
              lineHeight: 1.75,
            }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    </>
  )
}
