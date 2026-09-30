import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import HomeScreen from '../features/products/views/screens/HomeScreen';
import ProductDetailScreen from '../features/products/views/screens/ProductDetailScreen';
import EventDetailScreen from '../features/events/views/screens/EventDetailScreen';
import AccountInfoScreen from '../features/auth/views/screens/AccountInfoScreen';
import UserProductsScreen from '../features/products/views/screens/UserProductsScreen';
import UserEventsScreen from '../features/events/views/screens/UserEventsScreen';
import InboxScreen from '../features/auth/views/screens/InboxScreen';
import LanguageScreen from '../features/auth/views/screens/LanguageScreen';
import { Product } from '../features/products/models/Product.model';
import { EventItem } from '../features/events/models/Event.model';
import AppUpdateModal from '../shared/components/AppUpdateModal';
import { checkAppUpdate, VersionCheckResult } from '../shared/services/version.service';

type Screen =
  | 'home'
  | 'product_detail'
  | 'event_detail'
  | 'account_info'
  | 'user_products'
  | 'user_events'
  | 'inbox'
  | 'language';

/**
 * AppNavigator
 * - Mengelola navigasi stack antar layar:
 *   • Layar Utama: HomeScreen (Produk, Acara, Profil)
 *   • Detail: ProductDetail, EventDetail
 *   • Sub-halaman Profil: AccountInfo, UserProducts, UserEvents, Inbox, Language
 * - Menjaga HomeScreen tetap ter-mount di memori agar tab aktif & posisi scroll tidak reset
 * - Menghandle tombol hardware Back Android secara berurutan sesuai tumpukan riwayat (stack)
 * - Memeriksa pembaruan versi real dari Firestore (/app_config/version) saat aplikasi dibuka
 */
const AppNavigator: React.FC = () => {
  const [screenStack, setScreenStack] = useState<Screen[]>(['home']);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // State pembaruan versi aplikasi dari Firestore
  const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // ─── Cek Pembaruan Versi Otomatis saat Startup ─────────
  useEffect(() => {
    checkAppUpdate().then(result => {
      setUpdateInfo(result);
      if (result.hasUpdate || result.forceUpdate) {
        setShowUpdateModal(true);
      }
    });
  }, []);

  const currentScreen = screenStack[screenStack.length - 1];

  const navigateTo = (screen: Screen) => {
    setScreenStack(prev => [...prev, screen]);
  };

  const navigateBack = () => {
    setScreenStack(prev => {
      if (prev.length > 1) {
        return prev.slice(0, prev.length - 1);
      }
      return prev;
    });
  };

  // ─── Android Hardware Back Button Handler ───────────────
  useEffect(() => {
    const onBackPress = () => {
      if (screenStack.length > 1) {
        navigateBack();
        return true; // Tangani event kembali, cegah keluar app
      }
      return false; // Biarkan OS menangani (keluar app saat di root home)
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
  }, [screenStack.length]);

  // ─── Detail Navigations ─────────────────────────────────
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigateTo('product_detail');
  };

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    navigateTo('event_detail');
  };

  // ─── Render ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Layar Utama HomeScreen selalu terpasang agar state tab & scroll terjaga */}
      <HomeScreen
        onSelectProduct={handleSelectProduct}
        onSelectEvent={handleSelectEvent}
        onNavigateToAccountInfo={() => navigateTo('account_info')}
        onNavigateToProducts={() => navigateTo('user_products')}
        onNavigateToEvents={() => navigateTo('user_events')}
        onNavigateToInbox={() => navigateTo('inbox')}
        onNavigateToLanguage={() => navigateTo('language')}
      />

      {/* Overlay Layar Informasi Akun */}
      {currentScreen === 'account_info' && (
        <View style={StyleSheet.absoluteFill}>
          <AccountInfoScreen onBack={navigateBack} />
        </View>
      )}

      {/* Overlay Layar Produk Saya */}
      {currentScreen === 'user_products' && (
        <View style={StyleSheet.absoluteFill}>
          <UserProductsScreen
            onBack={navigateBack}
            onSelectProduct={handleSelectProduct}
          />
        </View>
      )}

      {/* Overlay Layar Acara Saya */}
      {currentScreen === 'user_events' && (
        <View style={StyleSheet.absoluteFill}>
          <UserEventsScreen
            onBack={navigateBack}
            onSelectEvent={handleSelectEvent}
          />
        </View>
      )}

      {/* Overlay Layar Kotak Masuk */}
      {currentScreen === 'inbox' && (
        <View style={StyleSheet.absoluteFill}>
          <InboxScreen onBack={navigateBack} />
        </View>
      )}

      {/* Overlay Layar Bahasa */}
      {currentScreen === 'language' && (
        <View style={StyleSheet.absoluteFill}>
          <LanguageScreen onBack={navigateBack} />
        </View>
      )}

      {/* Overlay Layar Detail Produk */}
      {currentScreen === 'product_detail' && selectedProduct && (
        <View style={StyleSheet.absoluteFill}>
          <ProductDetailScreen
            product={selectedProduct}
            onBack={navigateBack}
          />
        </View>
      )}

      {/* Overlay Layar Detail Acara */}
      {currentScreen === 'event_detail' && selectedEvent && (
        <View style={StyleSheet.absoluteFill}>
          <EventDetailScreen
            event={selectedEvent}
            onBack={navigateBack}
          />
        </View>
      )}

      {/* ─── Modal Pembaruan Aplikasi Otomatis (Real Firestore Data) ─── */}
      {updateInfo && (
        <AppUpdateModal
          visible={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          latestVersion={updateInfo.latestVersion}
          currentVersion={updateInfo.currentVersion}
          downloadUrl={updateInfo.downloadUrl}
          releaseNotes={updateInfo.releaseNotes}
          forceUpdate={updateInfo.forceUpdate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppNavigator;
