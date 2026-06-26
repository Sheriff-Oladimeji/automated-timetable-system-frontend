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

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = [],
): UseFetchReturn<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  })

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

  // Re-run whenever deps change (in addition to mount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [load, ...deps])

  return { ...state, refresh: load }
}
