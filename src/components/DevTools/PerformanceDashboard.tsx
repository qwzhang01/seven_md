import React, { useState, useEffect, useCallback } from 'react'
import { createLogger } from '../../utils/logger'
import { getAllPerformanceMetrics, clearAllPerformanceMetrics } from '../../hooks/usePerformanceMonitor'
import { 
  getAllTimingResults, 
  clearTimingResults, 
  getAverageTiming,
  getSlowOperations 
} from '../../hooks/useFileOperationTiming'
import { 
  getMemoryHistory, 
  clearMemoryHistory, 
  formatMemoryMB,
  getMemoryUsage,
  isMemoryApiAvailable 
} from '../../utils/memoryMonitor'

const logger = createLogger('PerformanceDashboard')

interface PerformanceDashboardProps {
  isOpen: boolean
  onClose: () => void
}

interface PerformanceStats {
  renderMetrics: ReturnType<typeof getAllPerformanceMetrics>
  fileTimings: ReturnType<typeof getAllTimingResults>
  memoryInfo: ReturnType<typeof getMemoryUsage>
  memoryHistory: ReturnType<typeof getMemoryHistory>
  averageTimings: {
    readFile: number
    writeFile: number
    readDirectory: number
  }
  slowOperations: ReturnType<typeof getSlowOperations>
}

/**
 * Performance Dashboard - Development only
 * Displays real-time performance metrics
 */
export function PerformanceDashboard({ isOpen, onClose }: PerformanceDashboardProps) {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(1000)

  const refreshStats = useCallback(() => {
    setStats({
      renderMetrics: getAllPerformanceMetrics(),
      fileTimings: getAllTimingResults(),
      memoryInfo: getMemoryUsage(),
      memoryHistory: getMemoryHistory(),
      averageTimings: {
        readFile: getAverageTiming('readFile'),
        writeFile: getAverageTiming('writeFile'),
        readDirectory: getAverageTiming('readDirectory'),
      },
      slowOperations: getSlowOperations(),
    })
  }, [])

  useEffect(() => {
    if (!isOpen || !autoRefresh) return

    refreshStats()
    const interval = setInterval(refreshStats, refreshInterval)
    return () => clearInterval(interval)
  }, [isOpen, autoRefresh, refreshInterval, refreshStats])

  const handleClearAll = () => {
    clearAllPerformanceMetrics()
    clearTimingResults()
    clearMemoryHistory()
    refreshStats()
    logger.info('Performance metrics cleared')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[800px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Dashboard
          </h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            <button
              onClick={refreshStats}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          {!stats ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Memory Usage */}
              <section>
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Memory Usage
                </h3>
                {isMemoryApiAvailable() && stats.memoryInfo ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Used</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatMemoryMB(stats.memoryInfo.usedJSHeapSize)}
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatMemoryMB(stats.memoryInfo.totalJSHeapSize)}
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Limit</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatMemoryMB(stats.memoryInfo.jsHeapSizeLimit)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Memory API not available in this environment
                  </div>
                )}
              </section>

              {/* Render Performance */}
              <section>
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Render Performance ({stats.renderMetrics.length} components)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 dark:text-gray-400">
                        <th className="px-2 py-1">Component</th>
                        <th className="px-2 py-1">Renders</th>
                        <th className="px-2 py-1">Avg Time</th>
                        <th className="px-2 py-1">Slow</th>
                        <th className="px-2 py-1">Last Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.renderMetrics.slice(0, 10).map((metric, i) => (
                        <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-2 py-1 text-gray-900 dark:text-white">
                            {metric.componentName}
                          </td>
                          <td className="px-2 py-1 text-gray-600 dark:text-gray-300">
                            {metric.renderCount}
                          </td>
                          <td className={`px-2 py-1 ${metric.avgRenderTime > 16 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {metric.avgRenderTime.toFixed(2)}ms
                          </td>
                          <td className={`px-2 py-1 ${metric.slowRenders > 0 ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}>
                            {metric.slowRenders}
                          </td>
                          <td className="px-2 py-1 text-gray-600 dark:text-gray-300">
                            {metric.lastRenderTime.toFixed(2)}ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* File Operations */}
              <section>
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  File Operations
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Read Avg</div>
                    <div className={`text-lg font-bold ${stats.averageTimings.readFile > 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {stats.averageTimings.readFile.toFixed(2)}ms
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Write Avg</div>
                    <div className={`text-lg font-bold ${stats.averageTimings.writeFile > 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {stats.averageTimings.writeFile.toFixed(2)}ms
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Dir Read Avg</div>
                    <div className={`text-lg font-bold ${stats.averageTimings.readDirectory > 200 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {stats.averageTimings.readDirectory.toFixed(2)}ms
                    </div>
                  </div>
                </div>
              </section>

              {/* Slow Operations */}
              <section>
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Slow Operations ({stats.slowOperations.length})
                </h3>
                {stats.slowOperations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 dark:text-gray-400">
                          <th className="px-2 py-1">Operation</th>
                          <th className="px-2 py-1">Duration</th>
                          <th className="px-2 py-1">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.slowOperations.slice(0, 10).map((op, i) => (
                          <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                            <td className="px-2 py-1 text-gray-900 dark:text-white">
                              {op.operation}
                            </td>
                            <td className="px-2 py-1 text-yellow-600">
                              {op.duration.toFixed(2)}ms
                            </td>
                            <td className={`px-2 py-1 ${op.success ? 'text-green-600' : 'text-red-600'}`}>
                              {op.success ? 'Success' : 'Failed'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No slow operations detected
                  </div>
                )}
              </section>

              {/* Recent File Operations */}
              <section>
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Recent File Operations ({stats.fileTimings.length})
                </h3>
                <div className="overflow-x-auto max-h-40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 dark:text-gray-400">
                        <th className="px-2 py-1">Operation</th>
                        <th className="px-2 py-1">Duration</th>
                        <th className="px-2 py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.fileTimings.slice(-10).reverse().map((timing, i) => (
                        <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-2 py-1 text-gray-900 dark:text-white">
                            {timing.operation}
                          </td>
                          <td className={`px-2 py-1 ${timing.duration > 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {timing.duration.toFixed(2)}ms
                          </td>
                          <td className={`px-2 py-1 ${timing.success ? 'text-green-600' : 'text-red-600'}`}>
                            {timing.success ? 'Success' : timing.error || 'Failed'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Dev Tools Button - Toggle for Performance Dashboard
 */
export function DevToolsButton({ onClick }: { onClick: () => void }) {
  if (import.meta.env.PROD) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 w-10 h-10 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 z-40 flex items-center justify-center"
      title="Performance Dashboard"
    >
      ⚡
    </button>
  )
}
