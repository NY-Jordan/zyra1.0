import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[], initial: T) {
  const [data, setData] = useState<T>(initial);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    mode === 'initial' ? setIsLoading(true) : setIsRefreshing(true);
    try {
      setData(await fetcherRef.current());
    } finally {
      mode === 'initial' ? setIsLoading(false) : setIsRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load('initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, isLoading, isRefreshing, refresh: () => load('refresh') };
}
