import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useNotificationStore } from '../../stores/useNotificationStore'

function reset() {
  useNotificationStore.setState({ notifications: [], unreadCount: 0 })
}

describe('useNotificationStore', () => {
  beforeEach(() => {
    act(() => reset())
    vi.useFakeTimers()
  })

  afterEach(() => vi.useRealTimers())

  it('addNotification 添加通知到队列', () => {
    act(() => {
      useNotificationStore.getState().addNotification({
        type: 'success',
        message: '保存成功',
        autoClose: false,
        duration: 5000,
      })
    })
    const { notifications, unreadCount } = useNotificationStore.getState()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].message).toBe('保存成功')
    expect(notifications[0].type).toBe('success')
    expect(unreadCount).toBe(1)
  })

  it('removeNotification 移除指定通知', () => {
    let id!: string
    act(() => {
      id = useNotificationStore.getState().addNotification({
        type: 'info',
        message: 'test',
        autoClose: false,
        duration: 5000,
      })
    })
    act(() => { useNotificationStore.getState().removeNotification(id) })
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
  })

  // 注意：auto-close 计时器已移至 NotificationItem 组件层管理（支持 hover 暂停）
  // Store 层不再持有 auto-close 的 setTimeout，组件层通过 remainingTime + startTimeRef 精确控制

  it('最多 5 条可见，超出自动淘汰旧通知', () => {
    act(() => {
      for (let i = 0; i < 7; i++) {
        useNotificationStore.getState().addNotification({
          type: 'info',
          message: `通知 ${i}`,
          autoClose: false,
          duration: 5000,
        })
      }
    })
    expect(useNotificationStore.getState().notifications).toHaveLength(5)
  })

  it('clearAll 清空所有通知和未读计数', () => {
    act(() => {
      useNotificationStore.getState().addNotification({ type: 'warning', message: 'x', autoClose: false, duration: 5000 })
    })
    act(() => { useNotificationStore.getState().clearAll() })
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
    expect(useNotificationStore.getState().unreadCount).toBe(0)
  })

  it('markAllRead 将未读计数归零', () => {
    act(() => {
      useNotificationStore.getState().addNotification({ type: 'error', message: 'err', autoClose: false, duration: 5000 })
      useNotificationStore.getState().addNotification({ type: 'error', message: 'err2', autoClose: false, duration: 5000 })
    })
    expect(useNotificationStore.getState().unreadCount).toBe(2)
    act(() => { useNotificationStore.getState().markAllRead() })
    expect(useNotificationStore.getState().unreadCount).toBe(0)
  })
})
