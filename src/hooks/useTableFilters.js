import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Comprehensive hook for managing table data with filtering, sorting, search, and pagination
 * @param {Array} data - The data array to filter/sort
 * @param {Object} options - Configuration options
 * @returns {Object} - All filter state and utilities
 */
export function useTableFilters(data = [], options = {}) {
  const {
    initialSearch = '',
    initialFilters = {},
    initialSort = { key: null, direction: 'asc' },
    initialPage = 1,
    initialPageSize = 10,
    searchFields = ['name', 'email', 'reference'], // Fields to search in
    debounceDelay = 300,
  } = options;

  // State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filters, setFilters] = useState(initialFilters);
  const [sortConfig, setSortConfig] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Debounced search term
  const debouncedSearch = useDebounce(searchTerm, debounceDelay);

  // Filter setter for individual filters
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters(initialFilters);
    setSortConfig(initialSort);
    setPage(1);
  }, [initialFilters, initialSort]);

  // Handle sort
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let result = [...data];

    // Apply search
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(item => {
        return searchFields.some(field => {
          const value = getNestedValue(item, field);
          return value && String(value).toLowerCase().includes(search);
        });
      });
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(item => {
          const itemValue = getNestedValue(item, key);
          return String(itemValue).toLowerCase() === String(value).toLowerCase();
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = String(aValue).localeCompare(String(bValue), undefined, {
          numeric: true,
          sensitivity: 'base',
        });

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, debouncedSearch, filters, sortConfig, searchFields]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, page, pageSize]);

  // Pagination info
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Page navigation
  const nextPage = useCallback(() => {
    if (hasNextPage) setPage(p => p + 1);
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) setPage(p => p - 1);
  }, [hasPrevPage]);

  const goToPage = useCallback((pageNum) => {
    const validPage = Math.max(1, Math.min(pageNum, totalPages));
    setPage(validPage);
  }, [totalPages]);

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    searchTerm ||
    Object.values(filters).some(v => v && v !== 'all')
  );

  return {
    // Data
    data: paginatedData,
    allData: processedData,
    totalItems,

    // Search
    searchTerm,
    setSearchTerm,
    debouncedSearch,

    // Filters
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasActiveFilters,

    // Sorting
    sortConfig,
    handleSort,
    setSortConfig,

    // Pagination
    page,
    setPage: goToPage,
    pageSize,
    setPageSize,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  };
}

/**
 * Helper to get nested object value by dot notation
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-notation path (e.g., 'user.name')
 * @returns {any} - Value at path
 */
function getNestedValue(obj, path) {
  if (!path) return obj;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export default useTableFilters;
