import React, { useState } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WhiteTopSafeArea from '../../../../shared/components/WhiteTopSafeArea';
import { Product } from '../../models/Product.model';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { formatPrice } from '../../../../shared/utils/format.utils';
import { useTranslation } from '../../../../shared/localization';
import ArrowLeftIcon from '../../../../assets/icons/arrow_left.svg';

const { width } = Dimensions.get('window');

interface Props {
  product: Product;
  onBack: () => void;
}

/**
 * ProductDetailScreen View
 * Menampilkan detail lengkap satu produk:
 * - Hero image carousel (multi-gambar) / single image
 * - Nama, kategori, harga, stok, deskripsi
 * - Tombol WhatsApp untuk menghubungi penjual
 */
const ProductDetailScreen: React.FC<Props> = ({ product, onBack }) => {
  const insets = useSafeAreaInsets();
  const { t, translateCategory } = useTranslation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const isOutOfStock = product.stock <= 0;

  // Backward compatibility: prioritaskan images array jika ada, jika tidak gunakan imageUrl
  const productImages: string[] =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : [];

  const handleWhatsApp = async () => {
    const url = product.whatsappLink;
    try {
      // Langsung openURL — canOpenURL sering false di Android 11+ tanpa query permission
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        t.common.error,
        'Please ensure WhatsApp is installed and the seller link is valid.',
      );
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <WhiteTopSafeArea />

      {/* ─── Top Appbar Putih ────────────────────── */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.appBarBackBtn}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon width={22} height={22} fill="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.appBarTitle}>{t.products.productDetails}</Text>

        {/* Placeholder penyeimbang layout kanan */}
        <View style={styles.appBarRightSpacer} />
      </View>

      <ScrollView style={styles.scroll} bounces={false} showsVerticalScrollIndicator={false}>

        {/* ─── Hero Image Carousel ─────────────────── */}
        <View style={styles.heroContainer}>
          {productImages.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => {
                const offsetX = e.nativeEvent.contentOffset.x;
                const index = Math.round(offsetX / width);
                setActiveImageIndex(index);
              }}
              style={styles.carouselScroll}
            >
              {productImages.map((uri, index) => (
                <Image
                  key={`${uri}-${index}`}
                  source={{ uri }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={styles.heroPlaceholderText}>📷</Text>
            </View>
          )}

          {/* Dots Pagination */}
          {productImages.length > 1 && (
            <View style={styles.paginationDots} pointerEvents="none">
              {productImages.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    activeImageIndex === i ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Counter Badge (1/3) */}
          {productImages.length > 1 && (
            <View style={styles.imageCounterBadge} pointerEvents="none">
              <Text style={styles.imageCounterText}>
                {activeImageIndex + 1}/{productImages.length}
              </Text>
            </View>
          )}

          {/* Overlay Stok Habis */}
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay} pointerEvents="none">
              <Text style={styles.outOfStockText}>{t.products.outOfStockBadge}</Text>
            </View>
          )}
        </View>

        {/* ─── Content Card ────────────────────────── */}
        <View style={styles.contentCard}>

          {/* Kategori */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{translateCategory(product.category)}</Text>
            </View>
          </View>

          {/* Nama Produk */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>{t.products.price}</Text>
            <Text style={styles.priceValue}>{formatPrice(product.price)}</Text>
          </View>

          {/* ─── Info Grid / Card ───────────────────────── */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t.products.stock}</Text>
              <Text style={[styles.infoValue, isOutOfStock && styles.infoValueRed]}>
                {isOutOfStock ? t.products.outOfStock : `${product.stock} pcs`}
              </Text>
            </View>
            <View style={styles.infoDividerVertical} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t.products.category}</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {translateCategory(product.category)}
              </Text>
            </View>
            <View style={styles.infoDividerVertical} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t.products.status}</Text>
              <Text style={[styles.infoValue, styles.infoValueGreen]}>
                {product.approved ? t.products.active : t.products.pending}
              </Text>
            </View>
          </View>

          {/* ─── Description Card ───────────────────────── */}
          <View style={styles.descSection}>
            <Text style={styles.descTitle}>{t.products.description}</Text>
            <Text style={styles.descText}>
              {product.description?.trim() || t.products.noDescription}
            </Text>
          </View>

          {/* Spacer untuk floating button */}
          <View style={{ height: insets.bottom + 110 }} />
        </View>
      </ScrollView>

      {/* ─── Floating WhatsApp Button dengan Safe Area Bottom Inset ─── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 20) }]}>
        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPriceLabel}>{t.products.price}</Text>
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
            {isOutOfStock ? t.products.outOfStock : t.products.contactSeller}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  appBar: {
    height: 56,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  appBarBackBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  appBarTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  appBarRightSpacer: {
    width: 40,
  },
  scroll: { flex: 1, backgroundColor: Colors.background },

  // Hero Carousel
  heroContainer: {
    width: '100%',
    height: width * 0.85,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  carouselScroll: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: width,
    height: '100%',
  },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  heroPlaceholderText: {
    fontSize: 48,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 38,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: Colors.white,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  imageCounterBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    fontFamily: Fonts.medium,
    color: Colors.white,
    fontSize: 12,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    fontFamily: Fonts.extraBold,
    color: Colors.white,
    fontSize: 28,
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
  categoryPillText: { fontFamily: Fonts.bold, color: Colors.primary, fontSize: 13 },
  productName: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  priceLabel: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.textSecondary },
  priceValue: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 20 },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 11,
  },
  infoDividerVertical: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  infoItem: { alignItems: 'center', flex: 1, gap: 4 },
  infoIcon: { fontSize: 24, marginBottom: 4 },
  infoLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.textPrimary, textAlign: 'center' },
  infoValueRed: { color: Colors.danger },
  infoValueGreen: { color: Colors.primary },

  // Description
  descSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  descTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.textPrimary },
  descText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

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
  bottomPriceLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  bottomPrice: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.textPrimary },
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
  waButtonText: { fontFamily: Fonts.bold, color: Colors.white, fontSize: 15 },
});

export default ProductDetailScreen;
