import { useState, useEffect } from 'react';
import { getData, addItem, updateItem, deleteItem } from '@/utils/mockData';
import type { Product } from '@/types';

export const useInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = () => {
    setProducts(getData<Product>('erp_products'));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    addItem('erp_products', newProduct);
    loadProducts();
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    updateItem('erp_products', id, updates);
    loadProducts();
  };

  const deleteProduct = (id: string) => {
    deleteItem('erp_products', id);
    loadProducts();
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
