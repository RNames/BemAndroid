import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductController } from '../../controllers/product.controller';
import { useAuthController } from '../../../auth/controllers/auth.controller';
import { Product, ProductCategory } from '../../models/Product.model';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { formatPrice } from '../../../../shared/utils/format.utils';
import { useTranslation } from '../../../../shared/localization';
import ArrowLeftIcon from '../../../../assets/icons/arrow_left.svg';
import AddProductModal from '../components/AddProductModal';

interface Props {
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

/**
 * UserProductsScreen
 * Displays list of MSME products registered by the current user
 */
const UserProductsScreen: React.FC<Props> = ({ onBack, onSelectProduct }) => {
  const insets = useSafeAreaInsets();
  const { t, translateCategory } = useTranslation();
  const [productState, productActions] = useProductController();
  const [authState] = useAuthController();
  const [addModalVisible, setAddModalVisible] = useState(false);

  const myProducts = productState.products.filter(
    p => p.createdBy === authState.user?.uid,
  );

  const handleAddProductSubmit = async (newProductData: {
    name: string;
    category: ProductCategory;
    price: number;
    stock: number;
    description: string;
    imageUrl: string;
    whatsappLink: string;
  }) => {
    if (!authState.user) {
      Alert.alert(t.common.notice, 'Please sign in to your account first.');
      return false;
    }
    return await productActions.addProduct(newProductData, authState.user.uid);
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isApproved = item.approved;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => onSelectProduct(item)}
        activeOpacity={0.8}
      >
        {/* Product Image */}
        <View style={styles.imageWrapper}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Product Photo</Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{translateCategory(item.category)}</Text>
            <View
              style={[
                styles.statusBadge,
                isApproved ? styles.statusApproved : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isApproved ? styles.statusApprovedText : styles.statusPendingText,
                ]}
              >
                {isApproved ? t.products.approved : t.products.pending}
              </Text>
            </View>
          </View>

          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{t.products.stock}: {item.stock} pcs</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* ─── Top AppBar ──────────────────────────────── */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.appBarBackBtn}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon width={22} height={22} fill="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.appBarTitle}>{t.products.title}</Text>

        <View style={styles.appBarRightSpacer} />
      </View>

      {/* ─── Summary & Action Bar ───────────────────── */}
      <View style={styles.summaryBar}>
        <View>
          <Text style={styles.summaryTitle}>{t.products.title}</Text>
          <Text style={styles.summarySubtitle}>
            {myProducts.length} {t.products.summary}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ {t.common.all === 'All' ? 'Add' : 'Tambah'}</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Product List ────────────────────────────── */}
      <FlatList
        data={myProducts}
        keyExtractor={item => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 40 },
          myProducts.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={productState.refreshing}
            onRefresh={productActions.onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>🛍️</Text>
            </View>
            <Text style={styles.emptyTitle}>{t.products.emptyMyProductsTitle}</Text>
            <Text style={styles.emptySubtitle}>
              {t.products.emptyMyProductsSubtitle}
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => setAddModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyAddBtnText}>{t.products.add}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <AddProductModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={handleAddProductSubmit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
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
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    marginHorizontal: 10,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  summarySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 6,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  imagePlaceholderText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusApproved: {
    backgroundColor: '#E8F8EE',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
  },
  statusApprovedText: {
    color: '#15803D',
  },
  statusPendingText: {
    color: '#D97706',
  },
  productName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  productPrice: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyAddBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.white,
  },
});

export default UserProductsScreen;
