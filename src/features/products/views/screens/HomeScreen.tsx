import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WhiteTopSafeArea, { useTopInset } from '../../../../shared/components/WhiteTopSafeArea';
import { Product, ProductCategory } from '../../models/Product.model';
import { EventItem, EventCategory } from '../../../events/models/Event.model';
import { useProductController, ProductSortOption } from '../../controllers/product.controller';
import { useEventController, EventSortOption } from '../../../events/controllers/event.controller';
import { useAuthController } from '../../../auth/controllers/auth.controller';
import { useVillageController } from '../../../village/controllers/village.controller';
import ProductCard from '../components/ProductCard';
import EventCard from '../../../events/views/components/EventCard';
import UserProfileScreen from '../../../auth/views/screens/UserProfileScreen';
import LoginModal from '../../../auth/views/LoginModal';
import AddProductModal from '../components/AddProductModal';
import AddEventModal from '../../../events/views/components/AddEventModal';
import FilterModal from '../../../../shared/components/FilterModal';
import { ProductGridSkeleton, EventListSkeleton } from '../../../../shared/components/Skeleton';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { useTranslation } from '../../../../shared/localization';
import ProductIcon from '../../../../assets/icons/product.svg';
import CalendarIcon from '../../../../assets/icons/calendar.svg';
import UserIcon from '../../../../assets/icons/user.svg';
import SearchIcon from '../../../../assets/icons/search.svg';
import FilterIcon from '../../../../assets/icons/filter.svg';

interface Props {
  onSelectProduct: (product: Product) => void;
  onSelectEvent: (event: EventItem) => void;
  onNavigateToAccountInfo?: () => void;
  onNavigateToProducts?: () => void;
  onNavigateToEvents?: () => void;
  onNavigateToInbox?: () => void;
  onNavigateToLanguage?: () => void;
}

type BottomTab = 'products' | 'events' | 'profile';

const APPBAR_HEIGHT = 64;
const SEARCH_ROW_HEIGHT = 56;
const TOTAL_HEADER_HEIGHT = APPBAR_HEIGHT + SEARCH_ROW_HEIGHT;

/**
 * HomeScreen View
 * - Collapsing Appbar: ter-scroll ke atas saat scroll ke bawah
 * - Sticky Search Bar & Filter: tetap statis di paling atas saat scroll
 * - Ikon SVG Search & Filter dengan deteksi aktif dinamis
 * - Filter & Urutkan via Bottom Sheet Modal
 * - Bottom Navigation Bar dengan SVG & Terjemahan Multibahasa Dinamis
 */
