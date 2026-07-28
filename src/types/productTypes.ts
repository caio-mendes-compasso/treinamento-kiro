import { Product } from '../database/products';

/**
 * Parsed and validated query parameters for the product listing endpoint.
 */
export interface ProductQueryParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit: number;
  offset: number;
  sortBy: 'name' | 'price';
  sortOrder: 'asc' | 'desc';
}

/**
 * Represents a single validation error for a query parameter.
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Result of validating query parameters.
 * Either succeeds with parsed params or fails with a list of errors.
 */
export type ValidationResult =
  { success: true; params: ProductQueryParams } | { success: false; errors: ValidationError[] };

/**
 * Pagination metadata included in successful responses.
 */
export interface PaginationMetadata {
  total: number;
  page: number;
  hasNext: boolean;
}

/**
 * Successful response structure for the product listing endpoint.
 */
export interface ProductListResponse {
  data: Product[];
  metadata: PaginationMetadata;
}

/**
 * Error response structure for invalid requests.
 */
export interface ProductErrorResponse {
  error: string;
}

/**
 * Valid product categories.
 */
export const VALID_CATEGORIES = ['eletronicos', 'moveis', 'acessorios'] as const;
export type ProductCategory = (typeof VALID_CATEGORIES)[number];

/**
 * Expected body for creating a new product.
 */
export interface CreateProductBody {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
}

/**
 * Result of validating a create product request body.
 * Either succeeds with parsed body or fails with a list of errors.
 */
export type CreateProductValidationResult =
  | { success: true; body: CreateProductBody }
  | { success: false; errors: ValidationError[] };
