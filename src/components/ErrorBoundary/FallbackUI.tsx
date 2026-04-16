import { ErrorInfo, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import './FallbackUI.css'

/**
 * FallbackUI component props
 */
interface FallbackUIProps {
  /** The error that was caught */
  error: Error
  /** Error info containing component stack */
  errorInfo: ErrorInfo | null
  /** Name of the error boundary */
  boundaryName: string
  /** Callback when user clicks retry */
  onRetry: () => void
  /** Callback when user clicks reload */
  onReload: () => void
}

/**
 * Fallback UI component displayed when an error is caught
 * 
 * Displays user-friendly error message with:
 * - Error description
 * - Retry button to attempt recovery
 * - Reload application button
 * - Detailed error info in development mode
 */
export function FallbackUI({
  error,
  errorInfo,
  boundaryName,
  onRetry,
  onReload,
}: FallbackUIProps): ReactNode {
  const isDev = import.meta.env.DEV
  const { t } = useTranslation()

  return (
    <div className="fallback-ui" role="alert" aria-live="assertive">
      <div className="fallback-ui__content">
        {/* Error Icon */}
        <div className="fallback-ui__icon" aria-hidden="true">
          ⚠️
        </div>

        {/* Error Title */}
        <h2 className="fallback-ui__title">
          {t('errorBoundary.title')}
        </h2>

        {/* Error Message */}
        <p className="fallback-ui__message">
          {isDev ? error.message : t('errorBoundary.unexpectedError')}
        </p>

        {/* Boundary Info (development only) */}
        {isDev && (
          <p className="fallback-ui__boundary">
            {t('errorBoundary.caughtBy')}: <code>{boundaryName}</code> {t('errorBoundary.boundary')}
          </p>
        )}

        {/* Action Buttons */}
        <div className="fallback-ui__actions">
          <button
            className="fallback-ui__button fallback-ui__button--primary"
            onClick={onRetry}
            type="button"
            aria-label={t('errorBoundary.retryAriaLabel')}
          >
            {t('errorBoundary.tryAgain')}
          </button>
          <button
            className="fallback-ui__button fallback-ui__button--secondary"
            onClick={onReload}
            type="button"
            aria-label={t('errorBoundary.reloadAriaLabel')}
          >
            {t('errorBoundary.reloadApplication')}
          </button>
        </div>

        {/* Detailed Error Info (development only) */}
        {isDev && errorInfo && (
          <details className="fallback-ui__details">
            <summary className="fallback-ui__summary">
              {t('errorBoundary.viewErrorDetails')}
            </summary>
            <div className="fallback-ui__error-info">
              <div className="fallback-ui__error-section">
                <h3 className="fallback-ui__error-heading">{t('errorBoundary.errorMessage')}</h3>
                <pre className="fallback-ui__error-text">{error.message}</pre>
              </div>

              <div className="fallback-ui__error-section">
                <h3 className="fallback-ui__error-heading">{t('errorBoundary.stackTrace')}</h3>
                <pre className="fallback-ui__error-text">{error.stack}</pre>
              </div>

              <div className="fallback-ui__error-section">
                <h3 className="fallback-ui__error-heading">{t('errorBoundary.componentStack')}</h3>
                <pre className="fallback-ui__error-text">
                  {errorInfo.componentStack}
                </pre>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
