import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import InlineInput from '../../components/FileTree/InlineInput'

describe('InlineInput', () => {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders an input element', () => {
    render(<InlineInput onConfirm={onConfirm} onCancel={onCancel} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('pre-fills with defaultValue', () => {
    render(<InlineInput defaultValue="hello.md" onConfirm={onConfirm} onCancel={onCancel} />)
    expect(screen.getByRole('textbox')).toHaveValue('hello.md')
  })

  it('shows placeholder', () => {
    render(<InlineInput placeholder="File name" onConfirm={onConfirm} onCancel={onCancel} />)
    expect(screen.getByPlaceholderText('File name')).toBeInTheDocument()
  })

  it('calls onConfirm with input value on Enter', () => {
    render(<InlineInput defaultValue="test.md" onConfirm={onConfirm} onCancel={onCancel} />)
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onConfirm).toHaveBeenCalledWith('test.md')
  })

  it('calls onCancel on Escape', () => {
    render(<InlineInput onConfirm={onConfirm} onCancel={onCancel} />)
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onCancel on blur', () => {
    render(<InlineInput onConfirm={onConfirm} onCancel={onCancel} />)
    const input = screen.getByRole('textbox')
    fireEvent.blur(input)
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows error message when error prop is set', () => {
    render(
      <InlineInput
        onConfirm={onConfirm}
        onCancel={onCancel}
        error="Name cannot be empty"
      />
    )
    expect(screen.getByText('Name cannot be empty')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies error border class when error is set', () => {
    const { container } = render(
      <InlineInput onConfirm={onConfirm} onCancel={onCancel} error="Error" />
    )
    const input = container.querySelector('input')
    expect(input?.className).toContain('border-red')
  })

  it('does not show error element when no error', () => {
    render(<InlineInput onConfirm={onConfirm} onCancel={onCancel} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
