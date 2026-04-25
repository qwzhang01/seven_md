import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { NotificationItem } from '../../components/notification-v2/NotificationItem'
import { useNotificationStore } from '../../stores'
import type { Notification } from '../../stores'

function makeNotif(overrides?: Partial<Notification>): Notification {
  return {
    id: 'test-notif',
    type: 'success',
    message: '操作成功',
    autoClose: false,
    duration: 5000,
    createdAt: Date.now(),
    ...overrides,
  }
}

describe('NotificationItem', () => {
  afterEach(() => {
    act(() => useNotificationStore.setState({ notifications: [], unreadCount: 0 }))
  })

  it('渲染通知消息', () => {
    render(<NotificationItem notification={makeNotif()} />)
    expect(screen.getByText('操作成功')).toBeInTheDocument()
  })

  it('渲染关闭按钮', () => {
    render(<NotificationItem notification={makeNotif()} />)
    expect(screen.getByLabelText('关闭')).toBeInTheDocument()
  })

  it('success 类型有绿色边框', () => {
    const { container } = render(<NotificationItem notification={makeNotif({ type: 'success' })} />)
    const el = container.firstChild as HTMLElement
    // 确认 borderLeft 包含 success 颜色变量
    expect(el.style.borderLeft).toContain('var(--success-color')
  })

  it('error 类型有红色边框', () => {
    const { container } = render(<NotificationItem notification={makeNotif({ type: 'error' })} />)
    const el = container.firstChild as HTMLElement
    expect(el.style.borderLeft).toContain('var(--error-color')
  })

  it('点击关闭按钮调用 removeNotification', () => {
    act(() => {
      useNotificationStore.setState({
        notifications: [makeNotif()],
        unreadCount: 1,
      })
    })
    render(<NotificationItem notification={makeNotif()} />)
    fireEvent.click(screen.getByLabelText('关闭'))
    // 给动画时间后检查
    setTimeout(() => {
      expect(useNotificationStore.getState().notifications).toHaveLength(0)
    }, 400)
  })

  it('autoClose=true 时 5 秒后自动关闭', () => {
    vi.useFakeTimers()
    act(() => {
      useNotificationStore.setState({
        notifications: [makeNotif({ id: 'auto', autoClose: true, duration: 5000 })],
        unreadCount: 1,
      })
    })
    render(<NotificationItem notification={makeNotif({ id: 'auto', autoClose: true, duration: 5000 })} />)
    act(() => vi.advanceTimersByTime(5500))
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
    vi.useRealTimers()
  })
})
