import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../../components/modal-v2/Modal'

describe('Modal', () => {
  it('open=false 时不渲染', () => {
    const { container } = render(
      <Modal open={false} title="标题">
        <p>内容</p>
      </Modal>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('open=true 时渲染 title 和 children', () => {
    render(
      <Modal open={true} title="对话框标题">
        <p>对话框内容</p>
      </Modal>,
    )
    expect(screen.getByText('对话框标题')).toBeInTheDocument()
    expect(screen.getByText('对话框内容')).toBeInTheDocument()
  })

  it('渲染 footer', () => {
    render(
      <Modal open={true} title="标题" footer={<button>确定</button>}>
        <p>内容</p>
      </Modal>,
    )
    expect(screen.getByText('确定')).toBeInTheDocument()
  })

  it('closable 时 ESC 调用 onClose', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} title="标题" closable={true} onClose={onClose}>
        <p>内容</p>
      </Modal>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closable=false 时 ESC 不调用 onClose', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} title="标题" closable={false} onClose={onClose}>
        <p>内容</p>
      </Modal>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closable 时点击遮罩调用 onClose', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open={true} title="标题" closable={true} onClose={onClose}>
        <p>内容</p>
      </Modal>,
    )
    // 外层遮罩 div 是 container.firstChild
    const overlay = container.firstChild as HTMLElement
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closable=false 时点击遮罩不调用 onClose', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal open={true} title="标题" closable={false} onClose={onClose}>
        <p>内容</p>
      </Modal>,
    )
    const overlay = container.firstChild as HTMLElement
    fireEvent.click(overlay)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('设置 dialog role 和 aria-modal', () => {
    render(
      <Modal open={true} title="标题">
        <p>内容</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})
