import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (width - 48) / 2;

interface SkeletonBoxProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * SkeletonBox
 * Komponen kotak placeholder dengan animasi denyut shimmer halus (opacity 0.35 -> 0.9)
 */
export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height,
  borderRadius = 6,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBox,
        {
          width: width as any,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

/**
 * ProductCardSkeleton
 * Placeholder 1 item kartu produk (2-column responsive)
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.productCard}>
      {/* Gambar Produk */}
      <SkeletonBox height={155} borderRadius={16} />

      {/* Konten Kartu */}
      <View style={styles.productContent}>
        {/* Kategori Badge */}
        <SkeletonBox width={65} height={18} borderRadius={6} style={{ marginBottom: 8 }} />
        {/* Judul Produk */}
        <SkeletonBox width="85%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
        {/* Harga */}
        <SkeletonBox width="60%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
        {/* Stok */}
        <SkeletonBox width={50} height={14} borderRadius={4} />
      </View>
    </View>
  );
};

/**
 * ProductGridSkeleton
 * Grid 2-kolom skeleton untuk produk
 */
export const ProductGridSkeleton: React.FC<{ count?: number; paddingTop?: number }> = ({
  count = 6,
  paddingTop = 135,
}) => {
  const items = Array.from({ length: count });

  return (
    <View style={[styles.productGridContainer, { paddingTop }]}>
      {items.map((_, index) => (
        <View key={index} style={{ width: PRODUCT_CARD_WIDTH, marginBottom: 14 }}>
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );
};

/**
 * EventCardSkeleton
 * Placeholder 1 item kartu acara (1-column full width)
 */
export const EventCardSkeleton: React.FC = () => {
  return (
    <View style={styles.eventCard}>
      {/* Banner Acara */}
      <SkeletonBox height={160} borderRadius={16} />

      {/* Info Acara */}
      <View style={styles.eventContent}>
        {/* Baris Badge Kategori & Tanggal */}
        <View style={styles.eventRowBetween}>
          <SkeletonBox width={85} height={20} borderRadius={6} />
          <SkeletonBox width={75} height={20} borderRadius={6} />
        </View>

        {/* Judul Acara */}
        <SkeletonBox width="90%" height={20} borderRadius={4} style={{ marginVertical: 10 }} />

        {/* Penyelenggara */}
        <SkeletonBox width="70%" height={15} borderRadius={4} style={{ marginBottom: 6 }} />

        {/* Waktu */}
        <SkeletonBox width="80%" height={15} borderRadius={4} style={{ marginBottom: 6 }} />

        {/* Lokasi */}
        <SkeletonBox width="60%" height={15} borderRadius={4} />
      </View>
    </View>
  );
};

/**
 * EventListSkeleton
 * List 1-kolom skeleton untuk acara
 */
export const EventListSkeleton: React.FC<{ count?: number; paddingTop?: number }> = ({
  count = 3,
  paddingTop = 135,
}) => {
  const items = Array.from({ length: count });

  return (
    <View style={[styles.eventListContainer, { paddingTop }]}>
      {items.map((_, index) => (
        <View key={index} style={{ marginBottom: 16 }}>
          <EventCardSkeleton />
        </View>
      ))}
    </View>
  );
};

/**
 * ProfileSkeleton
 * Placeholder untuk halaman profil pengguna saat mengambil data Firestore
 */
export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.profileSkeletonContainer}>
      {/* Header Profil Horizontal (Tanpa Card Background) */}
      <View style={styles.profileHeaderRow}>
        {/* Avatar Bulat di Kiri */}
        <SkeletonBox width={68} height={68} borderRadius={34} />

        {/* Informasi di Kanan */}
        <View style={{ flex: 1, marginLeft: 16 }}>
          <SkeletonBox width="65%" height={18} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonBox width="80%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
          <SkeletonBox width={100} height={20} borderRadius={10} style={{ marginBottom: 8 }} />
          <SkeletonBox width={90} height={26} borderRadius={13} />
        </View>
      </View>

      {/* Shelf Menu Items Memanjang */}
      <View style={{ marginTop: 24 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
          <View key={idx} style={styles.shelfSkeletonItem}>
            <SkeletonBox width={120} height={16} borderRadius={4} />
            <SkeletonBox width={12} height={12} borderRadius={6} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBox: {
    backgroundColor: '#E2E8F0',
  },
  productGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  productContent: {
    padding: 10,
  },
  eventListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  eventContent: {
    padding: 14,
  },
  eventRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSkeletonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  shelfSkeletonItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});
