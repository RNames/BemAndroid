import { useState, useCallback } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
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

export type ProductSortOption =
  | 'newest'
  | 'oldest'
  | 'name_asc'
  | 'name_desc'
  | 'price_low'
  | 'price_high';

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
  applyFilter: (
    search: string,
    category: ProductCategory,
    sortBy?: ProductSortOption,
  ) => void;
  addProduct: (
    newProductData: {
      name: string;
      category: ProductCategory;
      price: number;
      stock: number;
      description: string;
      imageUrl: string;
      images?: string[];
      whatsappLink: string;
    },
    userUid: string,
  ) => Promise<boolean>;
  updateProduct: (
    productId: string,
    updatedData: {
      name: string;
      category: ProductCategory;
      price: number;
      stock: number;
      description: string;
      imageUrl: string;
      images?: string[];
      whatsappLink: string;
    },
  ) => Promise<boolean>;
}

// Cache produk di level modul
let cachedProducts: Product[] = [];
let isProductsLoaded = false;

export const useProductController = (): [ProductState, ProductActions] => {
  const [products, setProducts] = useState<Product[]>(cachedProducts);
  const [filtered, setFiltered] = useState<Product[]>(cachedProducts);
  const [loading, setLoading] = useState(!isProductsLoaded);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      if (!isProductsLoaded) {
        setLoading(true);
      }

      // ✅ Modular API v22 — tidak ada deprecation warning
      const db = getFirestore();
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);

      const data: Product[] = snapshot.docs.map(docSnap => {
        const raw = docSnap.data();
        const images: string[] = Array.isArray(raw.images) && raw.images.length > 0
          ? raw.images
          : (raw.imageUrl ? [raw.imageUrl] : []);
        const imageUrl: string = raw.imageUrl || images[0] || '';
        return {
          id: docSnap.id,
          ...raw,
          imageUrl,
          images,
        } as Product;
      });

      cachedProducts = data;
      isProductsLoaded = true;

      setProducts(data);
      setFiltered(data.filter(p => p.approved));
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
   * Terapkan filter kategori, pencarian teks, dan pengurutan
   */
  const applyFilter = useCallback(
    (
      search: string,
      category: ProductCategory,
      sortBy: ProductSortOption = 'newest',
    ) => {
      let result = products.filter(p => p.approved);

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

      // Pengurutan (Sorting)
      result.sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return (a.createdAt || 0) - (b.createdAt || 0);
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'newest':
          default:
            return (b.createdAt || 0) - (a.createdAt || 0);
        }
      });

      setFiltered(result);
    },
    [products],
  );

  /**
   * Tambah produk baru ke Firestore
   */
  const addProduct = useCallback(
    async (
      newProductData: {
        name: string;
        category: ProductCategory;
        price: number;
        stock: number;
        description: string;
        imageUrl: string;
        images?: string[];
        whatsappLink: string;
      },
      userUid: string,
    ): Promise<boolean> => {
      try {
        const db = getFirestore();
        const timestamp = Date.now();
        const docId = `product_${timestamp}`;
        const newProductRef = doc(db, 'products', docId);

        // Format whatsapp link jika tidak diawali http/https
        let waLink = newProductData.whatsappLink.trim();
        if (waLink && !waLink.startsWith('http')) {
          // Jika diinput nomor misal 08123456789 -> https://wa.me/628123456789
          let cleanNum = waLink.replace(/\D/g, '');
          if (cleanNum.startsWith('0')) {
            cleanNum = '62' + cleanNum.slice(1);
          }
          waLink = `https://wa.me/${cleanNum}?text=Halo%2C+saya+tertarik+membeli+${encodeURIComponent(
            newProductData.name,
          )}`;
        }

        const images = newProductData.images && newProductData.images.length > 0
          ? newProductData.images
          : (newProductData.imageUrl ? [newProductData.imageUrl.trim()] : []);
        const imageUrl = images[0] ||
          newProductData.imageUrl.trim() ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';

        const productPayload: Product = {
          id: docId,
          name: newProductData.name.trim(),
          category: newProductData.category,
          price: Number(newProductData.price),
          stock: Number(newProductData.stock),
          description: newProductData.description.trim(),
          imageUrl,
          images,
          whatsappLink: waLink,
          approved: false, // Menunggu persetujuan admin (pending review)
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: userUid,
        };

        await setDoc(newProductRef, productPayload);

        // Segarkan list produk
        await fetchProducts();
        return true;
      } catch (err) {
        console.error('[ProductController] addProduct error:', err);
        return false;
      }
    },
    [fetchProducts],
  );

  /**
   * Update data produk yang ada di Firestore
   */
  const updateProduct = useCallback(
    async (
      productId: string,
      updatedData: {
        name: string;
        category: ProductCategory;
        price: number;
        stock: number;
        description: string;
        imageUrl: string;
        images?: string[];
        whatsappLink: string;
      },
    ): Promise<boolean> => {
      try {
        const db = getFirestore();
        const productRef = doc(db, 'products', productId);

        let waLink = updatedData.whatsappLink.trim();
        if (waLink && !waLink.startsWith('http')) {
          let cleanNum = waLink.replace(/\D/g, '');
          if (cleanNum.startsWith('0')) {
            cleanNum = '62' + cleanNum.slice(1);
          }
          waLink = `https://wa.me/${cleanNum}?text=Halo%2C+saya+tertarik+membeli+${encodeURIComponent(
            updatedData.name,
          )}`;
        }

        const images = updatedData.images && updatedData.images.length > 0
          ? updatedData.images
          : (updatedData.imageUrl ? [updatedData.imageUrl.trim()] : []);
        const imageUrl = images[0] || updatedData.imageUrl.trim();

        const updatePayload: Record<string, any> = {
          name: updatedData.name.trim(),
          category: updatedData.category,
          price: Number(updatedData.price),
          stock: Number(updatedData.stock),
          description: updatedData.description.trim(),
          imageUrl,
          images,
          whatsappLink: waLink,
          updatedAt: Date.now(),
        };

        await setDoc(productRef, updatePayload, { merge: true });

        // Segarkan list produk
        await fetchProducts();
        return true;
      } catch (err) {
        console.error('[ProductController] updateProduct error:', err);
        return false;
      }
    },
    [fetchProducts],
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
    addProduct,
    updateProduct,
  };

  return [state, actions];
};
