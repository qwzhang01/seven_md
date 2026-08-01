import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { NotificationContainer } from '../../components/notification-v2/NotificationContainer'
import { useNotificationStore } from '../../stores'
import type { Notification } from '../../stores'

function makeNotif(overrides?: Partial<Notification>): Notification {
  return {
    id: 'n-1',
    type: 'info',
    message: '通知内容',
    autoClose: false,
    duration: 5000,
    createdAt: Date.now(),
    ...overrides,
  }
}

describe('NotificationContainer', () => {
  afterEach(() => {
    act(() => useNotificationStore.setState({ notifications: [], unreadCount: 0 }))
  })

  it('空通知时不渲染通知项', () => {
    render(<NotificationContainer />)
    // 容器存在，但无通知消息文本
    const container = screen.getByLabelText('通知')
    expect(container.children).toHaveLength(0)
  })

  it('渲染通知列表', () => {
    act(() => {
      useNotificationStore.setState({
        notifications: [
          makeNotif({ id: 'a', message: '第一条' }),
          makeNotif({ id: 'b', message: '第二条' }),
        ],
        unreadCount: 2,
      })
    })
    render(<NotificationContainer />)
    expect(screen.getByText('第一条')).toBeInTheDocument()
    expect(screen.getByText('第二条')).toBeInTheDocument()
  })

  it('通知按倒序显示（最新在前）', () => {
    act(() => {
      useNotificationStore.setState({
        notifications: [
          makeNotif({ id: 'old', message: '旧通知' }),
          makeNotif({ id: 'new', message: '新通知' }),
        ],
        unreadCount: 2,
      })
    })
    const { container } = render(<NotificationContainer />)
    // 容器子节点为 NotificationItem，reverse 后第一个应为"新通知"
    const items = container.querySelectorAll('[aria-label="通知"] > *')
    expect(items[0].textContent).toContain('新通知')
    expect(items[1].textContent).toContain('旧通知')
  })

  it('容器设置 aria-live=polite', () => {
    render(<NotificationContainer />)
    expect(screen.getByLabelText('通知')).toHaveAttribute('aria-live', 'polite')
  })

  it('容器有 aria-label', () => {
    render(<NotificationContainer />)
    expect(screen.getByLabelText('通知')).toHaveAttribute('aria-label', '通知')
  })
})
