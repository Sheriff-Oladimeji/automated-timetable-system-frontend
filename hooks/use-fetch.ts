'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface FetchState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

interface UseFetchReturn<T> extends FetchState<T> {
  refresh: () => void
}

export function useFetch<T>(fetchFn: () => Promise<T>): UseFetchReturn<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  })

  // Stable ref so callers don't need to memoize fetchFn
  const fnRef = useRef(fetchFn)
  fnRef.current = fetchFn

  const load = useCallback(() => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    fnRef
      .current()
      .then((data) => setState({ data, isLoading: false, error: null }))
      .catch((err: unknown) =>
        setState({
          data: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Something went wrong',
        }),
      )
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, refresh: load }
}
