import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WhiteTopSafeArea from '../../../../shared/components/WhiteTopSafeArea';
import { EventItem } from '../../models/Event.model';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { formatDateTime, formatEventSchedule } from '../../../../shared/utils/format.utils';
import { useTranslation } from '../../../../shared/localization';
import ArrowLeftIcon from '../../../../assets/icons/arrow_left.svg';

const { width } = Dimensions.get('window');

interface Props {
  event: EventItem;
  onBack: () => void;
}

/**
 * EventDetailScreen View
 * Menampilkan detail lengkap satu acara desa:
 * - Foto banner carousel (multi-gambar) & tombol back
 * - Kategori, Judul, Penyelenggara
 * - Jadwal lengkap (mulai & selesai)
 * - Lokasi + Tombol buka Google Maps
 * - Deskripsi lengkap acara
 */
const EventDetailScreen: React.FC<Props> = ({ event, onBack }) => {
  const insets = useSafeAreaInsets();
  const { t, translateCategory } = useTranslation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Backward compatibility: prioritaskan images array jika ada, jika tidak gunakan imageUrl
  const eventImages: string[] =
    Array.isArray(event.images) && event.images.length > 0
      ? event.images
      : event.imageUrl
      ? [event.imageUrl]
      : [];

  const handleOpenMaps = async () => {
    if (!event.location.trim()) {
      Alert.alert(t.common.notice, t.events.location);
      return;
    }
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      event.location,
    )}`;
    try {
      await Linking.openURL(mapUrl);
    } catch {
      Alert.alert(t.common.error, 'Could not open map application on this device.');
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <WhiteTopSafeArea />

      {/* ─── Top Appbar Putih ────────────────────── */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.appBarBackBtn}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon width={22} height={22} fill="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.appBarTitle}>{t.events.eventDetails}</Text>

        {/* Placeholder penyeimbang layout kanan */}
        <View style={styles.appBarRightSpacer} />
      </View>

      <ScrollView style={styles.scroll} bounces={false} showsVerticalScrollIndicator={false}>
        {/* ─── Hero Image Carousel ─────────────────── */}
        <View style={styles.heroContainer}>
          {eventImages.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => {
                const offsetX = e.nativeEvent.contentOffset.x;
                const index = Math.round(offsetX / width);
                setActiveImageIndex(index);
              }}
              style={styles.carouselScroll}
            >
              {eventImages.map((uri, index) => (
                <Image
                  key={`${uri}-${index}`}
                  source={{ uri }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={styles.heroPlaceholderText}>🗓️</Text>
            </View>
          )}

          {/* Dots Pagination */}
          {eventImages.length > 1 && (
            <View style={styles.paginationDots} pointerEvents="none">
              {eventImages.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    activeImageIndex === i ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Counter Badge (1/3) */}
          {eventImages.length > 1 && (
            <View style={styles.imageCounterBadge} pointerEvents="none">
              <Text style={styles.imageCounterText}>
                {activeImageIndex + 1}/{eventImages.length}
              </Text>
            </View>
          )}
        </View>

        {/* ─── Content Card ────────────────────────── */}
        <View style={styles.contentCard}>
          {/* Badge Kategori */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{translateCategory(event.category)}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>
                {event.approved ? t.events.verified : t.events.underReview}
              </Text>
            </View>
          </View>

          {/* Judul Acara */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Organizer */}
          <View style={styles.organizerBox}>
            <Text style={styles.organizerLabel}>{t.events.organizer}</Text>
            <Text style={styles.organizerName}>{event.organizer}</Text>
          </View>

          <View style={styles.divider} />

          {/* ─── Info Grid: Date & Location ───────── */}
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoItemLabel}>{t.events.startTime}</Text>
                <Text style={styles.infoItemValue}>{formatDateTime(event.date)}</Text>
              </View>
            </View>

            {event.endDate ? (
              <View style={[styles.infoItem, styles.infoItemBorder]}>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoItemLabel}>{t.events.endTime}</Text>
                  <Text style={styles.infoItemValue}>{formatDateTime(event.endDate)}</Text>
                </View>
              </View>
            ) : null}

            <View style={[styles.infoItem, styles.infoItemBorder]}>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoItemLabel}>{t.events.location}</Text>
                <Text style={styles.infoItemValue}>{event.location}</Text>
              </View>
            </View>
          </View>

          {/* Tombol Buka di Google Maps */}
          <TouchableOpacity
            style={styles.mapsButton}
            onPress={handleOpenMaps}
            activeOpacity={0.85}
          >
            <Text style={styles.mapsButtonText}>{t.events.getDirections}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* ─── Description ─────────────────────── */}
          <View style={styles.descSection}>
            <Text style={styles.descTitle}>{t.events.aboutEvent}</Text>
            <Text style={styles.descText}>
              {event.description?.trim() || t.events.noDescription}
            </Text>
          </View>

          {/* Spacer bawah */}
          <View style={{ height: insets.bottom + 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
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
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
    backgroundColor: '#0F172A',
  },
  carouselScroll: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: width,
    height: '100%',
  },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  heroPlaceholderText: {
    fontSize: 48,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 38,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: Colors.white,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  imageCounterBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    fontFamily: Fonts.medium,
    color: Colors.white,
    fontSize: 12,
  },
  contentCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  categoryPillText: {
    fontFamily: Fonts.bold,
    color: Colors.primaryDark,
    fontSize: 12,
  },
  statusPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    lineHeight: 30,
    marginBottom: 12,
  },
  organizerBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  organizerLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  organizerName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoItemLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoItemValue: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  mapsButton: {
    marginTop: 14,
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  mapsButtonText: {
    fontFamily: Fonts.bold,
    color: Colors.primaryDark,
    fontSize: 13,
  },
  descSection: {
    marginBottom: 16,
  },
  descTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  descText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});

export default EventDetailScreen;
