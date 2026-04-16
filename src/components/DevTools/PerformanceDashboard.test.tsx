import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PerformanceDashboard, DevToolsButton } from './PerformanceDashboard'

// Mock all the imported modules
vi.mock('../../hooks/usePerformanceMonitor', () => ({
  getAllPerformanceMetrics: () => [
    { componentName: 'TestComponent', renderCount: 5, avgRenderTime: 12.5, slowRenders: 0, lastRenderTime: 10 },
  ],
  clearAllPerformanceMetrics: vi.fn(),
}))

vi.mock('../../hooks/useFileOperationTiming', () => ({
  getAllTimingResults: () => [
    { operation: 'readFile', duration: 50, success: true, timestamp: Date.now() },
  ],
  clearTimingResults: vi.fn(),
  getAverageTiming: () => 50,
  getSlowOperations: () => [],
}))

vi.mock('../../utils/memoryMonitor', () => ({
  getMemoryUsage: () => ({
    usedJSHeapSize: 50 * 1024 * 1024,
    totalJSHeapSize: 100 * 1024 * 1024,
    jsHeapSizeLimit: 500 * 1024 * 1024,
    timestamp: Date.now(),
  }),
  getMemoryHistory: () => [],
  clearMemoryHistory: vi.fn(),
  formatMemoryMB: (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`,
  isMemoryApiAvailable: () => true,
}))

vi.mock('../../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('PerformanceDashboard', () => {
  it('does not render when closed', () => {
    render(<PerformanceDashboard isOpen={false} onClose={() => {}} />)
    expect(screen.queryByText('Performance Dashboard')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(<PerformanceDashboard isOpen={true} onClose={() => {}} />)
    expect(screen.getByText('Performance Dashboard')).toBeInTheDocument()
  })

  it('displays memory usage section', () => {
    render(<PerformanceDashboard isOpen={true} onClose={() => {}} />)
    expect(screen.getByText('Memory Usage')).toBeInTheDocument()
  })

  it('displays render performance section', () => {
    render(<PerformanceDashboard isOpen={true} onClose={() => {}} />)
    expect(screen.getByText(/Render Performance/)).toBeInTheDocument()
  })

  it('displays file operations section', () => {
    render(<PerformanceDashboard isOpen={true} onClose={() => {}} />)
    expect(screen.getByText('File Operations')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<PerformanceDashboard isOpen={true} onClose={onClose} />)
    
    fireEvent.click(screen.getByText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('toggles auto-refresh checkbox', () => {
    render(<PerformanceDashboard isOpen={true} onClose={() => {}} />)
    
    const checkbox = screen.getByLabelText('Auto-refresh')
    expect(checkbox).toBeChecked()
    
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('has refresh and clear buttons', () => {
    render(<PerformanceDashboard isOpen={true} onClose={() => {}} />)
    
    expect(screen.getByText('Refresh')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })
})

describe('DevToolsButton', () => {
  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<DevToolsButton onClick={onClick} />)
    
    const button = screen.getByTitle('Performance Dashboard')
    fireEvent.click(button)
    
    expect(onClick).toHaveBeenCalled()
  })
})
