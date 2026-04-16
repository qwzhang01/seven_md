import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MenuSeparator } from './MenuSeparator'

describe('MenuSeparator', () => {
  it('should render separator element', () => {
    render(<MenuSeparator />)

    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('should have correct CSS classes', () => {
    render(<MenuSeparator />)

    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('my-1', 'h-px', 'bg-[--border-color]')
  })

  it('should be a div element', () => {
    const { container } = render(<MenuSeparator />)

    expect(container.querySelector('div')).toBeInTheDocument()
  })
})
