import { Product } from '../database/products';
import {
  CreateProductInput,
  CreateProductValidationResult,
  PaginationMetadata,
  ProductQueryParams,
  ValidationError,
  ValidationResult,
  VALID_CATEGORIES,
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
 * Collects all errors in a single pass before returning.
 */
export function validateCreateProduct(body: Record<string, unknown>): CreateProductValidationResult {
  const errors: ValidationError[] = [];

  // Validate name
  if (body.name === undefined || body.name === null || String(body.name).trim() === '') {
    errors.push({ field: 'name', message: 'name is required and cannot be empty' });
  }

  // Validate description
  if (
    body.description === undefined ||
    body.description === null ||
    String(body.description).trim() === ''
  ) {
    errors.push({ field: 'description', message: 'description is required and cannot be empty' });
  }

  // Validate price
  if (body.price === undefined || body.price === null) {
    errors.push({ field: 'price', message: 'price is required' });
  } else {
    const price = Number(body.price);
    if (isNaN(price) || price <= 0) {
      errors.push({ field: 'price', message: 'price must be a number greater than 0' });
    }
  }

  // Validate category
  if (body.category === undefined || body.category === null || String(body.category).trim() === '') {
    errors.push({ field: 'category', message: 'category is required' });
  } else {
    const category = String(body.category);
    if (!VALID_CATEGORIES.includes(category as any)) {
      errors.push({
        field: 'category',
        message: `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    input: {
      name: String(body.name).trim(),
      description: String(body.description).trim(),
      price: Number(body.price),
      category: String(body.category) as CreateProductInput['category'],
    },
  };
}

/**
 * Creates a new product and adds it to the products array.
 * Generates an incremental id and sets createdAt to current timestamp.
 */
export function createProduct(products: Product[], input: CreateProductInput): Product {
  const maxId = products.reduce((max, p) => {
    const numId = parseInt(p.id, 10);
    return numId > max ? numId : max;
  }, 0);

  const newProduct: Product = {
    id: String(maxId + 1),
    name: input.name,
    description: input.description,
    price: input.price,
    category: input.category,
    createdAt: new Date().toISOString(),
  };

  products.push(newProduct);
  return newProduct;
}
