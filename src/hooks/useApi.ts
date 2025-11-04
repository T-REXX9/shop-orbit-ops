/**
 * TanStack Query Hooks for API Data Fetching
 * Provides hooks for inquiries, customers, and products with proper loading/error states
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Inquiry,
  Customer,
  Product,
  PaginatedResponse,
} from '@/types/api';

// ============================================================================
// Query Configuration
// ============================================================================

const QUERY_CONFIG = {
  refetchOnWindowFocus: false,
  retry: 1,
  staleTime: 5 * 60 * 1000, // 5 minutes
};

// ============================================================================
// Inquiry Hooks
// ============================================================================

/**
 * Fetch all inquiries with customer and product names
 * GET /api/v1/inquiries
 */
export function useInquiries(): UseQueryResult<Inquiry[], Error> {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => {
      const response = await apiFetch<PaginatedResponse<Inquiry>>('/api/v1/inquiries');
      return response.data;
    },
    enabled: isAuthenticated,
    ...QUERY_CONFIG,
  });
}

/**
 * Fetch single inquiry by ID
 * GET /api/v1/inquiries/:id
 */
export function useInquiry(id: string): UseQueryResult<Inquiry, Error> {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['inquiries', id],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: Inquiry }>(
        `/api/v1/inquiries/${id}`
      );
      return response.data;
    },
    enabled: isAuthenticated && !!id,
    ...QUERY_CONFIG,
  });
}

// ============================================================================
// Customer Hooks
// ============================================================================

/**
 * Fetch all customers
 * GET /api/v1/customers
 */
export function useCustomers(): UseQueryResult<Customer[], Error> {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await apiFetch<PaginatedResponse<Customer>>('/api/v1/customers');
      return response.data;
    },
    enabled: isAuthenticated,
    ...QUERY_CONFIG,
  });
}

/**
 * Fetch single customer by ID
 * GET /api/v1/customers/:id
 */
export function useCustomer(id: string): UseQueryResult<Customer, Error> {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: Customer }>(
        `/api/v1/customers/${id}`
      );
      return response.data;
    },
    enabled: isAuthenticated && !!id,
    ...QUERY_CONFIG,
  });
}

// ============================================================================
// Product Hooks
// ============================================================================

/**
 * Fetch all products
 * GET /api/v1/products
 */
export function useProducts(): UseQueryResult<Product[], Error> {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiFetch<PaginatedResponse<Product>>('/api/v1/products');
      return response.data;
    },
    enabled: isAuthenticated,
    ...QUERY_CONFIG,
  });
}

/**
 * Fetch single product by ID
 * GET /api/v1/products/:id
 */
export function useProduct(id: string): UseQueryResult<Product, Error> {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: Product }>(
        `/api/v1/products/${id}`
      );
      return response.data;
    },
    enabled: isAuthenticated && !!id,
    ...QUERY_CONFIG,
  });
}

// ============================================================================
// Health Check Hook (Optional)
// ============================================================================

/**
 * Check backend health status
 * GET /health
 */
export function useHealth(): UseQueryResult<{ status: string }, Error> {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiFetch<{ status: string }>('/health');
      return response;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false,
    staleTime: 0,
  });
}
