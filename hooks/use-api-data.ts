import { useState, useEffect, useCallback } from 'react'

interface UseApiDataOptions {
  dependencies?: any[]
  enabled?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

interface UseApiDataResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  reset: () => void
}

export function useApiData<T = any>(
  fetcher: () => Promise<T>,
  options: UseApiDataOptions = {}
): UseApiDataResult<T> {
  const { dependencies = [], enabled = true, onSuccess, onError } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)
      
      const result = await fetcher()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred')
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [fetcher, enabled, onSuccess, onError])

  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [...dependencies, enabled])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(true)
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    reset
  }
}

// Hook for handling mutations (POST, PUT, DELETE operations)
interface UseMutationOptions<T, R> {
  onSuccess?: (data: R, variables: T) => void
  onError?: (error: Error, variables: T) => void
}

interface UseMutationResult<T, R> {
  mutate: (variables: T) => Promise<R>
  loading: boolean
  error: Error | null
  reset: () => void
}

export function useMutation<T = any, R = any>(
  mutationFn: (variables: T) => Promise<R>,
  options: UseMutationOptions<T, R> = {}
): UseMutationResult<T, R> {
  const { onSuccess, onError } = options
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(async (variables: T): Promise<R> => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await mutationFn(variables)
      onSuccess?.(result, variables)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed')
      setError(error)
      onError?.(error, variables)
      throw error
    } finally {
      setLoading(false)
    }
  }, [mutationFn, onSuccess, onError])

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return {
    mutate,
    loading,
    error,
    reset
  }
}