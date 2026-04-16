import { useState, useEffect, useRef, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { SearchResult, TextSearchResult, SearchResponse, SearchType } from '../types'

export interface UseFileSearchReturn {
  query: string
  setQuery: (q: string) => void
  searchType: SearchType
  setSearchType: (t: SearchType) => void
  fileResults: SearchResult[]
  textResults: TextSearchResult[]
  isLoading: boolean
  error: string | null
  truncated: boolean
}

export function useFileSearch(folderPath: string | null): UseFileSearchReturn {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('filename')
  const [fileResults, setFileResults] = useState<SearchResult[]>([])
  const [textResults, setTextResults] = useState<TextSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [truncated, setTruncated] = useState(false)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback(
    async (q: string, type: SearchType) => {
      if (!folderPath || q.trim().length === 0) {
        setFileResults([])
        setTextResults([])
        setTruncated(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await invoke<SearchResponse>('search_in_files', {
          folderPath,
          query: q,
          searchType: type,
        })
        setFileResults(response.fileResults)
        setTextResults(response.textResults)
        setTruncated(response.truncated)
      } catch (err) {
        setError(String(err))
        setFileResults([])
        setTextResults([])
        setTruncated(false)
      } finally {
        setIsLoading(false)
      }
    },
    [folderPath]
  )

  // Debounced search trigger (300 ms)
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(() => {
      runSearch(query, searchType)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query, searchType, runSearch])

  // Clear results when folder changes
  useEffect(() => {
    setQuery('')
    setFileResults([])
    setTextResults([])
    setTruncated(false)
    setError(null)
  }, [folderPath])

  return {
    query,
    setQuery,
    searchType,
    setSearchType,
    fileResults,
    textResults,
    isLoading,
    error,
    truncated,
  }
}
