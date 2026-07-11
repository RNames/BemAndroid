import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product, ProductCategory, PRODUCT_CATEGORIES } from '../../models/Product.model';
import { useProductController } from '../../controllers/product.controller';
import ProductCard from '../components/ProductCard';
import { Colors } from '../../../../shared/constants/colors';

interface Props {
  onSelectProduct: (product: Product) => void;
}

/**
 * HomeScreen View
 * Menampilkan daftar produk dalam grid 2 kolom
 * Semua logika data dihandle oleh useProductController
 */
const HomeScreen: React.FC<Props> = ({ onSelectProduct }) => {
  const [state, actions] = useProductController();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('Semua');

  // Fetch data saat pertama kali load
  useEffect(() => {
    actions.fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-filter setiap kali search atau kategori berubah
  useEffect(() => {
    actions.applyFilter(search, activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeCategory, state.products]);

  // ─── Loading State ───────────────────────────────────
  if (state.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat produk...</Text>
      </View>
    );
  }

  // ─── Error State ─────────────────────────────────────
  if (state.error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Gagal memuat produk</Text>
        <Text style={styles.errorMsg}>{state.error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={actions.fetchProducts}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* ─── Header ─────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Selamat Datang 👋</Text>
          <Text style={styles.headerTitle}>Produk Desa Kwanyar</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{state.products.length} Produk</Text>
        </View>
      </View>

      {/* ─── Search Bar ─────────────────────────── */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Category Filter ────────────────────── */}
      <FlatList
        data={PRODUCT_CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategory === item && styles.categoryChipActive,
            ]}
            onPress={() => setActiveCategory(item)}
          >
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === item && styles.categoryChipTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* ─── Product Grid ───────────────────────── */}
      {state.filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛍️</Text>
          <Text style={styles.emptyTitle}>Produk tidak ditemukan</Text>
          <Text style={styles.emptySubtitle}>Coba kata kunci atau kategori lain</Text>
        </View>
      ) : (
        <FlatList
          data={state.filtered}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.productGrid}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={state.refreshing}
              onRefresh={actions.onRefresh}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={onSelectProduct} />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorEmoji: { fontSize: 48, marginBottom: 8 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  errorMsg: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: Colors.white, fontWeight: '700' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerGreeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerBadgeText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearIcon: { fontSize: 14, color: Colors.textMuted, paddingHorizontal: 4 },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: { color: Colors.white },
  productGrid: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  columnWrapper: { justifyContent: 'space-between' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.textMuted },
});

export default HomeScreen;
