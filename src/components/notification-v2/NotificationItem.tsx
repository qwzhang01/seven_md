import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { useNotificationStore } from '../../stores'
import type { Notification } from '../../stores'

const TYPE_CONFIG = {
  info: {
    icon: <Info size={16} />,
    color: 'var(--info-color, var(--info, #3794ff))',
    borderColor: 'var(--info-color, var(--info, #3794ff))',
  },
  success: {
    icon: <CheckCircle size={16} />,
    color: 'var(--success-color, var(--success, #73c991))',
    borderColor: 'var(--success-color, var(--success, #73c991))',
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    color: 'var(--warning-color, var(--warning, #cca700))',
    borderColor: 'var(--warning-color, var(--warning, #cca700))',
  },
  error: {
    icon: <AlertCircle size={16} />,
    color: 'var(--error-color, var(--error, #f48771))',
    borderColor: 'var(--error-color, var(--error, #f48771))',
  },
}

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { removeNotification, setNotificationPaused } = useNotificationStore()
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPaused = useRef(false)

  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info

  const startTimer = useCallback(() => {
    if (!notification.autoClose) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!isPaused.current) {
        setVisible(false)
        setTimeout(() => removeNotification(notification.id), 300)
      }
    }, notification.duration || 5000)
  }, [notification, removeNotification])

  useEffect(() => {
    // Slide in
    const t = setTimeout(() => setVisible(true), 10)
    startTimer()
    return () => {
      clearTimeout(t)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [startTimer])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(() => removeNotification(notification.id), 300)
  }, [notification.id, removeNotification])

  return (
    <div
      className="flex items-start gap-2.5 text-sm rounded-lg"
      style={{
        background: 'var(--bg-notification, var(--bg-secondary))',
        border: '1px solid var(--border-primary)',
        borderLeft: `3px solid ${config.borderColor}`,
        boxShadow: 'var(--shadow-md, 0 2px 8px rgba(0,0,0,0.4))',
        padding: '10px 14px',
        minWidth: '280px',
        maxWidth: '400px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={() => { isPaused.current = true; setNotificationPaused(notification.id, true); if (timerRef.current) clearTimeout(timerRef.current) }}
      onMouseLeave={() => { isPaused.current = false; setNotificationPaused(notification.id, false); startTimer() }}
    >
      <span style={{ color: config.color, flexShrink: 0, marginTop: 1 }}>
        {config.icon}
      </span>
      <span
        className="flex-1 leading-relaxed"
        style={{ color: 'var(--text-primary)', fontSize: 13 }}
      >
        {notification.message}
      </span>
      <button
        className="flex items-center justify-center w-5 h-5 rounded flex-shrink-0 transition-colors"
        style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        onClick={handleClose}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-hover)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-tertiary)'
        }}
        aria-label="关闭"
      >
        <X size={12} />
      </button>
    </div>
  )
}