const HomeScreen: React.FC<Props> = ({
  onSelectProduct,
  onSelectEvent,
  onNavigateToAccountInfo,
  onNavigateToProducts,
  onNavigateToEvents,
  onNavigateToInbox,
  onNavigateToLanguage,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = useTopInset();
  const { t } = useTranslation();
  const [productState, productActions] = useProductController();
  const [eventState, eventActions] = useEventController();
  const [authState, authActions] = useAuthController();
  const [villageState] = useVillageController();

  const villageName =
    villageState.profile.villageName && villageState.profile.villageName !== 'Desa Dlemer'
      ? villageState.profile.villageName
      : t.common.appName;
  const accountOwner =
    authState.userProfile?.displayName ||
    authState.user?.displayName ||
    t.appbar.guest;

  // Tab Navigasi Bawah: 'products' | 'events' | 'profile'
  const [activeTab, setActiveTab] = useState<BottomTab>('products');

  // State Search, Kategori & Sort Produk
  const [productSearch, setProductSearch] = useState('');
  const [activeProductCategory, setActiveProductCategory] = useState<ProductCategory>('Semua');
  const [productSort, setProductSort] = useState<ProductSortOption>('newest');

  // State Search, Kategori & Sort Acara
  const [eventSearch, setEventSearch] = useState('');
  const [activeEventCategory, setActiveEventCategory] = useState<EventCategory>('Semua');
  const [eventSort, setEventSort] = useState<EventSortOption>('newest');

  // State Modal Filter & Tambah
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [addEventModalVisible, setAddEventModalVisible] = useState(false);

  // Status Filter Aktif
  const isProductFilterActive =
    activeProductCategory !== 'Semua' || productSort !== 'newest';
  const isEventFilterActive =
    activeEventCategory !== 'Semua' || eventSort !== 'newest';
  const isFilterActive =
    activeTab === 'products' ? isProductFilterActive : isEventFilterActive;

  // Animasi Scroll untuk Collapsing Appbar & Sticky Search Bar
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, APPBAR_HEIGHT],
    outputRange: [0, -APPBAR_HEIGHT],
    extrapolate: 'clamp',
  });

  // Reset scroll animasi saat berganti tab
  useEffect(() => {
    scrollY.setValue(0);
  }, [activeTab, scrollY]);

  // Fetch data awal
  useEffect(() => {
    productActions.fetchProducts();
    eventActions.fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter & Sort Produk
  useEffect(() => {
    productActions.applyFilter(productSearch, activeProductCategory, productSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSearch, activeProductCategory, productSort, productState.products]);

  // Filter & Sort Acara
  useEffect(() => {
    eventActions.applyFilter(eventSearch, activeEventCategory, eventSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSearch, activeEventCategory, eventSort, eventState.events]);

  // Tutup Login Modal jika user berhasil login
  useEffect(() => {
    if (authState.user) {
      setLoginModalVisible(false);
    }
  }, [authState.user]);

  // Handler Terapkan Filter
  const handleApplyFilter = (category: string, sort: string) => {
    if (activeTab === 'products') {
      setActiveProductCategory(category as ProductCategory);
      setProductSort(sort as ProductSortOption);
    } else {
      setActiveEventCategory(category as EventCategory);
      setEventSort(sort as EventSortOption);
    }
  };

  // Handler Reset Filter
  const handleResetFilter = () => {
    if (activeTab === 'products') {
      setActiveProductCategory('Semua');
      setProductSort('newest');
    } else {
      setActiveEventCategory('Semua');
      setEventSort('newest');
    }
  };

  // Handler Klik Floating Action Button (+)
  const handleFabPress = () => {
    if (!authState.user) {
      setLoginModalVisible(true);
    } else {
      if (activeTab === 'products') {
        setAddProductModalVisible(true);
      } else if (activeTab === 'events') {
        setAddEventModalVisible(true);
      }
    }
  };

  // Submit Produk
  const handleAddProductSubmit = async (newProductData: {
    name: string;
    category: ProductCategory;
    price: number;
    stock: number;
    description: string;
    imageUrl: string;
    images?: string[];
    whatsappLink: string;
  }) => {
    if (!authState.user) {
      return false;
    }
    return await productActions.addProduct(newProductData, authState.user.uid);
  };

  // Submit Acara
  const handleAddEventSubmit = async (newEventData: {
    title: string;
    category: EventCategory;
    organizer: string;
    date: number;
    endDate?: number;
    location: string;
    description: string;
    imageUrl: string;
    images?: string[];
  }) => {
    if (!authState.user) {
      return false;
    }
    return await eventActions.addEvent(newEventData, authState.user.uid);
  };

  // Refresh handler
  const handleRefresh = () => {
    if (activeTab === 'products') {
      productActions.onRefresh();
    } else if (activeTab === 'events') {
      eventActions.onRefresh();
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <WhiteTopSafeArea zIndex={100} elevation={0} />

      {/* ─── Top Header Section (Collapsing Appbar + Sticky Search Bar) ─── */}
      {activeTab === 'profile' ? (
        <View style={styles.profileAppBar}>
          <Text style={styles.profileAppBarTitle}>{t.profile.title}</Text>
        </View>
      ) : (
        <Animated.View
          style={[
            styles.headerWrapper,
            {
              top: topInset,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          {/* 1. Appbar: Ter-scroll ke atas dan menghilang saat scroll ke bawah */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerGreeting}>
                {t.appbar.welcome} {villageName}
              </Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {accountOwner}
              </Text>
            </View>

            {/* Action Header */}
            {authState.user ? (
              <TouchableOpacity
                style={styles.avatarHeaderBtn}
                onPress={() => setActiveTab('profile')}
                activeOpacity={0.8}
              >
                {authState.user.photoURL ? (
                  <Image
                    source={{ uri: authState.user.photoURL }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {authState.user.displayName
                        ? authState.user.displayName.charAt(0).toUpperCase()
                        : 'U'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signInHeaderBtn}
                onPress={() => setLoginModalVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.signInHeaderBtnText}>{t.appbar.signIn}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 2. Search Bar + Tombol Filter (Statis di atas saat di-scroll) */}
          <View style={styles.searchFilterRow}>
            {/* Search Box dengan Ikon SVG Search */}
            <View style={styles.searchBox}>
              <SearchIcon
                width={18}
                height={18}
                stroke={Colors.textMuted}
                color={Colors.textMuted}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={
                  activeTab === 'products'
                    ? t.search.searchProductsPlaceholder
                    : t.search.searchEventsPlaceholder
                }
                placeholderTextColor={Colors.textMuted}
                value={activeTab === 'products' ? productSearch : eventSearch}
                onChangeText={
                  activeTab === 'products' ? setProductSearch : setEventSearch
                }
              />
              {(activeTab === 'products' ? productSearch : eventSearch).length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    activeTab === 'products'
                      ? setProductSearch('')
                      : setEventSearch('')
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tombol Filter SVG */}
            <TouchableOpacity
              style={[
                styles.filterBtn,
                isFilterActive && styles.filterBtnActive,
              ]}
              onPress={() => setFilterModalVisible(true)}
              activeOpacity={0.8}
            >
              <FilterIcon
                width={20}
                height={20}
                color={isFilterActive ? Colors.primary : '#0F172A'}
                fill={isFilterActive ? Colors.primary : '#0F172A'}
              />
              {isFilterActive && <View style={styles.filterActiveDot} />}
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ─── Content Tab Panels ─────────────────── */}
      <View style={{ flex: 1 }}>
        {/* Tab 1: Produk UMKM */}
        {activeTab === 'products' && (
          productState.loading && productState.products.length === 0 ? (
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: TOTAL_HEADER_HEIGHT + 6 }}
            >
              <ProductGridSkeleton paddingTop={0} count={6} />
            </ScrollView>
          ) : productState.filtered.length === 0 ? (
            <View style={[styles.emptyContainer, { marginTop: TOTAL_HEADER_HEIGHT + 20 }]}>
              <Text style={styles.emptyTitle}>{t.products.emptyTitle}</Text>
              <Text style={styles.emptySubtitle}>
                {t.products.emptySubtitle}
              </Text>
            </View>
          ) : (
            <Animated.FlatList
              key="products-grid"
              data={productState.filtered}
              numColumns={2}
              keyExtractor={item => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={[
                styles.productGrid,
                {
                  paddingTop: TOTAL_HEADER_HEIGHT + 6,
                  paddingBottom: insets.bottom + 105,
                },
              ]}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={productState.refreshing}
                  onRefresh={handleRefresh}
                  colors={[Colors.primary]}
                  progressViewOffset={TOTAL_HEADER_HEIGHT + 8}
                />
              }
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={onSelectProduct} />
              )}
            />
          )
        )}

        {/* Tab 2: Acara Desa */}
        {activeTab === 'events' && (
          eventState.loading && eventState.events.length === 0 ? (
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: TOTAL_HEADER_HEIGHT + 6 }}
            >
              <EventListSkeleton paddingTop={0} count={3} />
            </ScrollView>
          ) : eventState.filtered.length === 0 ? (
            <View style={[styles.emptyContainer, { marginTop: TOTAL_HEADER_HEIGHT + 20 }]}>
              <Text style={styles.emptyTitle}>{t.events.emptyTitle}</Text>
              <Text style={styles.emptySubtitle}>
                {t.events.emptySubtitle}
              </Text>
            </View>
          ) : (
            <Animated.FlatList
              key="events-list"
              data={eventState.filtered}
              keyExtractor={item => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={[
                styles.eventList,
                {
                  paddingTop: TOTAL_HEADER_HEIGHT + 6,
                  paddingBottom: insets.bottom + 105,
                },
              ]}
              showsVerticalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={eventState.refreshing}
                  onRefresh={handleRefresh}
                  colors={[Colors.primary]}
                  progressViewOffset={TOTAL_HEADER_HEIGHT + 8}
                />
              }
              renderItem={({ item }) => (
                <EventCard event={item} onPress={onSelectEvent} />
              )}
            />
          )
        )}

        {/* Tab 3: Profil User */}
        {activeTab === 'profile' && (
          <UserProfileScreen
            onOpenLogin={() => setLoginModalVisible(true)}
            onNavigateToAccountInfo={onNavigateToAccountInfo}
            onNavigateToProducts={onNavigateToProducts}
            onNavigateToEvents={onNavigateToEvents}
            onNavigateToInbox={onNavigateToInbox}
            onNavigateToLanguage={onNavigateToLanguage}
          />
        )}
      </View>

      {/* ─── Floating Action Button (+) ─────────── */}
      {activeTab !== 'profile' && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 85 }]}
          onPress={handleFabPress}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* ─── Bottom Navigation Bar ──────────────── */}
      <View
        style={[
          styles.bottomNav,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('products')}
          activeOpacity={0.7}
        >
          <ProductIcon
            width={24}
            height={24}
            stroke={activeTab === 'products' ? Colors.primary : Colors.textSecondary}
            color={activeTab === 'products' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'products' && styles.navLabelActive,
            ]}
          >
            {t.tabs.products}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('events')}
          activeOpacity={0.7}
        >
          <CalendarIcon
            width={24}
            height={24}
            stroke={activeTab === 'events' ? Colors.primary : Colors.textSecondary}
            color={activeTab === 'events' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'events' && styles.navLabelActive,
            ]}
          >
            {t.tabs.events}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <UserIcon
            width={24}
            height={24}
            stroke={activeTab === 'profile' ? Colors.primary : Colors.textSecondary}
            color={activeTab === 'profile' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'profile' && styles.navLabelActive,
            ]}
          >
            {t.tabs.profile}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Modals ─────────────────────────────── */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        type={activeTab === 'products' ? 'products' : 'events'}
        currentCategory={
          activeTab === 'products' ? activeProductCategory : activeEventCategory
        }
        currentSort={activeTab === 'products' ? productSort : eventSort}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />

      <LoginModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onGoogleSignIn={authActions.signInWithGoogle}
        authenticating={authState.authenticating}
        error={authState.error}
      />

      <AddProductModal
        visible={addProductModalVisible}
        onClose={() => setAddProductModalVisible(false)}
        onSubmit={handleAddProductSubmit}
      />

      <AddEventModal
        visible={addEventModalVisible}
        onClose={() => setAddEventModalVisible(false)}
        onSubmit={handleAddEventSubmit}
      />
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
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  profileAppBar: {
    height: 56,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  profileAppBarTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.white,
    elevation: 0,
  },
  header: {
    height: APPBAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },
  headerLeft: {
    flex: 1,
  },
  headerGreeting: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 19,
    color: Colors.textPrimary,
  },
  avatarHeaderBtn: {
    padding: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: Fonts.bold,
    color: Colors.primaryDark,
    fontSize: 15,
  },
  signInHeaderBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  signInHeaderBtnText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 12,
  },
  searchFilterRow: {
    height: SEARCH_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: Colors.white,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    fontFamily: Fonts.regular,
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    marginLeft: 8,
    paddingVertical: 0,
  },
  clearIcon: {
    fontFamily: Fonts.bold,
    color: Colors.textMuted,
    fontSize: 14,
    padding: 4,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterActiveDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  productGrid: {
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
  },
  eventList: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 10,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.white,
    lineHeight: 30,
    fontWeight: '300',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  navLabelActive: {
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
});

export default HomeScreen;
