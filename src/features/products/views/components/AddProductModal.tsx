import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { Product, ProductCategory, PRODUCT_CATEGORIES } from '../../models/Product.model';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { uploadImageToCloudinary } from '../../../../shared/services/cloudinary.service';
import { useTranslation } from '../../../../shared/localization';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (productData: {
    name: string;
    category: ProductCategory;
    price: number;
    stock: number;
    description: string;
    imageUrl: string;
    images?: string[];
    whatsappLink: string;
  }) => Promise<boolean>;
  initialData?: Product | null;
}

const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.filter(c => c !== 'Semua');

/**
 * AddProductModal Component
 * Modal form untuk mendaftarkan/mengedit produk UMKM:
 * - Mendukung multi-foto produk (galeri multi-selection & thumbnail preview)
 * - Header dengan tombol close bulat
 * - Label kolom yang seragam tanpa placeholder teks di input
 * - Dropdown kategori produk interaktif dengan icon checkmark
 * - Input box bernuansa #F8FAFC & border halus #E2E8F0
 * - Tombol submit hijau di dalam scroll view
 */
const AddProductModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const insets = useSafeAreaInsets();
  const { t, translateCategory } = useTranslation();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (visible && initialData) {
      setName(initialData.name || '');
      setCategory((initialData.category as ProductCategory) || '');
      setPrice(initialData.price !== undefined ? String(initialData.price) : '');
      setStock(initialData.stock !== undefined ? String(initialData.stock) : '1');
      setWhatsapp(initialData.whatsappLink || '');
      const initialImages =
        Array.isArray(initialData.images) && initialData.images.length > 0
          ? initialData.images
          : initialData.imageUrl
          ? [initialData.imageUrl]
          : [];
      setSelectedImageUris(initialImages);
      setDescription(initialData.description || '');
      setDropdownOpen(false);
    } else if (visible && !initialData) {
      resetForm();
    }
  }, [visible, initialData]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const resetForm = () => {
    setName('');
    setCategory('');
    setDropdownOpen(false);
    setPrice('');
    setStock('1');
    setWhatsapp('');
    setSelectedImageUris([]);
    setDescription('');
  };

  const forceClose = () => {
    resetForm();
    onClose();
  };

  const handleAttemptClose = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
      return;
    }

    const isFormDirty =
      name.trim().length > 0 ||
      category !== '' ||
      price.trim().length > 0 ||
      whatsapp.trim().length > 0 ||
      description.trim().length > 0 ||
      selectedImageUris.length > 0;

    if (isFormDirty) {
      Alert.alert(
        t.addProduct.discardTitle,
        t.addProduct.discardMessage,
        [
          { text: t.common.cancel, style: 'cancel' },
          { text: t.common.discard, style: 'destructive', onPress: forceClose },
        ],
      );
    } else {
      forceClose();
    }
  };

  // Handler Pilih Foto dari Galeri (Bisa memilih banyak foto)
  const handleSelectGalleryPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        selectionLimit: 0,
      },
      handlePickerResponse,
    );
  };

  const handlePickerResponse = (res: ImagePickerResponse) => {
    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert(t.common.error, res.errorMessage || 'Failed to select photo.');
      return;
    }
    if (res.assets && res.assets.length > 0) {
      const newUris = res.assets
        .map(a => a.uri)
        .filter((u): u is string => Boolean(u));
      setSelectedImageUris(prev => [...prev, ...newUris]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImageUris(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!name.trim()) {
      Alert.alert(t.addProduct.validationTitle, t.addProduct.validationName);
      return;
    }

    if (!category) {
      Alert.alert(t.addProduct.validationTitle, t.addProduct.validationCategory);
      return;
    }

    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert(t.addProduct.validationTitle, t.addProduct.validationPrice);
      return;
    }

    if (!whatsapp.trim()) {
      Alert.alert(t.addProduct.validationTitle, t.addProduct.validationWhatsapp);
      return;
    }

    try {
      setSubmitting(true);
      setUploadStatus(t.common.saving);

      // Unggah semua foto baru ke Cloudinary secara paralel (foto lama remote http tidak diunggah ulang)
      const uploadedImageUrls = await Promise.all(
        selectedImageUris.map(async uri => {
          if (uri.startsWith('http')) {
            return uri;
          }
          return await uploadImageToCloudinary(uri);
        }),
      );

      const primaryImageUrl =
        uploadedImageUrls[0] ||
        initialData?.imageUrl ||
        '';

      const success = await onSubmit({
        name: name.trim(),
        category,
        price: Number(price),
        stock: Number(stock) || 0,
        whatsappLink: whatsapp.trim(),
        imageUrl: primaryImageUrl,
        images: uploadedImageUrls,
        description: description.trim(),
      });

      if (success) {
        Alert.alert(
          t.common.success,
          initialData ? t.products.editSuccess : t.addProduct.successMessage,
        );
        forceClose();
      } else {
        Alert.alert(t.addProduct.failTitle, t.addProduct.failMessage);
      }
    } catch (err: any) {
      const msg = err?.message || t.addProduct.failMessage;
      Alert.alert(t.common.error, msg);
    } finally {
      setSubmitting(false);
      setUploadStatus('');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleAttemptClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header (Sama dengan AddEventModal) */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.headerTitle}>
            {initialData ? t.products.editProduct : t.addProduct.title}
          </Text>
          <TouchableOpacity onPress={handleAttemptClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Nama Produk */}
          <View style={styles.formItem}>
            <Text style={styles.fieldLabel}>{t.addProduct.nameLabel}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* 2. Dropdown Kategori Produk */}
          <View style={[styles.formItem, { zIndex: 100 }]}>
            <Text style={styles.fieldLabel}>{t.addProduct.categoryLabel}</Text>
            <TouchableOpacity
              style={[
                styles.dropdownTrigger,
                dropdownOpen && styles.dropdownTriggerActive,
              ]}
              onPress={() => setDropdownOpen(prev => !prev)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dropdownValue,
                  !category && styles.dropdownPlaceholder,
                ]}
              >
                {category ? translateCategory(category) : t.addProduct.categoryPlaceholder}
              </Text>
              <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownMenu}>
                {CATEGORY_OPTIONS.map((cat, idx) => {
                  const isSelected = category === cat;
                  const isLast = idx === CATEGORY_OPTIONS.length - 1;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.dropdownItem,
                        isSelected && styles.dropdownItemSelected,
                        !isLast && styles.dropdownItemBorder,
                      ]}
                      onPress={() => {
                        setCategory(cat);
                        setDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isSelected && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {translateCategory(cat)}
                      </Text>
                      {isSelected && <Text style={styles.checkmarkIcon}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* 3. Row Harga & Stok */}
          <View style={styles.formItem}>
            <View style={styles.row}>
              <View style={{ flex: 1.2, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>{t.addProduct.priceLabel}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{t.addProduct.stockLabel}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                />
              </View>
            </View>
          </View>

          {/* 4. Nomor WhatsApp Penjual */}
          <View style={styles.formItem}>
            <Text style={styles.fieldLabel}>{t.addProduct.whatsappLabel}</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={whatsapp}
              onChangeText={setWhatsapp}
            />
          </View>

          {/* 5. Foto Produk (Multi-Foto Galeri) */}
          <View style={styles.formItem}>
            <View style={styles.photoLabelRow}>
              <Text style={styles.fieldLabel}>{t.addProduct.photoLabel}</Text>
              {selectedImageUris.length > 0 && (
                <Text style={styles.photoCountText}>
                  {selectedImageUris.length} {t.products.summary || 'foto'}
                </Text>
              )}
            </View>

            {selectedImageUris.length > 0 ? (
              <View style={styles.multiImageContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.multiImageScroll}
                >
                  {selectedImageUris.map((uri, index) => (
                    <View key={`${uri}-${index}`} style={styles.multiImageCard}>
                      <Image
                        source={{ uri }}
                        style={styles.multiImageThumb}
                        resizeMode="cover"
                      />
                      {index === 0 && (
                        <View style={styles.primaryBadge} pointerEvents="none">
                          <Text style={styles.primaryBadgeText}>Utama</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.removeImageBadge}
                        onPress={() => handleRemoveImage(index)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.removeImageBadgeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Tombol Tambah Foto Lagi */}
                  <TouchableOpacity
                    style={styles.addMoreBtn}
                    onPress={handleSelectGalleryPhoto}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addMorePlus}>+</Text>
                    <Text style={styles.addMoreText}>Tambah</Text>
                  </TouchableOpacity>
                </ScrollView>
                <Text style={styles.multiImageHint}>
                  * Foto pertama akan dijadikan sampul utama
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.galleryUploadBtn}
                onPress={handleSelectGalleryPhoto}
                activeOpacity={0.8}
              >
                <Text style={styles.galleryUploadText}>{t.addProduct.galleryButton}</Text>
                <Text style={styles.galleryUploadSubtext}>Bisa pilih lebih dari satu foto</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 6. Deskripsi Produk */}
          <View style={styles.formItem}>
            <Text style={styles.fieldLabel}>{t.addProduct.descLabel}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Status Upload Info */}
          {uploadStatus ? (
            <View style={styles.statusBox}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.statusText}>{uploadStatus}</Text>
            </View>
          ) : null}

          {/* Tombol Simpan (Sama dengan AddEventModal) */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={Colors.white} />
                <Text style={styles.submitBtnText}>{t.common.saving}</Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>
                {initialData ? t.common.save : t.addProduct.submitBtn}
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  formItem: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    fontFamily: Fonts.regular,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  // Dropdown Styles (Sama dengan AddEventModal)
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  dropdownTriggerActive: {
    borderColor: Colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownValue: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dropdownPlaceholder: {
    color: Colors.textMuted,
  },
  dropdownArrow: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  dropdownMenu: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  dropdownItemText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dropdownItemTextSelected: {
    fontFamily: Fonts.bold,
    color: Colors.primaryDark,
  },
  checkmarkIcon: {
    fontFamily: Fonts.bold,
    color: Colors.primary,
    fontSize: 14,
  },
  photoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  photoCountText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
  },
  // Gallery Upload Button (Dashed, no icon)
  galleryUploadBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  galleryUploadText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  galleryUploadSubtext: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  // Multi Image Preview
  multiImageContainer: {
    marginTop: 2,
  },
  multiImageScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  multiImageCard: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  multiImageThumb: {
    width: '100%',
    height: '100%',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 9,
    color: Colors.white,
  },
  removeImageBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageBadgeText: {
    color: Colors.white,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: 'bold',
  },
  addMoreBtn: {
    width: 96,
    height: 96,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  addMorePlus: {
    fontSize: 22,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  addMoreText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  multiImageHint: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  // Status Box
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.primaryDark,
  },
  // Submit Button
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.white,
  },
});

export default AddProductModal;
