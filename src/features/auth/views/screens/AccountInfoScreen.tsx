import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WhiteTopSafeArea from '../../../../shared/components/WhiteTopSafeArea';
import { useAuthController } from '../../controllers/auth.controller';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import { formatDate } from '../../../../shared/utils/format.utils';
import { useTranslation } from '../../../../shared/localization';
import ArrowLeftIcon from '../../../../assets/icons/arrow_left.svg';

interface Props {
  onBack: () => void;
}

/**
 * AccountInfoScreen
 * Displays full account details of currently signed-in user/admin
 */
const AccountInfoScreen: React.FC<Props> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [authState] = useAuthController();
  const { user, userProfile } = authState;

  const displayName = userProfile?.displayName || user?.displayName || t.appbar.guest;
  const email = userProfile?.email || user?.email || '-';
  const roleText = userProfile?.role === 'admin' ? t.profile.adminBadge : t.profile.userBadge;
  const registeredDate = userProfile?.createdAt ? formatDate(userProfile.createdAt) : '-';
  const lastLoginDate = userProfile?.lastLogin ? formatDate(userProfile.lastLogin) : '-';

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

        <Text style={styles.appBarTitle}>{t.accountInfo.title}</Text>

        <View style={styles.appBarRightSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header Card: Avatar & Name ───────────── */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrapper}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroEmail}>{email}</Text>

          <View
            style={[
              styles.roleBadge,
              userProfile?.role === 'admin'
                ? styles.roleBadgeAdmin
                : styles.roleBadgeUser,
            ]}
          >
            <Text
              style={[
                styles.roleBadgeText,
                userProfile?.role === 'admin'
                  ? styles.roleBadgeTextAdmin
                  : styles.roleBadgeTextUser,
              ]}
            >
              {roleText}
            </Text>
          </View>
        </View>

        {/* ─── Data Details Container ───────────────── */}
        <Text style={styles.sectionTitle}>{t.accountInfo.headerSection}</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t.accountInfo.fullName}</Text>
            <Text style={styles.infoValue}>{displayName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t.accountInfo.email}</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t.accountInfo.role}</Text>
            <Text style={styles.infoValue}>{roleText}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t.accountInfo.registeredDate}</Text>
            <Text style={styles.infoValue}>{registeredDate}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t.accountInfo.lastLogin}</Text>
            <Text style={styles.infoValue}>{lastLoginDate}</Text>
          </View>
        </View>

        {/* ─── Info Box ──────────────────────────────── */}
        <View style={styles.securityBox}>
          <Text style={styles.securityTitle}>{t.accountInfo.securityTitle}</Text>
          <Text style={styles.securityText}>
            {t.accountInfo.securityMessage}
          </Text>
        </View>
      </ScrollView>
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
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 16,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.primaryBorder,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primaryBorder,
  },
  avatarInitials: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    color: Colors.primaryDark,
  },
  heroName: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroEmail: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeAdmin: {
    backgroundColor: '#E8F8EE',
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  roleBadgeUser: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  roleBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  roleBadgeTextAdmin: {
    color: '#15803D',
  },
  roleBadgeTextUser: {
    color: '#2563EB',
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  infoContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  infoRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  securityBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  securityText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

export default AccountInfoScreen;
