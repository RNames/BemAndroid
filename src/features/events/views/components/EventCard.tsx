import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { EventItem } from '../../models/Event.model';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { formatDateTime, formatEventSchedule } from '../../../../shared/utils/format.utils';
import { useTranslation } from '../../../../shared/localization';

interface Props {
  event: EventItem;
  onPress: (event: EventItem) => void;
}

/**
 * EventCard View Component
 * Menampilkan kartu acara desa dalam 1 kolom (full-width) yang responsif dan elegan
 */
const EventCard: React.FC<Props> = ({ event, onPress }) => {
  const { t, translateCategory } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(event.imageUrl) && !imageError;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(event)}
      activeOpacity={0.88}
    >
      {/* Banner Foto Acara */}
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              {t.common.photoPlaceholderEvent}
            </Text>
          </View>
        )}

        {/* Badge Kategori */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText} numberOfLines={1}>
            {translateCategory(event.category)}
          </Text>
        </View>

        {/* Badge Tanggal Mulai */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>
            {formatDateTime(event.date).split(',')[0]}
          </Text>
        </View>
      </View>

      {/* Konten Info Acara */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Organizer */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t.events.organizer}:</Text>
          <Text style={styles.organizerBold} numberOfLines={1}>
            {event.organizer}
          </Text>
        </View>

        {/* Schedule */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t.events.schedule}:</Text>
          <Text style={styles.scheduleText} numberOfLines={1}>
            {formatEventSchedule(event.date, event.endDate)}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t.events.location}:</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textMuted,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateBadgeText: {
    fontFamily: Fonts.semiBold,
    color: Colors.white,
    fontSize: 11,
  },
  content: {
    padding: 16,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 10,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 6,
  },
  infoLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textMuted,
    width: 90,
  },
  organizerBold: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.textPrimary,
    flex: 1,
  },
  scheduleText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.primaryDark,
    flex: 1,
  },
  locationText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
});

export default EventCard;
