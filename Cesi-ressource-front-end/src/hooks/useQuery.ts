import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/services/api';

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseQueryOptions {
  enabled?: boolean;
}

interface UseQueryResult<T> extends QueryState<T> {
  refetch: () => Promise<void>;
}

export function useQuery<T>(
  queryKey: unknown[],
  fetcher: () => Promise<T>,
  options: UseQueryOptions = {},
): UseQueryResult<T> {
  const { enabled = true } = options;

  const [state, setState] = useState<QueryState<T>>({
    data: null,
    isLoading: enabled,
    error: null,
  });

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof ApiError ? err : new ApiError(0, 'Erreur inconnue'),
      }));
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (enabled) execute();
  }, [enabled, execute, ...queryKey]);

  return { ...state, refetch: execute };
}
