import { describe, it, expect } from 'vitest';
import { filterProducts } from '../../src/services/productService';
import { Product } from '../../src/database/products';
import { ProductQueryParams } from '../../src/types/productTypes';

const testProducts: Product[] = [
  { id: '1', name: 'Notebook', description: 'A laptop', price: 2999.99, category: 'eletronicos', createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Mouse', description: 'A mouse', price: 49.90, category: 'eletronicos', createdAt: '2024-01-02T00:00:00Z' },
  { id: '3', name: 'Cadeira', description: 'A chair', price: 899.00, category: 'moveis', createdAt: '2024-01-03T00:00:00Z' },
  { id: '4', name: 'Mesa', description: 'A desk', price: 1299.00, category: 'moveis', createdAt: '2024-01-04T00:00:00Z' },
  { id: '5', name: 'Hub USB', description: 'A hub', price: 29.99, category: 'acessorios', createdAt: '2024-01-05T00:00:00Z' },
];

const defaultParams: ProductQueryParams = {
  limit: 10,
  offset: 0,
  sortBy: 'name',
  sortOrder: 'asc',
};

describe('filterProducts', () => {

  it('deve retornar todos os produtos quando nenhum filtro é aplicado', () => {
    // Arrange - preparar dados
    const params: ProductQueryParams = { ...defaultParams };

    // Act - executar ação
    const resultado = filterProducts(testProducts, params);

    // Assert - verificar resultado
    expect(resultado).toHaveLength(5);
    expect(resultado).toEqual(testProducts);
  });

  it('deve retornar produtos da categoria quando category é informado', () => {
    // Arrange - preparar dados
    const params: ProductQueryParams = { ...defaultParams, category: 'eletronicos' };

    // Act - executar ação
    const resultado = filterProducts(testProducts, params);

    // Assert - verificar resultado
    expect(resultado).toHaveLength(2);
    expect(resultado.every((p) => p.category === 'eletronicos')).toBe(true);
  });

  it('deve retornar produtos com preço >= minPrice quando minPrice é informado', () => {
    // Arrange - preparar dados
    const params: ProductQueryParams = { ...defaultParams, minPrice: 899 };

    // Act - executar ação
    const resultado = filterProducts(testProducts, params);

    // Assert - verificar resultado
    expect(resultado).toHaveLength(3);
    expect(resultado.every((p) => p.price >= 899)).toBe(true);
  });

  it('deve retornar produtos com preço <= maxPrice quando maxPrice é informado', () => {
    // Arrange - preparar dados
    const params: ProductQueryParams = { ...defaultParams, maxPrice: 100 };

    // Act - executar ação
    const resultado = filterProducts(testProducts, params);

    // Assert - verificar resultado
    expect(resultado).toHaveLength(2);
    expect(resultado.every((p) => p.price <= 100)).toBe(true);
  });

  it('deve retornar produtos dentro da faixa quando minPrice e maxPrice são combinados', () => {
    // Arrange - preparar dados
    const params: ProductQueryParams = { ...defaultParams, minPrice: 40, maxPrice: 1000 };

    // Act - executar ação
    const resultado = filterProducts(testProducts, params);

    // Assert - verificar resultado
    expect(resultado).toHaveLength(2);
    expect(resultado.every((p) => p.price >= 40 && p.price <= 1000)).toBe(true);
  });

  it('deve retornar lista vazia quando nenhum produto atende aos filtros', () => {
    // Arrange - preparar dados
    const params: ProductQueryParams = { ...defaultParams, category: 'inexistente' };

    // Act - executar ação
    const resultado = filterProducts(testProducts, params);

    // Assert - verificar resultado
    expect(resultado).toHaveLength(0);
  });

  it('deve retornar lista vazia quando a lista de produtos é vazia', () => {
    // Arrange - preparar dados
    const params: ProductQueryParams = { ...defaultParams, category: 'eletronicos' };

    // Act - executar ação
    const resultado = filterProducts([], params);

    // Assert - verificar resultado
    expect(resultado).toHaveLength(0);
  });

  it('deve combinar filtros de categoria e preço quando ambos são informados', () => {
    // Arrange - preparar dados
    const params: ProductQueryParams = { ...defaultParams, category: 'moveis', minPrice: 1000 };

    // Act - executar ação
    const resultado = filterProducts(testProducts, params);

    // Assert - verificar resultado
    expect(resultado).toHaveLength(1);
    expect(resultado[0].name).toBe('Mesa');
  });
});
