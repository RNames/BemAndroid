import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import HomeScreen from '../features/products/views/screens/HomeScreen';
import ProductDetailScreen from '../features/products/views/screens/ProductDetailScreen';
import { Product } from '../features/products/models/Product.model';

type Screen = 'home' | 'detail';

/**
 * AppNavigator
 * - Mengelola perpindahan antar screen
 * - Menghandle tombol Back hardware Android:
 *   • Jika di halaman detail → kembali ke Home
 *   • Jika di halaman home → biarkan Android keluar dari app (behavior default)
 */
const AppNavigator: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // ─── Android Hardware Back Button Handler ───────────────
  useEffect(() => {
    const onBackPress = () => {
      if (screen === 'detail') {
        // Intercept: kembali ke home, jangan keluar app
        navigateBack();
        return true; // true = event sudah dihandle, jangan lakukan default
      }
      // false = biarkan Android handle (keluar app dari home screen)
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
  }, [screen]); // re-register setiap kali screen berubah

  // ─── Navigation Functions ───────────────────────────────
  const navigateToDetail = (product: Product) => {
    setSelectedProduct(product);
    setScreen('detail');
  };

  const navigateBack = () => {
    setSelectedProduct(null);
    setScreen('home');
  };

  // ─── Render ─────────────────────────────────────────────
  if (screen === 'detail' && selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onBack={navigateBack}
      />
    );
  }

  return <HomeScreen onSelectProduct={navigateToDetail} />;
};

export default AppNavigator;
