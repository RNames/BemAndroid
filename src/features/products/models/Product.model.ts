/**
 * Product Model
 * Mendefinisikan struktur data entitas produk dari Firestore
 */
export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  whatsappLink: string;
  approved: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export type ProductCategory =
  | 'Semua'
  | 'Makanan & Minuman'
  | 'Kerajinan'
  | 'Pakaian'
  | 'Lainnya';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Semua',
  'Makanan & Minuman',
  'Kerajinan',
  'Pakaian',
  'Lainnya',
];
