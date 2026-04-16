import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'
import '../../i18n/config'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Suppress console.error for cleaner test output
const originalError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalError
})

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary boundaryName="Test">
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should catch errors and display fallback UI', () => {
    render(
      <ErrorBoundary boundaryName="Test">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    // In development mode, error message is shown in multiple places
    const errorMessages = screen.getAllByText('Test error')
    expect(errorMessages.length).toBeGreaterThan(0)
  })

  it('should display error message in development mode', () => {
    // Mock development mode
    vi.stubEnv('DEV', true)

    render(
      <ErrorBoundary boundaryName="Test">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Should show error message in message paragraph
    const errorMessages = screen.getAllByText('Test error')
    expect(errorMessages.length).toBeGreaterThan(0)
  })

  it('should display retry and reload buttons', () => {
    render(
      <ErrorBoundary boundaryName="Test">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Reload Application')).toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', () => {
    render(
      <ErrorBoundary boundaryName="Test">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)

    // After clicking retry, the error state should be reset
    // Since ThrowError still throws, it should show error UI again
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should attempt to reload when reload button is clicked', () => {
    // Mock window.location.reload
    const mockReload = vi.fn()
    const originalLocation = window.location
    
    // Delete and redefine window.location
    // @ts-ignore
    delete window.location
    window.location = { ...originalLocation, reload: mockReload }

    render(
      <ErrorBoundary boundaryName="Test">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByText('Reload Application')
    fireEvent.click(reloadButton)

    expect(mockReload).toHaveBeenCalled()

    // Restore original location
    window.location = originalLocation
  })

  it('should display boundary name in development mode', () => {
    vi.stubEnv('DEV', true)

    render(
      <ErrorBoundary boundaryName="TestBoundary">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Caught by/)).toBeInTheDocument()
    expect(screen.getByText('TestBoundary')).toBeInTheDocument()
  })

  it('should log error details to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')

    render(
      <ErrorBoundary boundaryName="Test">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(consoleErrorSpy).toHaveBeenCalled()
    // Check that error was logged (the exact format depends on implementation)
    expect(consoleErrorSpy.mock.calls.length).toBeGreaterThan(0)
  })

  it('should use custom fallback if provided', () => {
    const customFallback = (error: Error) => (
      <div>Custom error: {error.message}</div>
    )

    render(
      <ErrorBoundary boundaryName="Test" fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error: Test error')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <ErrorBoundary boundaryName="Test">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })
})

describe('ErrorBoundary recovery', () => {
  it('should reset error state when retry is clicked', () => {
    // Create a component with controlled error state
    let shouldThrow = true
    
    const ControlledComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>No error</div>
    }
    
    const { rerender } = render(
      <ErrorBoundary boundaryName="Test">
        <ControlledComponent />
      </ErrorBoundary>
    )

    // Error UI should be shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Change the condition before clicking retry
    shouldThrow = false
    
    // Click retry button - this resets the error state
    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)

    // After retry, the component should render normally since shouldThrow is now false
    expect(screen.getByText('No error')).toBeInTheDocument()
  })
  
  it('should allow recovery after error boundary reset', () => {
    render(
      <ErrorBoundary boundaryName="Test">
        <div>Normal content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })
})
