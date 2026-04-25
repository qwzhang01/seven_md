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
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  markAllRead: () => void
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
      // Max 5 visible notifications
      const current = s.notifications
      const notifications = current.length >= 5
        ? [...current.slice(1), newNotif]
        : [...current, newNotif]

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
}))
