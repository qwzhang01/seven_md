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
  const { removeNotification } = useNotificationStore()
  const [visible, setVisible] = useState(false)
  // 1.1 remainingTime state：从剩余时间继续倒计时，而非重新计时
  const [remainingTime, setRemainingTime] = useState(notification.duration || 5000)
  // 1.2 isPaused state 管理暂停状态
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 用 ref 记录计时器启动时刻，精确计算已流逝时间
  const startTimeRef = useRef<number | null>(null)

  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info

  // 1.3 + 1.4：统一的计时器逻辑
  const startTimer = useCallback(() => {
    if (!notification.autoClose) return
    if (timerRef.current) clearTimeout(timerRef.current)

    const totalDuration = notification.duration || 5000
    // 从 remainingTime 恢复（hover 离开后）或从完整时长启动
    const timeToUse = remainingTime > 0 ? remainingTime : totalDuration
    startTimeRef.current = Date.now()

    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => removeNotification(notification.id), 300)
    }, timeToUse)
  }, [notification, removeNotification, remainingTime])

  // 初始化：slide in + 启动计时器
  // 依赖 autoClose/duration，确保组件重建时重新初始化（notification.id 变化时）
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    if (notification.autoClose) {
      const d = notification.duration || 5000
      setRemainingTime(d)
      startTimeRef.current = Date.now()
      startTimer()
    }
    return () => {
      clearTimeout(t)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [notification.autoClose, notification.duration])

  // 1.3 onMouseEnter：暂停计时器，保存剩余时间
  const handleMouseEnter = useCallback(() => {
    if (!notification.autoClose) return
    if (timerRef.current) clearTimeout(timerRef.current)
    // 计算已流逝时间，保存剩余时间
    if (startTimeRef.current !== null) {
      const elapsed = Date.now() - startTimeRef.current
      const totalDuration = notification.duration || 5000
      setRemainingTime(Math.max(0, totalDuration - elapsed))
    }
    setIsPaused(true)
  }, [notification.autoClose, notification.duration])

  // 1.4 onMouseLeave：恢复计时器，从 remainingTime 继续
  const handleMouseLeave = useCallback(() => {
    if (!notification.autoClose) return
    setIsPaused(false)
    startTimer()
  }, [notification.autoClose, startTimer])

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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
