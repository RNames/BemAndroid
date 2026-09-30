import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Product } from '../../models/Product.model';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { formatPrice } from '../../../../shared/utils/format.utils';
import { useTranslation } from '../../../../shared/localization';

interface Props {
  product: Product;
  onPress: (product: Product) => void;
}

/**
 * ProductCard View Component
 * Menampilkan produk dalam grid 2 kolom dengan ukuran responsif dinamis
 */
const ProductCard: React.FC<Props> = ({ product, onPress }) => {
  const { width } = useWindowDimensions();
  const { t, translateCategory } = useTranslation();
  // 16 padding samping kanan & kiri (total 32) + 12 gap antar kolom = 44
  const cardWidth = Math.max(140, Math.floor((width - 44) / 2));
  const [imageError, setImageError] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const hasImage = Boolean(product.imageUrl) && !imageError;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => onPress(product)}
      activeOpacity={0.85}
    >
      {/* Gambar Produk */}
      <View style={[styles.imageContainer, { height: Math.floor(cardWidth * 0.95) }]}>
        {hasImage ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              {t.common.photoPlaceholderProduct}
            </Text>
          </View>
        )}

        {/* Badge Out of Stock */}
        {isOutOfStock && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>{t.products.outOfStock}</Text>
          </View>
        )}

        {/* Badge Kategori */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText} numberOfLines={1}>
            {translateCategory(product.category)}
          </Text>
        </View>
      </View>

      {/* Info Produk */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>

        {/* Indikator Stok */}
        <View style={styles.stockRow}>
          <View style={[styles.stockDot, isOutOfStock && styles.stockDotEmpty]} />
          <Text style={[styles.stockText, isOutOfStock && styles.stockTextEmpty]}>
            {isOutOfStock ? t.products.outOfStock : `${t.products.stock}: ${product.stock}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textMuted,
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.danger,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 2,
  },
  stockBadgeText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 10,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: '85%',
  },
  categoryBadgeText: {
    fontFamily: Fonts.semiBold,
    color: Colors.white,
    fontSize: 10,
  },
  info: {
    padding: 10,
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
    minHeight: 36, // Menjaga keseragaman tinggi baris produk
  },
  price: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 6,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  stockDotEmpty: {
    backgroundColor: Colors.stockEmpty,
  },
  stockText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  stockTextEmpty: {
    color: Colors.textMuted,
  },
});

export default ProductCard;
