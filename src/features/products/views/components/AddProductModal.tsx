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
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { ProductCategory, PRODUCT_CATEGORIES } from '../../models/Product.model';
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
    whatsappLink: string;
  }) => Promise<boolean>;
}

const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.filter(c => c !== 'Semua');

/**
 * AddProductModal
 * Modal form untuk menambahkan produk UMKM baru dengan dukungan multibahasa:
 * - Dukungan Kamera & Galeri Foto Produk
 * - Penanganan Safe Area Insets
 * - Perbaikan UX Back Button (menutup keyboard dahulu jika aktif)
 * - Pop-up konfirmasi pembatalan jika data sudah diisi
 */
const AddProductModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const insets = useSafeAreaInsets();
  const { t, translateCategory } = useTranslation();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Makanan & Minuman');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Monitor status keyboard agar tombol Back Android hanya menurunkan keyboard
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
    setCategory('Makanan & Minuman');
    setPrice('');
    setStock('1');
    setWhatsapp('');
    setSelectedImageUri(null);
    setImageUrl('');
    setDescription('');
  };

  const forceClose = () => {
    resetForm();
    onClose();
  };

  // Konfirmasi sebelum menutup form jika sudah ada isian data
  const handleAttemptClose = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
      return;
    }

    const isFormDirty =
      name.trim().length > 0 ||
      price.trim().length > 0 ||
      whatsapp.trim().length > 0 ||
      description.trim().length > 0 ||
      selectedImageUri !== null ||
      imageUrl.trim().length > 0;

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

  // Handler Kamera
  const handleTakeCameraPhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      handlePickerResponse,
    );
  };

  // Handler Galeri
  const handleSelectGalleryPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      handlePickerResponse,
    );
  };

  const handlePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }
    if (response.errorCode) {
      Alert.alert(t.common.error, response.errorMessage || t.editProfile.failedPhoto);
      return;
    }
    if (response.assets && response.assets.length > 0) {
      const uri = response.assets[0].uri;
      if (uri) {
        setSelectedImageUri(uri);
        setImageUrl(''); // Clear manual URL jika memilih foto lokal
      }
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t.addProduct.validationTitle, t.addProduct.validationName);
      return;
    }

    if (!price.trim() || isNaN(Number(price)) || Number(price) < 0) {
      Alert.alert(t.addProduct.validationTitle, t.addProduct.validationPrice);
      return;
    }

    if (!whatsapp.trim()) {
      Alert.alert(t.addProduct.validationTitle, t.addProduct.validationWhatsapp);
      return;
    }

    try {
      setSubmitting(true);
      let uploadedImageUrl = imageUrl.trim();

      // Jika pengguna memilih gambar lokal dari kamera/galeri, unggah ke Cloudinary
      if (selectedImageUri) {
        setUploadStatus(t.addProduct.uploadingPhoto);
        uploadedImageUrl = await uploadImageToCloudinary(selectedImageUri);
      }

      setUploadStatus(t.addProduct.savingProduct);
      const success = await onSubmit({
        name,
        category,
        price: Number(price),
        stock: Number(stock) || 0,
        whatsappLink: whatsapp,
        imageUrl: uploadedImageUrl,
        description,
      });

      if (success) {
        Alert.alert(
          t.addProduct.successTitle,
          t.addProduct.successMessage,
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
        {/* Header dengan Safe Area Top Inset */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.headerTitle}>{t.addProduct.title}</Text>
          <TouchableOpacity onPress={handleAttemptClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Nama Produk */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addProduct.nameLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.addProduct.namePlaceholder}
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Kategori Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addProduct.categoryLabel}</Text>
            <View style={styles.categoryContainer}>
              {CATEGORY_OPTIONS.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {translateCategory(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Row Harga & Stok */}
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>{t.addProduct.priceLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.addProduct.pricePlaceholder}
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>{t.addProduct.stockLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.addProduct.stockPlaceholder}
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>
          </View>

          {/* WhatsApp */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addProduct.whatsappLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.addProduct.whatsappPlaceholder}
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              value={whatsapp}
              onChangeText={setWhatsapp}
            />
          </View>

          {/* Foto Produk Picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addProduct.photoLabel}</Text>

            {selectedImageUri ? (
              <View style={styles.imagePreviewCard}>
                <Image
                  source={{ uri: selectedImageUri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setSelectedImageUri(null)}
                >
                  <Text style={styles.removeImageText}>{t.addProduct.removePhoto}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.pickerActionRow}>
                <TouchableOpacity
                  style={styles.pickerBtn}
                  onPress={handleTakeCameraPhoto}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickerBtnText}>{t.addProduct.camera}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pickerBtn}
                  onPress={handleSelectGalleryPhoto}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickerBtnText}>{t.addProduct.gallery}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Direct Image URL Alternative */}
            {!selectedImageUri && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.subLabel}>{t.addProduct.orPublicUrl}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t.addProduct.urlPlaceholder}
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                />
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addProduct.descLabel}</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder={t.addProduct.descPlaceholder}
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Footer dengan Safe Area Bottom Inset */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 12, 20) }]}>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color={Colors.white} size="small" />
                <Text style={styles.submitBtnText}>
                  {uploadStatus || t.common.loading}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>{t.addProduct.submitBtn}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textMuted,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    fontFamily: Fonts.regular,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  multilineInput: {
    minHeight: 90,
  },
  row: {
    flexDirection: 'row',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  pickerActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  pickerBtnIcon: {
    fontSize: 18,
  },
  pickerBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.primaryDark,
  },
  imagePreviewCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removeImageBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.dangerLight,
  },
  removeImageText: {
    fontFamily: Fonts.bold,
    color: Colors.danger,
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitBtnText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 16,
  },
});

export default AddProductModal;
