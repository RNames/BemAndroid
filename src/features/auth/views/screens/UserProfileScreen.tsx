import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthController } from '../../controllers/auth.controller';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { formatDate } from '../../../../shared/utils/format.utils';
import { ProfileSkeleton } from '../../../../shared/components/Skeleton';
import { useTranslation } from '../../../../shared/localization';
import ArrowRightIcon from '../../../../assets/icons/arrow_right.svg';
import EditProfileModal from '../components/EditProfileModal';

interface Props {
  onOpenLogin: () => void;
  onNavigateToAccountInfo?: () => void;
  onNavigateToProducts?: () => void;
  onNavigateToEvents?: () => void;
  onNavigateToInbox?: () => void;
  onNavigateToLanguage?: () => void;
}

/**
 * UserProfileScreen View
 * Displays current user/admin profile:
 * - Centered profile header: Photo, name, email, role badge, and Edit Profile button
 * - Edit Profile feature (Name & Photo) via EditProfileModal
 * - Container 1: Account Information to Language in 1 card with dividers (10px margin from phone border)
 * - Container 2: Delete Data, Clear Cache, and Sign Out in 1 card with red text
 */
const UserProfileScreen: React.FC<Props> = ({
  onOpenLogin,
  onNavigateToAccountInfo,
  onNavigateToProducts,
  onNavigateToEvents,
  onNavigateToInbox,
  onNavigateToLanguage,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [authState, authActions] = useAuthController();
  const { user, userProfile } = authState;
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);

  const handleSignOutConfirm = () => {
    Alert.alert(
      t.profile.logoutConfirmTitle,
      t.profile.logoutConfirmMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.profile.logout,
          style: 'destructive',
          onPress: authActions.signOut,
        },
      ],
    );
  };

  const handleAccountInfo = () => {
    Alert.alert(
      t.accountInfo.title,
      `${t.accountInfo.fullName}: ${userProfile?.displayName || user?.displayName || '-'}\n${t.accountInfo.email}: ${
        userProfile?.email || user?.email || '-'
      }\n${t.accountInfo.role}: ${
        userProfile?.role === 'admin' ? t.profile.adminBadge : t.profile.userBadge
      }\n${t.accountInfo.registeredDate}: ${
        userProfile?.createdAt ? formatDate(userProfile.createdAt) : '-'
      }\n${t.accountInfo.lastLogin}: ${
        userProfile?.lastLogin ? formatDate(userProfile.lastLogin) : '-'
      }`,
      [{ text: t.common.close }],
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      t.profile.clearCacheTitle,
      t.profile.clearCacheMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          onPress: () => {
            Alert.alert(t.common.success, t.profile.clearCacheSuccess);
          },
        },
      ],
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      t.profile.deleteDataTitle,
      t.profile.deleteDataMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: () => {
            Alert.alert(t.common.info, t.profile.deleteDataProcessed);
          },
        },
      ],
    );
  };

  // ─── Menu Container 1: Feature Navigations ─────────
  const navigationMenuItems = [
    {
      id: 'info',
      label: t.profile.accountInfo,
      onPress: onNavigateToAccountInfo || handleAccountInfo,
    },
    {
      id: 'my_products',
      label: t.profile.myProducts,
      onPress:
        onNavigateToProducts ||
        (() =>
          Alert.alert(
            t.profile.myProducts,
            t.products.summary,
          )),
    },
    {
      id: 'my_events',
      label: t.profile.myEvents,
      onPress:
        onNavigateToEvents ||
        (() =>
          Alert.alert(
            t.profile.myEvents,
            t.events.summary,
          )),
    },
    {
      id: 'inbox',
      label: t.profile.inbox,
      onPress:
        onNavigateToInbox ||
        (() =>
          Alert.alert(t.profile.inbox, t.inbox.emptySubtitle)),
    },
    {
      id: 'language',
      label: t.profile.language,
      onPress:
        onNavigateToLanguage ||
        (() =>
          Alert.alert(t.profile.language, t.language.title)),
    },
  ];

  // ─── Menu Container 2: Sensitive / System Actions (Red Text) ─
  const actionMenuItems = [
    {
      id: 'delete_data',
      label: t.profile.deleteData,
      onPress: handleDeleteData,
    },
    {
      id: 'clear_cache',
      label: t.profile.clearCache,
      onPress: handleClearCache,
    },
    {
      id: 'logout',
      label: t.profile.logout,
      onPress: handleSignOutConfirm,
    },
  ];

  // ─── Lazy Loading Skeleton while profile is syncing from Firestore ───
  if (user && !userProfile) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileSkeleton />
      </ScrollView>
    );
  }

  const userDisplayName = userProfile?.displayName || user?.displayName || 'User';
  const userEmail = userProfile?.email || user?.email || '';
  const userPhoto = userProfile?.photoUrl || user?.photoURL;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {user ? (
        // ─── Logged In User View ──────────────────────────────
        <>
          {/* Centered Profile Header: Photo, Name, Email, Role, Edit Profile */}
          <View style={styles.profileHeader}>
            {/* Centered Avatar */}
            <View style={styles.avatarWrapper}>
              {userPhoto ? (
                <Image source={{ uri: userPhoto }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {userDisplayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Centered Name, Email, Role & Button */}
            <View style={styles.profileDetails}>
              <Text style={styles.displayName} numberOfLines={1}>
                {userDisplayName}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {userEmail}
              </Text>

              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {userProfile?.role === 'admin'
                    ? t.profile.adminBadge
                    : t.profile.userBadge}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => setEditProfileModalVisible(true)}
                activeOpacity={0.75}
              >
                <Text style={styles.editProfileBtnText}>{t.profile.editProfile}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── Container 1: Account Info to Language ─── */}
          <View style={styles.menuContainer}>
            {navigationMenuItems.map((item, index) => {
              const isLast = index === navigationMenuItems.length - 1;
              return (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.menuRowText}>{item.label}</Text>
                    <ArrowRightIcon width={12} height={12} fill="#64748B" />
                  </TouchableOpacity>
                  {!isLast && <View style={styles.divider} />}
                </React.Fragment>
              );
            })}
          </View>

          {/* ─── Container 2: Delete Data, Clear Cache, Sign Out (Red Text) ─── */}
          <View style={styles.menuContainer}>
            {actionMenuItems.map((item, index) => {
              const isLast = index === actionMenuItems.length - 1;
              return (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.menuRowText, styles.menuRowTextRed]}>
                      {item.label}
                    </Text>
                    <ArrowRightIcon width={12} height={12} fill="#DC2626" />
                  </TouchableOpacity>
                  {!isLast && <View style={styles.divider} />}
                </React.Fragment>
              );
            })}
          </View>

          {/* ─── Edit Profile Modal ───────────────────────────── */}
          <EditProfileModal
            visible={editProfileModalVisible}
            onClose={() => setEditProfileModalVisible(false)}
            currentName={userDisplayName}
            currentPhotoUrl={userPhoto || undefined}
          />
        </>
      ) : (
        // ─── Guest View (Not Signed In) ──────────────────────
        <View style={styles.guestCard}>
          <View style={styles.guestAvatarCircle}>
            <Text style={styles.guestAvatarText}>G</Text>
          </View>

          <Text style={styles.guestTitle}>{t.profile.guestTitle}</Text>
          <Text style={styles.guestSubtitle}>
            {t.profile.guestSubtitle}
          </Text>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={onOpenLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>{t.profile.loginGoogle}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 10, // 10px margin from phone border
    paddingTop: 16,
  },
  profileHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 16,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2.5,
    borderColor: Colors.primaryBorder,
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: Colors.primaryBorder,
  },
  avatarInitials: {
    fontFamily: Fonts.bold,
    fontSize: 34,
    color: Colors.primaryDark,
  },
  profileDetails: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  displayName: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 3,
    textAlign: 'center',
  },
  email: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C6F6D5',
    alignSelf: 'center',
    marginBottom: 12,
  },
  roleBadgeText: {
    fontFamily: Fonts.bold,
    color: '#15803D',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  editProfileBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignSelf: 'center',
    backgroundColor: Colors.white,
  },
  editProfileBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  menuContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuRowText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  menuRowTextRed: {
    color: '#DC2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  guestCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  guestAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestAvatarText: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    color: Colors.textSecondary,
  },
  guestTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 15,
  },
});

export default UserProfileScreen;
