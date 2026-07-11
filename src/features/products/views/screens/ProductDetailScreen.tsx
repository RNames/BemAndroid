import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product } from '../../models/Product.model';
import { Colors } from '../../../../shared/constants/colors';
import { formatPrice } from '../../../../shared/utils/format.utils';

const { width } = Dimensions.get('window');

interface Props {
  product: Product;
  onBack: () => void;
}

/**
 * ProductDetailScreen View
 * Menampilkan detail lengkap satu produk:
 * - Hero image, nama, kategori, harga, stok, deskripsi
 * - Tombol WhatsApp untuk menghubungi penjual
 */
const ProductDetailScreen: React.FC<Props> = ({ product, onBack }) => {
  const isOutOfStock = product.stock <= 0;

  const handleWhatsApp = async () => {
    const url = product.whatsappLink;
    try {
      // Langsung openURL — canOpenURL sering false di Android 11+ tanpa query permission
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Gagal Membuka WhatsApp',
        'Pastikan WhatsApp sudah terinstall dan link penjual valid.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      <ScrollView style={styles.scroll} bounces={false} showsVerticalScrollIndicator={false}>

        {/* ─── Hero Image ──────────────────────────── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Tombol Kembali */}
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          {/* Overlay Stok Habis */}
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>STOK HABIS</Text>
            </View>
          )}
        </View>

        {/* ─── Content Card ────────────────────────── */}
        <View style={styles.contentCard}>

          {/* Kategori */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>🏷️ {product.category}</Text>
            </View>
          </View>

          {/* Nama Produk */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Harga */}
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Harga</Text>
            <Text style={styles.priceValue}>{formatPrice(product.price)}</Text>
          </View>

          <View style={styles.divider} />

          {/* ─── Info Grid ───────────────────────── */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📦</Text>
              <Text style={styles.infoLabel}>Stok</Text>
              <Text style={[styles.infoValue, isOutOfStock && styles.infoValueRed]}>
                {isOutOfStock ? 'Habis' : `${product.stock} pcs`}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🏪</Text>
              <Text style={styles.infoLabel}>Kategori</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {product.category}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>✅</Text>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, styles.infoValueGreen]}>
                {product.approved ? 'Aktif' : 'Tidak Aktif'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ─── Deskripsi ───────────────────────── */}
          <View style={styles.descSection}>
            <Text style={styles.descTitle}>📝 Deskripsi Produk</Text>
            <Text style={styles.descText}>
              {product.description?.trim() || 'Belum ada deskripsi untuk produk ini.'}
            </Text>
          </View>

          {/* Spacer untuk floating button */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* ─── Floating WhatsApp Button ──────────────── */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPriceLabel}>Total</Text>
          <Text style={styles.bottomPrice}>{formatPrice(product.price)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.waButton, isOutOfStock && styles.waButtonDisabled]}
          onPress={handleWhatsApp}
          disabled={isOutOfStock}
          activeOpacity={0.85}
        >
          <Text style={styles.waIcon}>💬</Text>
          <Text style={styles.waButtonText}>
            {isOutOfStock ? 'Stok Habis' : 'Hubungi Penjual'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },

  // Hero
  heroContainer: {
    width: '100%',
    height: width * 0.85,
    position: 'relative',
  },
  heroImage: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backIcon: { fontSize: 20, color: Colors.textPrimary, fontWeight: '700' },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
  },

  // Content Card
  contentCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingHorizontal: 20,
    paddingTop: 24,
    flex: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  categoryRow: { flexDirection: 'row', marginBottom: 12 },
  categoryPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryPillText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  productName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  priceLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  priceValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 20 },

  // Info Grid
  infoGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  infoItem: { alignItems: 'center', flex: 1, gap: 4 },
  infoIcon: { fontSize: 24, marginBottom: 4 },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  infoValueRed: { color: Colors.danger },
  infoValueGreen: { color: Colors.primary },

  // Description
  descSection: { gap: 10 },
  descTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  descText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bottomPriceContainer: { flex: 1 },
  bottomPriceLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  bottomPrice: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  waButton: {
    flex: 2,
    backgroundColor: Colors.whatsapp,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    elevation: 4,
    shadowColor: Colors.whatsapp,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  waButtonDisabled: { backgroundColor: Colors.stockEmpty, shadowColor: 'transparent' },
  waIcon: { fontSize: 18 },
  waButtonText: { color: Colors.white, fontSize: 15, fontWeight: '800' },
});

export default ProductDetailScreen;
