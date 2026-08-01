import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '../../components/modal/ConfirmDialog'

const defaultProps = {
  open: true,
  title: '确认操作',
  message: '确定要删除这个文件吗？',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}

describe('ConfirmDialog', () => {
  it('渲染 title 和 message', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('确认操作')).toBeInTheDocument()
    expect(screen.getByText('确定要删除这个文件吗？')).toBeInTheDocument()
  })

  it('默认按钮文案为 确认 / 取消', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('确定')).toBeInTheDocument()
    expect(screen.getByText('取消')).toBeInTheDocument()
  })

  it('支持自定义按钮文案', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="删除"
        cancelLabel="保留"
      />,
    )
    expect(screen.getByText('删除')).toBeInTheDocument()
    expect(screen.getByText('保留')).toBeInTheDocument()
  })

  it('点击确认按钮调用 onConfirm', () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByText('确定'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('点击取消按钮调用 onCancel', () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('取消'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('open=false 时不渲染', () => {
    const { container } = render(
      <ConfirmDialog {...defaultProps} open={false} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('danger=true 时确认按钮使用错误色', () => {
    render(<ConfirmDialog {...defaultProps} danger={true} />)
    const confirmBtn = screen.getByText('确定')
    expect(confirmBtn.style.background).toContain('var(--error-color')
  })
})
