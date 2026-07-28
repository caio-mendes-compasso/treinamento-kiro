import { Product } from '../database/products';

/**
 * Valid product categories.
 */
export const VALID_CATEGORIES = ['eletronicos', 'moveis', 'acessorios'] as const;
export type ProductCategory = (typeof VALID_CATEGORIES)[number];

/**
 * Input body for creating a new product (POST /products).
 */
export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
}

/**
 * Result of validating a create product request body.
 */
export type CreateProductValidationResult =
  | { success: true; input: CreateProductInput }
  | { success: false; errors: ValidationError[] };

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
