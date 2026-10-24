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
import { EventItem, EventCategory, EVENT_CATEGORIES } from '../../models/Event.model';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { uploadImageToCloudinary } from '../../../../shared/services/cloudinary.service';
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
    images?: string[];
  }) => Promise<boolean>;
  initialData?: EventItem | null;
}

const CATEGORY_OPTIONS = EVENT_CATEGORIES.filter(c => c !== 'Semua');

const MONTH_NAMES = {
  id: [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

const WEEKDAYS = {
  id: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTE_OPTIONS = [
  '00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55',
];

/**
 * AddEventModal Component
 * Modal form untuk mendaftarkan acara desa baru:
 * - Label / Judul di atas setiap kolom tanpa hint teks di dalam TextInput
 * - Popup kalender dan jam untuk tanggal & waktu dengan hint "--/--/----" dan "--:--" saat kosong
 * - Dropdown pilihan kategori acara dengan teks awal "Pilih kategori"
 * - Pemilihan foto multi-gambar langsung dari galeri HP
 */
const AddEventModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const insets = useSafeAreaInsets();
  const { t, translateCategory, currentLang } = useTranslation();
  const langKey = currentLang === 'id' ? 'id' : 'en';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory | ''>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [organizer, setOrganizer] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Tanggal & Waktu Mulai
  const [startDateStr, setStartDateStr] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('');

  // Tanggal & Waktu Selesai (Opsional)
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDateStr, setEndDateStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');

  // Foto dari Galeri (bisa banyak foto)
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);

  // Popup Date Picker State
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end'>('start');
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerSelectedDay, setPickerSelectedDay] = useState<number | null>(null);

  // Popup Time Picker State
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end'>('start');
  const [pickerHour, setPickerHour] = useState('09');
  const [pickerMinute, setPickerMinute] = useState('00');

  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (visible && initialData) {
      setTitle(initialData.title || '');
      setCategory((initialData.category as EventCategory) || '');
      setDropdownOpen(false);
      setOrganizer(initialData.organizer || '');
      setLocation(initialData.location || '');
      setDescription(initialData.description || '');
      const initialImages =
        Array.isArray(initialData.images) && initialData.images.length > 0
          ? initialData.images
          : initialData.imageUrl
          ? [initialData.imageUrl]
          : [];
      setSelectedImageUris(initialImages);

      if (initialData.date) {
        const d = new Date(initialData.date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        setStartDateStr(`${day}/${month}/${year}`);

        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');
        setStartTimeStr(`${hour}:${minute}`);
      } else {
        setStartDateStr('');
        setStartTimeStr('');
      }

      if (initialData.endDate) {
        setHasEndDate(true);
        const d = new Date(initialData.endDate);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        setEndDateStr(`${day}/${month}/${year}`);

        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');
        setEndTimeStr(`${hour}:${minute}`);
      } else {
        setHasEndDate(false);
        setEndDateStr('');
        setEndTimeStr('');
      }
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
    setTitle('');
    setCategory('');
    setDropdownOpen(false);
    setOrganizer('');
    setLocation('');
    setDescription('');
    setStartDateStr('');
    setStartTimeStr('');
    setHasEndDate(false);
    setEndDateStr('');
    setEndTimeStr('');
    setSelectedImageUris([]);
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
      category !== '' ||
      organizer.trim().length > 0 ||
      location.trim().length > 0 ||
      description.trim().length > 0 ||
      selectedImageUris.length > 0 ||
      startDateStr.trim().length > 0;

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

  // ─── Date Picker Popup Helpers ──────────────────────────
  const openDatePicker = (target: 'start' | 'end') => {
    setDatePickerTarget(target);
    const currentVal = target === 'start' ? startDateStr : endDateStr;
    if (currentVal && currentVal.includes('/')) {
      const [d, m, y] = currentVal.split('/').map(Number);
      if (y && m && d) {
        setPickerYear(y);
        setPickerMonth(m - 1);
        setPickerSelectedDay(d);
      }
    } else {
      const now = new Date();
      setPickerYear(now.getFullYear());
      setPickerMonth(now.getMonth());
      setPickerSelectedDay(now.getDate());
    }
    setDatePickerVisible(true);
  };

  const handlePrevMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear(prev => prev - 1);
    } else {
      setPickerMonth(prev => prev - 1);
    }
    setPickerSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear(prev => prev + 1);
    } else {
      setPickerMonth(prev => prev + 1);
    }
    setPickerSelectedDay(null);
  };

  const confirmDateSelection = () => {
    if (!pickerSelectedDay) {
      Alert.alert(t.addEvent.validationTitle, t.addEvent.selectDateTitle);
      return;
    }
    const formatted = `${String(pickerSelectedDay).padStart(2, '0')}/${String(
      pickerMonth + 1,
    ).padStart(2, '0')}/${pickerYear}`;

    if (datePickerTarget === 'start') {
      setStartDateStr(formatted);
    } else {
      setEndDateStr(formatted);
    }
    setDatePickerVisible(false);
  };

  // ─── Time Picker Popup Helpers ──────────────────────────
  const openTimePicker = (target: 'start' | 'end') => {
    setTimePickerTarget(target);
    const currentVal = target === 'start' ? startTimeStr : endTimeStr;
    if (currentVal && currentVal.includes(':')) {
      const [h, m] = currentVal.split(':');
      setPickerHour(h || '09');
      setPickerMinute(m || '00');
    } else {
      setPickerHour('09');
      setPickerMinute('00');
    }
    setTimePickerVisible(true);
  };

  const confirmTimeSelection = () => {
    const formatted = `${pickerHour}:${pickerMinute}`;
    if (timePickerTarget === 'start') {
      setStartTimeStr(formatted);
    } else {
      setEndTimeStr(formatted);
    }
    setTimePickerVisible(false);
  };

  // Handler Galeri (Bisa memilih banyak foto)
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

  const handlePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }
    if (response.errorCode) {
      Alert.alert(t.common.error, response.errorMessage || t.editProfile.failedPhoto);
      return;
    }
    if (response.assets && response.assets.length > 0) {
      const newUris = response.assets
        .map(a => a.uri)
        .filter((u): u is string => Boolean(u));
      setSelectedImageUris(prev => [...prev, ...newUris]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImageUris(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Helper konversi string DD/MM/YYYY atau YYYY-MM-DD dan HH:mm ke epoch
  const parseDateTimeToEpoch = (dStr: string, tStr: string): number | null => {
    if (!dStr.trim()) return null;
    try {
      let year: number, month: number, day: number;
      if (dStr.includes('/')) {
        const parts = dStr.trim().split('/').map(Number);
        day = parts[0];
        month = parts[1];
        year = parts[2];
      } else if (dStr.includes('-')) {
        const parts = dStr.trim().split('-').map(Number);
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        return null;
      }

      const timePart = tStr.trim() || '09:00';
      const [hour, min] = timePart.split(':').map(Number);
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

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t.addEvent.validationTitle, t.addEvent.validationName);
      return;
    }

    if (!category) {
      Alert.alert(t.addEvent.validationTitle, t.addEvent.validationCategory);
      return;
    }

    if (!organizer.trim()) {
      Alert.alert(t.addEvent.validationTitle, t.addEvent.validationOrganizer);
      return;
    }

    const startTimestamp = parseDateTimeToEpoch(startDateStr, startTimeStr);
    if (!startTimestamp) {
      Alert.alert(
        t.addEvent.validationTitle,
        t.addEvent.validationStartDate,
      );
      return;
    }

    let endTimestamp: number | undefined;
    if (hasEndDate) {
      const parsedEnd = parseDateTimeToEpoch(endDateStr, endTimeStr);
      if (!parsedEnd) {
        Alert.alert(
          t.addEvent.validationTitle,
          t.addEvent.validationEndDate,
        );
        return;
      }
      endTimestamp = parsedEnd;
    }

    if (!location.trim()) {
      Alert.alert(t.addEvent.validationTitle, t.addEvent.validationLocation);
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
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=60';

      const success = await onSubmit({
        title: title.trim(),
        category,
        organizer: organizer.trim(),
        date: startTimestamp,
        endDate: endTimestamp,
        location: location.trim(),
        description: description.trim(),
        imageUrl: primaryImageUrl,
        images: uploadedImageUrls,
      });

      if (success) {
        Alert.alert(
          t.common.success,
          initialData ? t.events.editSuccess : t.addEvent.successMessage,
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

  // Render Calendar Matrix
  const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
  const firstDayIndex = new Date(pickerYear, pickerMonth, 1).getDay();

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
          <Text style={styles.headerTitle}>
            {initialData ? t.events.editEvent : t.addEvent.title}
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
          {/* 1. Nama / Judul Acara */}
          <View style={styles.formItem}>
            <Text style={styles.fieldLabel}>{t.addEvent.nameLabel}</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* 2. Dropdown Kategori Acara */}
          <View style={[styles.formItem, { zIndex: 100 }]}>
            <Text style={styles.fieldLabel}>{t.addEvent.categoryLabel}</Text>
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
                {category ? translateCategory(category) : t.addEvent.categoryPlaceholder}
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

          {/* 3. Penyelenggara Acara */}
          <View style={styles.formItem}>
            <Text style={styles.fieldLabel}>{t.addEvent.organizerLabel}</Text>
            <TextInput
              style={styles.input}
              value={organizer}
              onChangeText={setOrganizer}
            />
          </View>

          {/* 4. Tanggal & Jam Mulai (Popup Picker) */}
          <View style={styles.formItem}>
            <View style={styles.row}>
              <View style={{ flex: 1.5, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>{t.addEvent.startDateLabel}</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => openDatePicker('start')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.pickerTriggerText,
                      !startDateStr && styles.pickerPlaceholder,
                    ]}
                  >
                    {startDateStr || t.addEvent.datePlaceholder}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{t.addEvent.startTimeFieldLabel}</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => openTimePicker('start')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.pickerTriggerText,
                      !startTimeStr && styles.pickerPlaceholder,
                    ]}
                  >
                    {startTimeStr || t.addEvent.timePlaceholder}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 5. Toggle Waktu Selesai (Opsional) */}
          <View style={styles.formItem}>
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
              <View style={[styles.row, { marginTop: 10 }]}>
                <View style={{ flex: 1.5, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>{t.addEvent.endDateLabel}</Text>
                  <TouchableOpacity
                    style={styles.pickerTrigger}
                    onPress={() => openDatePicker('end')}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.pickerTriggerText,
                        !endDateStr && styles.pickerPlaceholder,
                      ]}
                    >
                      {endDateStr || t.addEvent.datePlaceholder}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>{t.addEvent.endTimeFieldLabel}</Text>
                  <TouchableOpacity
                    style={styles.pickerTrigger}
                    onPress={() => openTimePicker('end')}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.pickerTriggerText,
                        !endTimeStr && styles.pickerPlaceholder,
                      ]}
                    >
                      {endTimeStr || t.addEvent.timePlaceholder}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* 6. Lokasi Acara */}
          <View style={styles.formItem}>
            <Text style={styles.fieldLabel}>{t.addEvent.locationLabel}</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* 7. Foto Acara (Multi-Foto Galeri) */}
          <View style={styles.formItem}>
            <View style={styles.photoLabelRow}>
              <Text style={styles.fieldLabel}>{t.addEvent.photoLabel}</Text>
              {selectedImageUris.length > 0 && (
                <Text style={styles.photoCountText}>
                  {selectedImageUris.length} {t.events.summary || 'foto'}
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
                <Text style={styles.galleryUploadText}>{t.addEvent.galleryButton}</Text>
                <Text style={styles.galleryUploadSubtext}>Bisa pilih lebih dari satu foto</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 8. Deskripsi Acara */}
          <View style={styles.formItem}>
            <Text style={styles.fieldLabel}>{t.addEvent.descLabel}</Text>
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

          {/* Tombol Simpan */}
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
                {initialData ? t.common.save : t.addEvent.submitBtn}
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── POPUP DATE PICKER MODAL ───────────────────────── */}
      <Modal
        visible={datePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarCard}>
            <Text style={styles.modalCardTitle}>
              {datePickerTarget === 'start'
                ? t.addEvent.startDateLabel
                : t.addEvent.endDateLabel}
            </Text>

            {/* Month & Year Navigation Header */}
            <View style={styles.calNavHeader}>
              <TouchableOpacity
                onPress={handlePrevMonth}
                style={styles.calNavBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.calNavBtnText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.calMonthText}>
                {MONTH_NAMES[langKey][pickerMonth]} {pickerYear}
              </Text>
              <TouchableOpacity
                onPress={handleNextMonth}
                style={styles.calNavBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.calNavBtnText}>▶</Text>
              </TouchableOpacity>
            </View>

            {/* Weekdays Row */}
            <View style={styles.calWeekdaysRow}>
              {WEEKDAYS[langKey].map(d => (
                <Text key={d} style={styles.calWeekdayText}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Calendar Days Matrix */}
            <View style={styles.calDaysGrid}>
              {/* Empty placeholder cells before 1st of month */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.calDayCell} />
              ))}
              {/* Actual days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = pickerSelectedDay === dayNum;
                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    style={[
                      styles.calDayCell,
                      isSelected && styles.calDayCellSelected,
                    ]}
                    onPress={() => setPickerSelectedDay(dayNum)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.calDayText,
                        isSelected && styles.calDayTextSelected,
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDatePickerVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmDateSelection}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnText}>{t.common.close === 'Tutup' ? 'Pilih' : 'Select'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── POPUP TIME PICKER MODAL ───────────────────────── */}
      <Modal
        visible={timePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.timeCard}>
            <Text style={styles.modalCardTitle}>
              {timePickerTarget === 'start'
                ? t.addEvent.startTimeFieldLabel
                : t.addEvent.endTimeFieldLabel}
            </Text>

            {/* Current Selected Time Preview */}
            <View style={styles.timePreviewRow}>
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>{pickerHour}</Text>
              </View>
              <Text style={styles.timeColon}>:</Text>
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>{pickerMinute}</Text>
              </View>
            </View>

            {/* Column Picker Header */}
            <View style={styles.timeColumnHeaderRow}>
              <Text style={styles.timeColumnHeaderText}>{t.addEvent.hourLabel}</Text>
              <Text style={styles.timeColumnHeaderText}>{t.addEvent.minuteLabel}</Text>
            </View>

            {/* Two Scrollable Columns: Hour & Minute */}
            <View style={styles.timeColumnsContainer}>
              {/* Hour Column */}
              <ScrollView
                style={styles.timeScrollColumn}
                showsVerticalScrollIndicator={false}
              >
                {HOUR_OPTIONS.map(h => {
                  const isSelected = pickerHour === h;
                  return (
                    <TouchableOpacity
                      key={`hour-${h}`}
                      style={[
                        styles.timeOptionItem,
                        isSelected && styles.timeOptionItemSelected,
                      ]}
                      onPress={() => setPickerHour(h)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          isSelected && styles.timeOptionTextSelected,
                        ]}
                      >
                        {h}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Minute Column */}
              <ScrollView
                style={styles.timeScrollColumn}
                showsVerticalScrollIndicator={false}
              >
                {MINUTE_OPTIONS.map(m => {
                  const isSelected = pickerMinute === m;
                  return (
                    <TouchableOpacity
                      key={`min-${m}`}
                      style={[
                        styles.timeOptionItem,
                        isSelected && styles.timeOptionItemSelected,
                      ]}
                      onPress={() => setPickerMinute(m)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          isSelected && styles.timeOptionTextSelected,
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setTimePickerVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmTimeSelection}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmBtnText}>{t.common.close === 'Tutup' ? 'Pilih' : 'Select'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Trigger box untuk popup picker tanggal & jam
  pickerTrigger: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    justifyContent: 'center',
  },
  pickerTriggerText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  pickerPlaceholder: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    letterSpacing: 0.5,
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  // Dropdown Styles
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
  // Toggle End Time
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
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
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
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
  // Gallery Upload Button (No Icon)
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
  // Status Box & Submit
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    color: Colors.primaryDark,
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 15,
  },

  // ─── Modal Backdrop & Card Styles ───────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  calendarCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  timeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalCardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  // Calendar Navigation
  calNavHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  calNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calNavBtnText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  calMonthText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  calWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calWeekdayText: {
    width: 40,
    textAlign: 'center',
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.textMuted,
  },
  calDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calDayCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 19,
  },
  calDayCellSelected: {
    backgroundColor: Colors.primary,
  },
  calDayText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  calDayTextSelected: {
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  // Time Picker Components
  timePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  timeBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.primaryDark,
  },
  timeColon: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    marginHorizontal: 10,
  },
  timeColumnHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  timeColumnHeaderText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textMuted,
  },
  timeColumnsContainer: {
    flexDirection: 'row',
    height: 160,
    justifyContent: 'space-between',
  },
  timeScrollColumn: {
    flex: 1,
    marginHorizontal: 6,
  },
  timeOptionItem: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  timeOptionItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  timeOptionText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  timeOptionTextSelected: {
    fontFamily: Fonts.bold,
    color: Colors.primaryDark,
  },
  // Modal Actions
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modalConfirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  modalConfirmBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.white,
  },
});

export default AddEventModal;
