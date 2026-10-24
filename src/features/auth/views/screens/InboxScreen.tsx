import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WhiteTopSafeArea from '../../../../shared/components/WhiteTopSafeArea';
import {
  getFirestore,
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
} from '@react-native-firebase/firestore';
import { useAuthController } from '../../controllers/auth.controller';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { formatDateTime } from '../../../../shared/utils/format.utils';
import { useTranslation } from '../../../../shared/localization';
import ArrowLeftIcon from '../../../../assets/icons/arrow_left.svg';

interface Props {
  onBack: () => void;
}

export interface NotificationItem {
  id: string;
  sender: string;
  category: 'System' | 'Notice';
  title: string;
  preview: string;
  content: string;
  createdAt: number;
  read: boolean;
}

/**
 * InboxScreen
 * Displays user's official inbox & notifications from Firestore
 * Real data: Firestore (/admin_users/{userId}/notifications)
 */
const InboxScreen: React.FC<Props> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [authState] = useAuthController();
  const { user } = authState;

  const [messages, setMessages] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Notice' | 'System'>('All');
  const [selectedMessage, setSelectedMessage] = useState<NotificationItem | null>(null);

  // ─── Fetch real notifications from Firestore ────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const db = getFirestore();
      const notificationsRef = collection(db, 'admin_users', user.uid, 'notifications');
      const q = query(notificationsRef);
      const snapshot = await getDocs(q);

      const loadedMessages: NotificationItem[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        loadedMessages.push({
          id: docSnap.id,
          sender: data.sender || 'Village Administration',
          category:
            data.category === 'Pemberitahuan' || data.category === 'Notice'
              ? 'Notice'
              : 'System',
          title: data.title || 'Information',
          preview: data.preview || data.content?.substring(0, 80) || '',
          content: data.content || '',
          createdAt: data.createdAt || Date.now(),
          read: Boolean(data.read),
        });
      });

      loadedMessages.sort((a, b) => b.createdAt - a.createdAt);
      setMessages(loadedMessages);
    } catch (err) {
      console.warn('[InboxScreen] Error fetching notifications from Firestore:', err);
      setMessages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleOpenMessage = async (msg: NotificationItem) => {
    setSelectedMessage(msg);

    if (!msg.read && user) {
      setMessages(prev =>
        prev.map(m => (m.id === msg.id ? { ...m, read: true } : m)),
      );

      try {
        const db = getFirestore();
        const msgDocRef = doc(db, 'admin_users', user.uid, 'notifications', msg.id);
        await updateDoc(msgDocRef, { read: true });
      } catch (err) {
        console.warn('[InboxScreen] Error updating read status in Firestore:', err);
      }
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'All') return true;
    return m.category === filter;
  });

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.messageCard, !item.read && styles.messageCardUnread]}
      onPress={() => handleOpenMessage(item)}
      activeOpacity={0.75}
    >
      <View style={styles.cardHeader}>
        <View style={styles.senderGroup}>
          {!item.read && <View style={styles.unreadDot} />}
          <Text style={styles.senderText}>{item.sender}</Text>
        </View>
        <Text style={styles.timeText}>
          {item.createdAt ? formatDateTime(item.createdAt) : '-'}
        </Text>
      </View>

      <Text
        style={[styles.titleText, !item.read && styles.titleTextUnread]}
        numberOfLines={1}
      >
        {item.title}
      </Text>

      <Text style={styles.previewText} numberOfLines={2}>
        {item.preview}
      </Text>

      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <WhiteTopSafeArea />

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

        <Text style={styles.appBarTitle}>{t.inbox.title}</Text>

        <View style={styles.appBarRightSpacer} />
      </View>

      {/* ─── Filter Tabs ─────────────────────────────── */}
      <View style={styles.filterRow}>
        {[
          { key: 'All' as const, label: t.inbox.filterAll },
          { key: 'Notice' as const, label: t.inbox.filterNotice },
          { key: 'System' as const, label: t.inbox.filterSystem },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, filter === tab.key && styles.tabBtnActive]}
            onPress={() => setFilter(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabBtnText,
                filter === tab.key && styles.tabBtnTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Message List or Loading / Empty State ─── */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t.inbox.loading}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMessages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 40 },
            filteredMessages.length === 0 && styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIconText}>📬</Text>
              </View>
              <Text style={styles.emptyTitle}>{t.inbox.emptyTitle}</Text>
              <Text style={styles.emptySubtitle}>
                {user ? t.inbox.emptySubtitle : t.inbox.emptySubtitleGuest}
              </Text>
            </View>
          }
        />
      )}

      {/* ─── Modal Read Full Message ─────────────────── */}
      <Modal
        visible={!!selectedMessage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailCard}>
            {selectedMessage && (
              <>
                <View style={styles.detailHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {selectedMessage.category}
                    </Text>
                  </View>
                  <Text style={styles.timeText}>
                    {formatDateTime(selectedMessage.createdAt)}
                  </Text>
                </View>

                <Text style={styles.detailTitle}>{selectedMessage.title}</Text>
                <Text style={styles.detailSender}>
                  {t.inbox.from}: {selectedMessage.sender}
                </Text>

                <View style={styles.modalDivider} />

                <Text style={styles.detailContent}>
                  {selectedMessage.content}
                </Text>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedMessage(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeBtnText}>{t.inbox.close}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.white,
    fontFamily: Fonts.bold,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  messageCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  messageCardUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  senderText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  titleText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  titleTextUnread: {
    fontFamily: Fonts.bold,
    color: '#0F172A',
  },
  previewText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  emptyBox: {
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
  emptyIconText: {
    fontSize: 34,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailTitle: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 23,
  },
  detailSender: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  detailContent: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 21,
    marginBottom: 20,
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 14,
  },
});

export default InboxScreen;
