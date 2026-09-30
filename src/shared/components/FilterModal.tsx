import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { PRODUCT_CATEGORIES } from '../../features/products/models/Product.model';
import { EVENT_CATEGORIES } from '../../features/events/models/Event.model';
import { useTranslation } from '../localization';

export interface SortItem {
  id: string;
  labelKey: 'sortNewest' | 'sortOldest' | 'sortNameAsc' | 'sortNameDesc' | 'sortPriceLow' | 'sortPriceHigh';
}

export const PRODUCT_SORTS: SortItem[] = [
  { id: 'newest', labelKey: 'sortNewest' },
  { id: 'oldest', labelKey: 'sortOldest' },
  { id: 'name_asc', labelKey: 'sortNameAsc' },
  { id: 'name_desc', labelKey: 'sortNameDesc' },
  { id: 'price_low', labelKey: 'sortPriceLow' },
  { id: 'price_high', labelKey: 'sortPriceHigh' },
];

export const EVENT_SORTS: SortItem[] = [
  { id: 'newest', labelKey: 'sortNewest' },
  { id: 'oldest', labelKey: 'sortOldest' },
  { id: 'name_asc', labelKey: 'sortNameAsc' },
  { id: 'name_desc', labelKey: 'sortNameDesc' },
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'products' | 'events';
  currentCategory: string;
  currentSort: string;
  onApply: (category: string, sort: string) => void;
  onReset: () => void;
}

/**
 * FilterModal Component
 * Menampilkan Bottom Sheet untuk memilih Kategori dan Pengurutan (Terbaru, Terlama, Abjad, dll.)
 */
const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  type,
  currentCategory,
  currentSort,
  onApply,
  onReset,
}) => {
  const insets = useSafeAreaInsets();
  const { t, translateCategory } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedSort, setSelectedSort] = useState(currentSort);

  // Sinkronkan state lokal ketika modal dibuka
  useEffect(() => {
    if (visible) {
      setSelectedCategory(currentCategory);
      setSelectedSort(currentSort);
    }
  }, [visible, currentCategory, currentSort]);

  const categories = type === 'products' ? PRODUCT_CATEGORIES : EVENT_CATEGORIES;
  const sortOptions = type === 'products' ? PRODUCT_SORTS : EVENT_SORTS;

  const handleReset = () => {
    setSelectedCategory('Semua');
    setSelectedSort('newest');
    onReset();
    onClose();
  };

  const handleApply = () => {
    onApply(selectedCategory, selectedSort);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop klik untuk tutup */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
        >
          {/* Handle bar atas */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t.filter.title}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
                <Text style={styles.resetText}>{t.filter.reset}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Category Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {type === 'products' ? t.filter.typeProducts : t.filter.typeEvents}
              </Text>
              <View style={styles.chipsContainer}>
                {categories.map(cat => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {translateCategory(cat)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Sort Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.filter.sortBy}</Text>
              <View style={styles.chipsContainer}>
                {sortOptions.map(sort => {
                  const isSelected = selectedSort === sort.id;
                  const label = t.filter[sort.labelKey];
                  return (
                    <TouchableOpacity
                      key={sort.id}
                      style={[
                        styles.sortChip,
                        isSelected && styles.sortChipSelected,
                      ]}
                      onPress={() => setSelectedSort(sort.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.sortChipText,
                          isSelected && styles.sortChipTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.85}
            >
              <Text style={styles.applyBtnText}>{t.filter.apply}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  resetText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.danger,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    fontFamily: Fonts.bold,
    color: Colors.primaryDark,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 2,
  },
  sortChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  sortChipText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sortChipTextSelected: {
    fontFamily: Fonts.bold,
    color: Colors.primaryDark,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  applyBtnText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 15,
  },
});

export default FilterModal;
