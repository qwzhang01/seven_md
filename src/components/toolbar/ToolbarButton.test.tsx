import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToolbarButton } from './ToolbarButton'

describe('ToolbarButton', () => {
  it('渲染按钮并设置 aria-label', () => {
    render(<ToolbarButton tooltip="加粗" onClick={vi.fn()} />)
    expect(screen.getByLabelText('加粗')).toBeInTheDocument()
  })

  it('点击调用 onClick', () => {
    const onClick = vi.fn()
    render(<ToolbarButton tooltip="加粗" onClick={onClick} />)
    fireEvent.click(screen.getByLabelText('加粗'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 时不调用 onClick', () => {
    const onClick = vi.fn()
    render(<ToolbarButton tooltip="加粗" disabled onClick={onClick} />)
    fireEvent.click(screen.getByLabelText('加粗'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('active 状态应用激活样式', () => {
    const { container } = render(<ToolbarButton tooltip="加粗" active onClick={vi.fn()} />)
    const btn = container.querySelector('button')!
    expect(btn.className).toContain('bg-[var(--bg-active)]')
  })

  it('title 属性包含 shortcut', () => {
    render(<ToolbarButton tooltip="加粗" shortcut="Ctrl+B" onClick={vi.fn()} />)
    expect(screen.getByLabelText('加粗').getAttribute('title')).toBe('加粗 (Ctrl+B)')
  })

  it('hover 时显示 tooltip 文本', () => {
    render(<ToolbarButton tooltip="加粗" shortcut="Ctrl+B" onClick={vi.fn()} />)
    const btn = screen.getByLabelText('加粗')
    fireEvent.mouseEnter(btn)
    expect(screen.getByText('加粗')).toBeInTheDocument()
    expect(screen.getByText('Ctrl+B')).toBeInTheDocument()
  })

  it('disabled 时不显示 tooltip', () => {
    render(<ToolbarButton tooltip="加粗" disabled onClick={vi.fn()} />)
    const btn = screen.getByLabelText('加粗')
    fireEvent.mouseEnter(btn)
    // tooltip 容器不存在（按钮 disabled 时 showTooltip 不会为 true）
    expect(containerTooltip()).toBeNull()
  })

  it('渲染 icon 和 label 内容', () => {
    render(
      <ToolbarButton
        tooltip="导出"
        icon={<span data-testid="icon">I</span>}
        label="导出"
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('导出')).toBeInTheDocument()
  })
})

function containerTooltip(): HTMLElement | null {
  return document.querySelector('.pointer-events-none')
}
