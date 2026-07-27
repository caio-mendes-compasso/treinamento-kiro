import { Router, Request, Response } from 'express';
import { products } from '../database/products';
import {
  validateQueryParams,
  filterProducts,
  sortProducts,
  paginateProducts,
  validateCreateProduct,
  createProduct,
} from '../services/productService';

export const productsRouter = Router();

productsRouter.get('/', (req: Request, res: Response) => {
  // 1. Validate query parameters
  const validation = validateQueryParams(req.query as Record<string, unknown>);

  if (!validation.success) {
    const errorString = validation.errors.map((e) => e.message).join('; ');
    return res.status(400).json({ error: errorString });
  }

  // 2. Filter → Sort → Paginate
  const filtered = filterProducts(products, validation.params);
  const sorted = sortProducts(filtered, validation.params);
  const result = paginateProducts(sorted, validation.params);

  // 3. Respond
  return res.status(200).json(result);
});

productsRouter.post('/', (req: Request, res: Response) => {
  // 1. Validate request body
  const validation = validateCreateProduct(req.body);

  if (!validation.success) {
    const errorString = validation.errors.map((e) => e.message).join('; ');
    return res.status(400).json({ error: errorString });
  }

  // 2. Create product
  const newProduct = createProduct(products, validation.data);

  // 3. Respond with created product
  return res.status(201).json(newProduct);
});
