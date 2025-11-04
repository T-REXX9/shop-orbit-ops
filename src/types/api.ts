/**
 * TypeScript Type Definitions for API
 * Models match backend schema and API response structure
 */

// ============================================================================
// Domain Models
// ============================================================================

/**
 * Inquiry Model - Sales inquiries from customers
 */
export interface Inquiry {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  status: 'pending' | 'converted' | 'rejected';
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Enriched fields from backend JOINs
  customer_name: string;
  product_name: string;
}

/**
 * Customer Model - Customer/client information
 */
export interface Customer {
  id: string;
  customer_name: string;
  since: string | null;
  address: string | null;
  delivery_address: string | null;
  area: string | null;
  tin: string | null;
  team: string | null;
  salesman: string | null;
  province: string | null;
  city: string | null;
  refer_by: string | null;
  price_group: string | null;
  business_line: string | null;
  terms: string | null;
  transaction_type: string | null;
  vat_type: string | null;
  vat_percentage: number | null;
  status: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Product Model - Product/inventory items
 */
export interface Product {
  id: string;
  part_no: string;
  item_code: string | null;
  category: string;
  original_pn_no: string | null;
  oem_no: string | null;
  description: string | null;
  descriptive_inquiry: string | null;
  application: string | null;
  brand: string | null;
  size: string | null;
  no_of_holes: number | null;
  no_of_cylinder: number | null;
  barcode: string | null;
  reorder_quantity: number | null;
  replenish_quantity: number | null;
  no_of_pieces_per_box: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * User - Authenticated user information
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'salesperson';
}

/**
 * LoginRequest - Login credentials
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * LoginResponse - Successful login response
 */
export interface LoginResponse {
  success: true;
  data: {
    token: string;
    user: User;
  };
}

/**
 * AuthError - Authentication error response
 */
export interface AuthError {
  success: false;
  message: string;
}

// ============================================================================
// API Response Wrappers
// ============================================================================

/**
 * StandardResponse - Standard API response for single entity
 */
export interface StandardResponse<T> {
  success: boolean;
  data: T;
}

/**
 * PaginationMetadata - Pagination information
 */
export interface PaginationMetadata {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * PaginatedResponse - Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * ErrorResponse - Error API response
 */
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if response is a standard successful response
 */
export function isStandardResponse<T>(response: any): response is StandardResponse<T> {
  return response && typeof response.success === 'boolean' && 'data' in response;
}

/**
 * Check if response is paginated
 */
export function isPaginatedResponse<T>(response: any): response is PaginatedResponse<T> {
  return (
    response &&
    typeof response.success === 'boolean' &&
    Array.isArray(response.data) &&
    'pagination' in response
  );
}

/**
 * Check if response is an error
 */
export function isErrorResponse(response: any): response is ErrorResponse {
  return response && response.success === false && 'message' in response;
}
