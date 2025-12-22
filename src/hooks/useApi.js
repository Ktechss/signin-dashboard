import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching data from API
 * @param {Function} fetchFn - API function to call
 * @param {Array} deps - Dependencies array for re-fetching
 * @param {Object} options - Options object
 * @returns {Object} { data, loading, error, refetch }
 */
export function useFetch(fetchFn, deps = [], options = {}) {
  const { immediate = true, initialData = null } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (immediate) {
      fetch().catch(() => {}); // Errors are already handled in state
    }
  }, [...deps, immediate]);

  const refetch = useCallback((...args) => {
    return fetch(...args);
  }, [fetch]);

  return { data, loading, error, refetch };
}

/**
 * Custom hook for mutations (POST, PUT, DELETE)
 * @param {Function} mutationFn - API mutation function
 * @returns {Object} { mutate, data, loading, error, reset }
 */
export function useMutation(mutationFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, data, loading, error, reset };
}

/**
 * Custom hook for paginated data
 * @param {Function} fetchFn - API function that accepts pagination params
 * @param {Object} options - Options for pagination
 * @returns {Object} { data, loading, error, page, setPage, pageSize, setPageSize, refetch }
 */
export function usePagination(fetchFn, options = {}) {
  const { initialPage = 1, initialPageSize = 10 } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const { data, loading, error, refetch } = useFetch(
    () => fetchFn({ _page: page, _limit: pageSize }),
    [page, pageSize]
  );

  const nextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(p => Math.max(1, p - 1));
  }, []);

  const goToPage = useCallback((newPage) => {
    setPage(Math.max(1, newPage));
  }, []);

  return {
    data,
    loading,
    error,
    page,
    setPage: goToPage,
    pageSize,
    setPageSize,
    nextPage,
    prevPage,
    refetch,
  };
}

/**
 * Custom hook for filtered/searched data
 * @param {Function} fetchFn - API function that accepts filter params
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} { data, loading, error, filters, setFilter, clearFilters, refetch }
 */
export function useFiltered(fetchFn, initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const { data, loading, error, refetch } = useFetch(
    () => fetchFn(filters),
    [JSON.stringify(filters)]
  );

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const setFiltersAll = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    data,
    loading,
    error,
    filters,
    setFilter,
    setFiltersAll,
    clearFilters,
    refetch,
  };
}

export default {
  useFetch,
  useMutation,
  usePagination,
  useFiltered,
};
