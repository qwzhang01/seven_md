import { useEffect, useId, useRef, useState } from 'react'

interface MermaidBlockProps {
  code: string
  theme: 'default' | 'dark'
}

export function MermaidBlock({ code, theme }: MermaidBlockProps) {
  const id = useId().replace(/:/g, '-')
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function render() {
      setLoading(true)
      setError(null)
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: 'loose',
        })
        const { svg } = await mermaid.render(`mermaid-${id}`, code)
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          // Make SVG responsive
          const svgEl = containerRef.current.querySelector('svg')
          if (svgEl) {
            svgEl.style.maxWidth = '100%'
            svgEl.style.height = 'auto'
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
          if (containerRef.current) containerRef.current.innerHTML = ''
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    render()
    return () => { cancelled = true }
  }, [code, theme, id])

  if (error) {
    return (
      <div
        style={{
          border: '1px solid var(--color-error, #f85149)',
          borderLeft: '4px solid var(--color-error, #f85149)',
          background: 'var(--bg-error, rgba(248,81,73,0.08))',
          borderRadius: '4px',
          padding: '10px 14px',
          margin: '0.5em 0',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '12px',
          color: 'var(--color-error, #f85149)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        <strong>Mermaid error:</strong> {error}
      </div>
    )
  }

  return (
    <div style={{ margin: '0.5em 0', textAlign: 'center' }}>
      {loading && (
        <pre
          style={{
            background: 'var(--bg-tertiary)',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            textAlign: 'left',
          }}
        >
          {code}
        </pre>
      )}
      <div ref={containerRef} style={{ display: loading ? 'none' : 'block' }} />
    </div>
  )
}
