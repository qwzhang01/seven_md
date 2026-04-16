import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuItem } from './MenuItem'

describe('MenuItem', () => {
  it('should render label', () => {
    render(<MenuItem label="Save" />)

    expect(screen.getByRole('menuitem')).toHaveTextContent('Save')
  })

  it('should render shortcut if provided', () => {
    render(<MenuItem label="Save" shortcut="⌘S" />)

    expect(screen.getByText('⌘S')).toBeInTheDocument()
  })

  it('should render icon if provided', () => {
    const Icon = () => <span data-testid="icon">💾</span>
    render(<MenuItem label="Save" icon={<Icon />} />)

    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<MenuItem label="Save" onClick={onClick} />)

    await user.click(screen.getByRole('menuitem'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should call onClick when Enter key is pressed', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<MenuItem label="Save" onClick={onClick} />)

    const item = screen.getByRole('menuitem')
    item.focus()
    await user.keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should call onClick when Space key is pressed', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<MenuItem label="Save" onClick={onClick} />)

    const item = screen.getByRole('menuitem')
    item.focus()
    await user.keyboard(' ')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<MenuItem label="Save" onClick={onClick} disabled />)

    await user.click(screen.getByRole('menuitem'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('should have disabled attribute when disabled', () => {
    render(<MenuItem label="Save" disabled />)

    expect(screen.getByRole('menuitem')).toBeDisabled()
  })

  it('should have tabIndex -1 when disabled', () => {
    render(<MenuItem label="Save" disabled />)

    expect(screen.getByRole('menuitem')).toHaveAttribute('tabIndex', '-1')
  })

  it('should have tabIndex 0 when not disabled', () => {
    render(<MenuItem label="Save" />)

    expect(screen.getByRole('menuitem')).toHaveAttribute('tabIndex', '0')
  })

  it('should apply disabled styles when disabled', () => {
    render(<MenuItem label="Save" disabled />)

    const item = screen.getByRole('menuitem')
    expect(item).toHaveClass('text-[--text-tertiary]', 'cursor-not-allowed')
  })

  it('should apply hover styles when not disabled', () => {
    render(<MenuItem label="Save" />)

    const item = screen.getByRole('menuitem')
    expect(item).toHaveClass('hover:bg-accent/10', 'hover:text-accent')
  })

  it('should have focus styles', () => {
    render(<MenuItem label="Save" />)

    const item = screen.getByRole('menuitem')
    expect(item).toHaveClass('focus:bg-accent/10', 'focus:text-accent')
  })
})
