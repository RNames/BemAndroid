import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Product } from '../../models/Product.model';
import { Colors } from '../../../../shared/constants/colors';
import { formatPrice } from '../../../../shared/utils/format.utils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Props {
  product: Product;
  onPress: (product: Product) => void;
}

/**
 * ProductCard View Component
 * Menampilkan satu produk dalam grid dengan gambar, kategori, nama, harga, stok
 */
const ProductCard: React.FC<Props> = ({ product, onPress }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(product)}
      activeOpacity={0.85}
    >
      {/* Gambar Produk */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Badge Stok Habis */}
        {isOutOfStock && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>Habis</Text>
          </View>
        )}

        {/* Badge Kategori */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText} numberOfLines={1}>
            {product.category}
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
            {isOutOfStock ? 'Stok habis' : `Stok: ${product.stock}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 0.9,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.danger,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stockBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(30,30,60,0.65)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: CARD_WIDTH - 24,
  },
  categoryBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 18,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
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
    fontSize: 11,
    color: Colors.textSecondary,
  },
  stockTextEmpty: {
    color: Colors.textMuted,
  },
});

export default ProductCard;
