import { useCallback, useState } from 'react';
import { ApiError } from '@/services/api';

interface MutationState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseMutationResult<TData, TVariables> extends MutationState<TData> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  reset: () => void;
}

export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
): UseMutationResult<TData, TVariables> {
  const [state, setState] = useState<MutationState<TData>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      setState({ data: null, isLoading: true, error: null });
      try {
        const data = await mutationFn(variables);
        setState({ data, isLoading: false, error: null });
        return data;
      } catch (err) {
        const error = err instanceof ApiError ? err : new ApiError(0, 'Erreur inconnue');
        setState({ data: null, isLoading: false, error });
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, mutate, reset };
}
