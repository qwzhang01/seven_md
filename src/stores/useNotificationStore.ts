import { create } from 'zustand'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  action?: () => void
  actionLabel?: string
  createdAt: number
  autoClose: boolean
  duration: number // ms
  isPaused?: boolean // hover 暂停标记
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  markAllRead: () => void
  setNotificationPaused: (id: string, paused: boolean) => void
}

let notifIdCounter = 0

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const id = `notif-${++notifIdCounter}-${Date.now()}`
    const newNotif: Notification = {
      ...notification,
      id,
      createdAt: Date.now(),
    }

    set((s) => {
      const current = s.notifications
      let notifications: Notification[]
      if (current.length >= 5) {
        // 找到最早未被暂停的通知并移除
        const removeIdx = current.findIndex((n) => !n.isPaused)
        if (removeIdx !== -1) {
          notifications = [...current.slice(0, removeIdx), ...current.slice(removeIdx + 1), newNotif]
        } else {
          // 所有通知都被暂停，强制移除最早的
          notifications = [...current.slice(1), newNotif]
        }
      } else {
        notifications = [...current, newNotif]
      }

      return {
        notifications,
        unreadCount: s.unreadCount + 1,
      }
    })

    // Auto-close after duration
    if (notification.autoClose !== false) {
      const duration = notification.duration || 5000
      setTimeout(() => {
        get().removeNotification(id)
      }, duration)
    }

    return id
  },

  removeNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
  markAllRead: () => set({ unreadCount: 0 }),
  setNotificationPaused: (id, paused) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, isPaused: paused } : n
      ),
    })),
}))
