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
import { EventCategory, EVENT_CATEGORIES } from '../../models/Event.model';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { uploadImageToCloudinary } from '../../../../shared/services/cloudinary.service';
import { formatDateTime } from '../../../../shared/utils/format.utils';
import { useTranslation } from '../../../../shared/localization';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (eventData: {
    title: string;
    category: EventCategory;
    organizer: string;
    date: number;
    endDate?: number;
    location: string;
    description: string;
    imageUrl: string;
  }) => Promise<boolean>;
}

const CATEGORY_OPTIONS = EVENT_CATEGORIES.filter(c => c !== 'Semua');

/**
 * AddEventModal Component
 * Modal form untuk mendaftarkan acara desa baru dengan dukungan multibahasa:
 * - Dukungan Kamera & Galeri Foto Acara
 * - Upload otomatis ke Cloudinary Storage
 * - Input Tanggal & Jam Mulai + Selesai (opsional) dengan Live Preview
 * - Status default: approved: false (menunggu ACC admin)
 */
const AddEventModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const insets = useSafeAreaInsets();
  const { t, translateCategory } = useTranslation();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Keagamaan');
  const [organizer, setOrganizer] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Tanggal & Waktu Mulai (Default: hari ini jam 09:00)
  const defaultDateStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  const [startDateStr, setStartDateStr] = useState(defaultDateStr);
  const [startTimeStr, setStartTimeStr] = useState('09:00');

  // Tanggal & Waktu Selesai (Opsional)
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDateStr, setEndDateStr] = useState(defaultDateStr);
  const [endTimeStr, setEndTimeStr] = useState('17:00');

  // Media & Foto
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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
    setTitle('');
    setCategory('Keagamaan');
    setOrganizer('');
    setLocation('');
    setDescription('');
    setStartDateStr(new Date().toISOString().split('T')[0]);
    setStartTimeStr('09:00');
    setHasEndDate(false);
    setEndDateStr(new Date().toISOString().split('T')[0]);
    setEndTimeStr('17:00');
    setSelectedImageUri(null);
    setImageUrl('');
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

    const isDirty =
      title.trim().length > 0 ||
      organizer.trim().length > 0 ||
      location.trim().length > 0 ||
      description.trim().length > 0 ||
      selectedImageUri !== null ||
      imageUrl.trim().length > 0;

    if (isDirty) {
      Alert.alert(
        t.addEvent.discardTitle,
        t.addEvent.discardMessage,
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
        setImageUrl('');
      }
    }
  };

  // Helper konversi string YYYY-MM-DD dan HH:mm ke timestamp
  const parseDateTimeToEpoch = (dStr: string, tStr: string): number | null => {
    try {
      const [year, month, day] = dStr.split('-').map(Number);
      const [hour, min] = tStr.split(':').map(Number);
      if (!year || !month || !day || isNaN(hour) || isNaN(min)) {
        return null;
      }
      const dt = new Date(year, month - 1, day, hour, min, 0);
      const timeVal = dt.getTime();
      return isNaN(timeVal) ? null : timeVal;
    } catch {
      return null;
    }
  };

  const startTimestamp = parseDateTimeToEpoch(startDateStr, startTimeStr);
  const endTimestamp = hasEndDate ? parseDateTimeToEpoch(endDateStr, endTimeStr) : null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t.addEvent.validationTitle, t.addEvent.validationName);
      return;
    }

    if (!organizer.trim()) {
      Alert.alert(t.addEvent.validationTitle, t.addEvent.validationOrganizer);
      return;
    }

    if (!startTimestamp) {
      Alert.alert(
        t.addEvent.validationTitle,
        t.addEvent.validationStartDate,
      );
      return;
    }

    if (hasEndDate && !endTimestamp) {
      Alert.alert(
        t.addEvent.validationTitle,
        t.addEvent.validationEndDate,
      );
      return;
    }

    if (!location.trim()) {
      Alert.alert(t.addEvent.validationTitle, t.addEvent.validationLocation);
      return;
    }

    try {
      setSubmitting(true);
      let uploadedImageUrl = imageUrl.trim();

      if (selectedImageUri) {
        setUploadStatus(t.addEvent.uploadingPhoto);
        uploadedImageUrl = await uploadImageToCloudinary(selectedImageUri);
      }

      setUploadStatus(t.addEvent.savingEvent);
      const success = await onSubmit({
        title,
        category,
        organizer,
        date: startTimestamp,
        endDate: hasEndDate && endTimestamp ? endTimestamp : undefined,
        location,
        description,
        imageUrl: uploadedImageUrl,
      });

      if (success) {
        Alert.alert(
          t.addEvent.successTitle,
          t.addEvent.successMessage,
        );
        forceClose();
      } else {
        Alert.alert(t.addEvent.failTitle, t.addEvent.failMessage);
      }
    } catch (err: any) {
      const msg = err?.message || t.addEvent.failMessage;
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
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.headerTitle}>{t.addEvent.title}</Text>
          <TouchableOpacity onPress={handleAttemptClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Judul Acara */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addEvent.nameLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.addEvent.namePlaceholder}
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Kategori Acara */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addEvent.categoryLabel}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {CATEGORY_OPTIONS.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    category === cat && styles.catChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      category === cat && styles.catChipTextActive,
                    ]}
                  >
                    {translateCategory(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Penyelenggara */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addEvent.organizerLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.addEvent.organizerPlaceholder}
              placeholderTextColor={Colors.textMuted}
              value={organizer}
              onChangeText={setOrganizer}
            />
          </View>

          {/* Tanggal & Waktu Mulai */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addEvent.startTimeLabel}</Text>
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1.6 }]}>
                <Text style={styles.subLabel}>{t.addEvent.dateSublabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-07-15"
                  placeholderTextColor={Colors.textMuted}
                  value={startDateStr}
                  onChangeText={setStartDateStr}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={styles.subLabel}>{t.addEvent.timeSublabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09:00"
                  placeholderTextColor={Colors.textMuted}
                  value={startTimeStr}
                  onChangeText={setStartTimeStr}
                />
              </View>
            </View>
            {startTimestamp ? (
              <Text style={styles.previewDate}>
                {t.addEvent.startSchedulePreview} {formatDateTime(startTimestamp)}
              </Text>
            ) : null}
          </View>

          {/* Toggle Tanggal Selesai */}
          <View style={styles.formGroup}>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setHasEndDate(!hasEndDate)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, hasEndDate && styles.checkboxChecked]}>
                {hasEndDate ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.toggleLabel}>{t.addEvent.toggleEndTime}</Text>
            </TouchableOpacity>

            {hasEndDate && (
              <View style={{ marginTop: 10 }}>
                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1.6 }]}>
                    <Text style={styles.subLabel}>{t.addEvent.endDateSublabel}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="2026-07-15"
                      placeholderTextColor={Colors.textMuted}
                      value={endDateStr}
                      onChangeText={setEndDateStr}
                    />
                  </View>
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.subLabel}>{t.addEvent.endTimeSublabel}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="17:00"
                      placeholderTextColor={Colors.textMuted}
                      value={endTimeStr}
                      onChangeText={setEndTimeStr}
                    />
                  </View>
                </View>
                {endTimestamp ? (
                  <Text style={styles.previewDate}>
                    {t.addEvent.endSchedulePreview} {formatDateTime(endTimestamp)}
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          {/* Lokasi Acara */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addEvent.locationLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.addEvent.locationPlaceholder}
              placeholderTextColor={Colors.textMuted}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Foto Acara */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addEvent.photoLabel}</Text>

            {selectedImageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setSelectedImageUri(null)}
                >
                  <Text style={styles.removeImageText}>{t.addEvent.removePhoto}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.mediaButtonRow}>
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={handleTakeCameraPhoto}
                activeOpacity={0.8}
              >
                <Text style={styles.cameraBtnText}>{t.addEvent.camera}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.galleryBtn}
                onPress={handleSelectGalleryPhoto}
                activeOpacity={0.8}
              >
                <Text style={styles.galleryBtnText}>{t.addEvent.gallery}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.orText}>{t.addEvent.orPublicUrl}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.addEvent.urlPlaceholder}
              placeholderTextColor={Colors.textMuted}
              value={imageUrl}
              onChangeText={val => {
                setImageUrl(val);
                if (val.trim()) {setSelectedImageUri(null);}
              }}
            />
          </View>

          {/* Deskripsi */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.addEvent.descLabel}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t.addEvent.descPlaceholder}
              placeholderTextColor={Colors.textMuted}
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

          {/* Tombol Simpan */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>{t.addEvent.submitBtn}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.approvalNotice}>
            {t.addEvent.approvalNotice}
          </Text>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    fontFamily: Fonts.regular,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 90,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
  },
  previewDate: {
    fontFamily: Fonts.semiBold,
    marginTop: 6,
    fontSize: 12,
    color: Colors.primaryDark,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  catChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  catChipTextActive: {
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 12,
  },
  toggleLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  previewContainer: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewImage: {
    width: '100%',
    height: 150,
  },
  removeImageBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    alignItems: 'center',
  },
  removeImageText: {
    fontFamily: Fonts.bold,
    color: Colors.danger,
    fontSize: 12,
  },
  mediaButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  cameraBtn: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cameraBtnText: {
    fontFamily: Fonts.bold,
    color: '#2563EB',
    fontSize: 13,
  },
  galleryBtn: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  galleryBtnText: {
    fontFamily: Fonts.bold,
    color: '#7C3AED',
    fontSize: 13,
  },
  orText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 6,
    textAlign: 'center',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    color: Colors.primaryDark,
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 15,
  },
  approvalNotice: {
    fontFamily: Fonts.regular,
    marginTop: 10,
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default AddEventModal;
