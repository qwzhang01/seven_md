import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TabItem } from '../../components/titlebar-v2/TabItem'

const defaultProps = {
  id: 'tab-1',
  name: 'readme.md',
  isDirty: false,
  isActive: false,
  index: 0,
  onActivate: vi.fn(),
  onClose: vi.fn(),
  onDragStart: vi.fn(),
  onDragOver: vi.fn(),
  onDrop: vi.fn(),
  onDragEnd: vi.fn(),
}

describe('TabItem', () => {
  it('渲染文件名', () => {
    render(<TabItem {...defaultProps} />)
    expect(screen.getByText('readme.md')).toBeInTheDocument()
  })

  it('isDirty=true 时显示修改指示点', () => {
    const { container } = render(<TabItem {...defaultProps} isDirty={true} />)
    // 蓝色圆点是一个 rounded-full 的 span
    const dot = container.querySelector('span.rounded-full')
    expect(dot).toBeInTheDocument()
  })

  it('点击时调用 onActivate', () => {
    const onActivate = vi.fn()
    render(<TabItem {...defaultProps} onActivate={onActivate} />)
    fireEvent.click(screen.getByText('readme.md'))
    expect(onActivate).toHaveBeenCalledWith('tab-1')
  })

  it('isActive=true 时有顶部 accent 边框', () => {
    const { container } = render(<TabItem {...defaultProps} isActive={true} />)
    const accentBar = container.querySelector('.absolute.top-0')
    expect(accentBar).toBeInTheDocument()
  })

  it('hover 时显示关闭按钮', () => {
    render(<TabItem {...defaultProps} />)
    const tab = screen.getByRole('tab')
    fireEvent.mouseEnter(tab)
    const closeBtn = screen.getByLabelText('关闭 readme.md')
    expect(closeBtn).toBeInTheDocument()
  })

  it('点击关闭按钮调用 onClose', () => {
    const onClose = vi.fn()
    render(<TabItem {...defaultProps} onClose={onClose} />)
    const tab = screen.getByRole('tab')
    fireEvent.mouseEnter(tab)
    const closeBtn = screen.getByLabelText('关闭 readme.md')
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledWith('tab-1')
  })

  it('支持拖拽属性 draggable', () => {
    const { container } = render(<TabItem {...defaultProps} />)
    const el = container.firstChild as HTMLElement
    expect(el.getAttribute('draggable')).toBe('true')
  })
})
