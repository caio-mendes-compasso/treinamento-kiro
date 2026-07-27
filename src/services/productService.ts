import { Product } from '../database/products';
import {
  CreateProductBody,
  CreateProductValidationResult,
  PaginationMetadata,
  ProductQueryParams,
  VALID_CATEGORIES,
  ValidationError,
  ValidationResult,
} from '../types/productTypes';

/**
 * Validates raw query string parameters and returns either parsed params or validation errors.
 * Collects all errors in a single pass before returning.
 */
export function validateQueryParams(query: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate and parse limit
  let limit = 10;
  if (query.limit !== undefined) {
    const parsed = Number(query.limit);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
      errors.push({ field: 'limit', message: 'limit must be an integer between 1 and 100' });
    } else {
      limit = parsed;
    }
  }

  // Validate and parse offset
  let offset = 0;
  if (query.offset !== undefined) {
    const parsed = Number(query.offset);
    if (!Number.isInteger(parsed) || parsed < 0) {
      errors.push({
        field: 'offset',
        message: 'offset must be an integer greater than or equal to 0',
      });
    } else {
      offset = parsed;
    }
  }

  // Validate and parse minPrice
  let minPrice: number | undefined;
  if (query.minPrice !== undefined) {
    const parsed = Number(query.minPrice);
    if (isNaN(parsed) || parsed < 0) {
      errors.push({
        field: 'minPrice',
        message: 'minPrice must be a number greater than or equal to 0',
      });
    } else {
      minPrice = parsed;
    }
  }

  // Validate and parse maxPrice
  let maxPrice: number | undefined;
  if (query.maxPrice !== undefined) {
    const parsed = Number(query.maxPrice);
    if (isNaN(parsed) || parsed < 0) {
      errors.push({
        field: 'maxPrice',
        message: 'maxPrice must be a number greater than or equal to 0',
      });
    } else {
      maxPrice = parsed;
    }
  }

  // Validate sortBy
  let sortBy: 'name' | 'price' = 'name';
  if (query.sortBy !== undefined) {
    if (query.sortBy !== 'name' && query.sortBy !== 'price') {
      errors.push({ field: 'sortBy', message: 'sortBy must be one of: name, price' });
    } else {
      sortBy = query.sortBy;
    }
  }

  // Validate sortOrder
  let sortOrder: 'asc' | 'desc' = 'asc';
  if (query.sortOrder !== undefined) {
    if (query.sortOrder !== 'asc' && query.sortOrder !== 'desc') {
      errors.push({ field: 'sortOrder', message: 'sortOrder must be one of: asc, desc' });
    } else {
      sortOrder = query.sortOrder;
    }
  }

  // Return errors if any found
  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Build validated params
  const params: ProductQueryParams = {
    limit,
    offset,
    sortBy,
    sortOrder,
  };

  if (query.category !== undefined) {
    params.category = String(query.category);
  }
  if (minPrice !== undefined) {
    params.minPrice = minPrice;
  }
  if (maxPrice !== undefined) {
    params.maxPrice = maxPrice;
  }

  return { success: true, params };
}

/**
 * Filters products by category and/or price range.
 * All active filters are combined with logical AND.
 * Accepts product array as parameter for testability.
 */
export function filterProducts(products: Product[], params: ProductQueryParams): Product[] {
  return products.filter((product) => {
    if (params.category !== undefined && product.category !== params.category) {
      return false;
    }
    if (params.minPrice !== undefined && product.price < params.minPrice) {
      return false;
    }
    if (params.maxPrice !== undefined && product.price > params.maxPrice) {
      return false;
    }
    return true;
  });
}

/**
 * Sorts products by the specified field and order.
 * Uses product id as a tiebreaker (ascending) for deterministic results.
 * Returns a new sorted array without mutating the input.
 */
export function sortProducts(products: Product[], params: ProductQueryParams): Product[] {
  const { sortBy, sortOrder } = params;
  const direction = sortOrder === 'asc' ? 1 : -1;

  return [...products].sort((a, b) => {
    let comparison: number;

    if (sortBy === 'name') {
      comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    } else {
      comparison = a.price - b.price;
    }

    if (comparison !== 0) {
      return comparison * direction;
    }

    // Tiebreaker: sort by id ascending
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

/**
 * Applies offset/limit pagination and computes pagination metadata.
 * The `products` parameter is the already-filtered-and-sorted array.
 * Returns paginated data slice and metadata (total, page, hasNext).
 */
export function paginateProducts(
  products: Product[],
  params: ProductQueryParams,
): { data: Product[]; metadata: PaginationMetadata } {
  const { offset, limit } = params;
  const total = products.length;
  const page = Math.floor(offset / limit) + 1;
  const hasNext = offset + limit < total;
  const data = products.slice(offset, offset + limit);

  return { data, metadata: { total, page, hasNext } };
}

/**
 * Validates the request body for creating a new product.
 * Collects all validation errors in a single pass before returning.
 */
export function validateCreateProduct(body: unknown): CreateProductValidationResult {
  const errors: ValidationError[] = [];

  if (body === null || body === undefined || typeof body !== 'object') {
    return { success: false, errors: [{ field: 'body', message: 'Request body is required' }] };
  }

  const { name, description, price, category } = body as Record<string, unknown>;

  // Validate name
  if (name === undefined || name === null) {
    errors.push({ field: 'name', message: 'name is required' });
  } else if (typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'name must be a non-empty string' });
  }

  // Validate price
  if (price === undefined || price === null) {
    errors.push({ field: 'price', message: 'price is required' });
  } else if (typeof price !== 'number' || isNaN(price) || price <= 0) {
    errors.push({ field: 'price', message: 'price must be a number greater than 0' });
  }

  // Validate category
  if (category === undefined || category === null) {
    errors.push({ field: 'category', message: 'category is required' });
  } else if (!VALID_CATEGORIES.includes(category as any)) {
    errors.push({
      field: 'category',
      message: `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  // Validate description (optional)
  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'description must be a string' });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name: (name as string).trim(),
      description: typeof description === 'string' ? description : '',
      price: price as number,
      category: category as CreateProductBody['category'],
    },
  };
}

/**
 * Creates a new product and adds it to the in-memory store.
 * Generates an incremental ID and sets createdAt to the current timestamp.
 */
export function createProduct(products: Product[], data: CreateProductBody): Product {
  const maxId = products.reduce((max, p) => {
    const numId = parseInt(p.id, 10);
    return numId > max ? numId : max;
  }, 0);

  const newProduct: Product = {
    id: String(maxId + 1),
    name: data.name,
    description: data.description ?? '',
    price: data.price,
    category: data.category,
    createdAt: new Date().toISOString(),
  };

  products.push(newProduct);
  return newProduct;
}
