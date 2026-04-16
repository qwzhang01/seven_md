import { ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

interface BreadcrumbProps {
  folderPath: string | null
  filePath: string | null
}

export function Breadcrumb({ folderPath, filePath }: BreadcrumbProps) {
  const segments = useMemo(() => {
    if (!filePath || !folderPath) return []

    // Get relative path from folder to file
    const relativePath = filePath.replace(folderPath, '').split('/').filter(Boolean)
    const folderName = folderPath.split('/').pop() || ''
    
    return [
      { name: folderName, path: folderPath, type: 'folder' as const },
      ...relativePath.slice(0, -1).map((segment, index, arr) => ({
        name: segment,
        path: folderPath + '/' + arr.slice(0, index + 1).join('/'),
        type: 'folder' as const
      })),
      { name: relativePath[relativePath.length - 1], path: filePath, type: 'file' as const }
    ]
  }, [folderPath, filePath])

  if (segments.length === 0) {
    return null
  }

  // Truncate if too long
  const displaySegments = segments.length > 4
    ? [segments[0], { name: '...', path: '', type: 'ellipsis' as const }, ...segments.slice(-2)]
    : segments

  return (
    <div className="flex items-center gap-1 text-sm">
      {displaySegments.map((segment, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-400" />
          )}
          <button
            className={`
              px-1.5 py-0.5 rounded
              ${segment.type === 'ellipsis' 
                ? 'text-gray-500 dark:text-gray-300 cursor-default' 
                : segment.type === 'file'
                  ? 'text-gray-900 dark:text-gray-50 font-medium cursor-default'
                  : 'text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
              }
            `}
            title={segment.type === 'ellipsis' ? segments.map(s => s.name).join(' / ') : segment.path}
            disabled={segment.type === 'file' || segment.type === 'ellipsis'}
          >
            {segment.name}
          </button>
        </div>
      ))}
    </div>
  )
}
