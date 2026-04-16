import { Component, ErrorInfo, ReactNode } from 'react'
import { FallbackUI } from './FallbackUI'
import { createLogger } from '../../utils/logger'

const logger = createLogger('ErrorBoundary')

/**
 * Error boundary component props
 */
interface ErrorBoundaryProps {
  children: ReactNode
  /** Name of the boundary level for logging */
  boundaryName?: string
  /** Custom fallback UI component */
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode
}

/**
 * Error boundary component state
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary component for catching React errors
 * 
 * Implements multi-level error boundaries as specified in the design:
 * - Global: Catches errors at the root level
 * - Sidebar: Catches errors in sidebar components
 * - MainContent: Catches errors in editor/preview components
 * 
 * @example
 * ```tsx
 * <ErrorBoundary boundaryName="Global">
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  /**
   * Static method to update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  /**
   * Lifecycle method called when an error is caught
   * Logs the error with detailed context
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { boundaryName = 'Unknown' } = this.props

    // Update state with error info
    this.setState({ errorInfo })

    // Log error details
    const errorLog = {
      timestamp: new Date().toISOString(),
      boundary: boundaryName,
      error: {
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
    }

    // Log using logger
    logger.error('[ErrorBoundary]', errorLog)

    // In development, show detailed error info
    if (import.meta.env.DEV) {
      logger.error(`Error caught by ${boundaryName} boundary`, {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  /**
   * Retry handler - resets error state to attempt re-render
   */
  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  /**
   * Reload handler - reloads the entire application window
   */
  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback, boundaryName = 'Unknown' } = this.props

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo!, this.handleRetry)
      }

      // Use default fallback UI
      return (
        <FallbackUI
          error={error}
          errorInfo={errorInfo}
          boundaryName={boundaryName}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      )
    }

    return children
  }
}
