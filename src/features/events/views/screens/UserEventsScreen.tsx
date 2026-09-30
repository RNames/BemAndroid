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
import { useEventController } from '../../controllers/event.controller';
import { useAuthController } from '../../../auth/controllers/auth.controller';
import { EventItem, EventCategory } from '../../models/Event.model';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { formatDateTime } from '../../../../shared/utils/format.utils';
import { useTranslation } from '../../../../shared/localization';
import ArrowLeftIcon from '../../../../assets/icons/arrow_left.svg';
import AddEventModal from '../components/AddEventModal';

interface Props {
  onBack: () => void;
  onSelectEvent: (event: EventItem) => void;
}

/**
 * UserEventsScreen
 * Displays list of village events registered by current user
 */
const UserEventsScreen: React.FC<Props> = ({ onBack, onSelectEvent }) => {
  const insets = useSafeAreaInsets();
  const { t, translateCategory } = useTranslation();
  const [eventState, eventActions] = useEventController();
  const [authState] = useAuthController();
  const [addModalVisible, setAddModalVisible] = useState(false);

  const myEvents = eventState.events.filter(
    e => e.createdBy === authState.user?.uid,
  );

  const handleAddEventSubmit = async (newEventData: {
    title: string;
    category: EventCategory;
    organizer: string;
    date: number;
    endDate?: number;
    location: string;
    description: string;
    imageUrl: string;
  }) => {
    if (!authState.user) {
      Alert.alert(t.common.notice, 'Please sign in to your account first.');
      return false;
    }
    return await eventActions.addEvent(newEventData, authState.user.uid);
  };

  const renderEventItem = ({ item }: { item: EventItem }) => {
    const isApproved = item.approved;

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => onSelectEvent(item)}
        activeOpacity={0.8}
      >
        {/* Event Banner */}
        <View style={styles.imageWrapper}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.eventImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Event Poster</Text>
            </View>
          )}
        </View>

        {/* Event Details */}
        <View style={styles.eventDetails}>
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
                {isApproved ? t.events.approved : t.events.pending}
              </Text>
            </View>
          </View>

          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.eventDate}>
            📅 {formatDateTime(item.date)}
          </Text>

          <Text style={styles.eventLocation} numberOfLines={1}>
            📍 {item.location || 'Dlemer Village'}
          </Text>
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

        <Text style={styles.appBarTitle}>{t.events.title}</Text>

        <View style={styles.appBarRightSpacer} />
      </View>

      {/* ─── Summary & Action Bar ───────────────────── */}
      <View style={styles.summaryBar}>
        <View>
          <Text style={styles.summaryTitle}>{t.events.title}</Text>
          <Text style={styles.summarySubtitle}>
            {myEvents.length} {t.events.summary}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ {t.common.all === 'All' ? 'Register' : 'Daftar'}</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Event List ─────────────────────────────── */}
      <FlatList
        data={myEvents}
        keyExtractor={item => item.id}
        renderItem={renderEventItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 40 },
          myEvents.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={eventState.refreshing}
            onRefresh={eventActions.onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>📅</Text>
            </View>
            <Text style={styles.emptyTitle}>{t.events.emptyMyEventsTitle}</Text>
            <Text style={styles.emptySubtitle}>
              {t.events.emptyMyEventsSubtitle}
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => setAddModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyAddBtnText}>{t.events.add}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <AddEventModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
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
  eventCard: {
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
    width: 85,
    height: 85,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  eventImage: {
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
  eventDetails: {
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
  eventTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 19,
    marginVertical: 2,
  },
  eventDate: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.primaryDark,
    marginBottom: 2,
  },
  eventLocation: {
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

export default UserEventsScreen;
