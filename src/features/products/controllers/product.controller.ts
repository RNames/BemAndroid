import { useState, useCallback } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from '@react-native-firebase/firestore';
import { Product, ProductCategory } from '../models/Product.model';

/**
 * Product Controller
 * Mengelola semua logika bisnis yang berkaitan dengan produk:
 * - Fetch data dari Firestore (Modular API v22)
 * - Filter berdasarkan kategori
 * - Search produk
 * - State management untuk loading & error
 */

export interface ProductState {
  products: Product[];
  filtered: Product[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export interface ProductActions {
  fetchProducts: () => Promise<void>;
  onRefresh: () => void;
  applyFilter: (search: string, category: ProductCategory) => void;
}

export const useProductController = (): [ProductState, ProductActions] => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);

      // ✅ Modular API v22 — tidak ada deprecation warning
      const db = getFirestore();
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('approved', '==', true));
      const snapshot = await getDocs(q);

      const data: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(data);
      setFiltered(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      console.error('[ProductController] fetchProducts error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Terapkan filter kategori + pencarian teks secara bersamaan
   */
  const applyFilter = useCallback(
    (search: string, category: ProductCategory) => {
      let result = products;

      if (category !== 'Semua') {
        result = result.filter(p => p.category === category);
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        result = result.filter(
          p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q),
        );
      }

      setFiltered(result);
    },
    [products],
  );

  const state: ProductState = {
    products,
    filtered,
    loading,
    refreshing,
    error,
  };

  const actions: ProductActions = {
    fetchProducts,
    onRefresh,
    applyFilter,
  };

  return [state, actions];
};
