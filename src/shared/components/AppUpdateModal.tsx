import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { useTranslation } from '../localization';

interface Props {
  visible: boolean;
  onClose: () => void;
  latestVersion: string;
  currentVersion: string;
  downloadUrl: string;
  releaseNotes?: string;
  forceUpdate?: boolean;
}

/**
 * AppUpdateModal
 * Displays app update dialog prompting users to download latest APK from the village profile website
 */
const AppUpdateModal: React.FC<Props> = ({
  visible,
  onClose,
  latestVersion,
  currentVersion,
  downloadUrl,
  releaseNotes,
  forceUpdate = false,
}) => {
  const { t } = useTranslation();

  const handleOpenDownloadUrl = async () => {
    try {
      await Linking.openURL(downloadUrl);
    } catch {
      Alert.alert(
        t.appUpdate.linkErrorTitle,
        t.appUpdate.linkErrorMessage,
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !forceUpdate && onClose()}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🚀</Text>
          </View>

          <Text style={styles.title}>{t.appUpdate.title}</Text>
          <Text style={styles.subtitle}>
            {t.appUpdate.subtitle(latestVersion)}
          </Text>

          {/* Version Badges */}
          <View style={styles.versionBadgeRow}>
            <View style={styles.versionBadgeOld}>
              <Text style={styles.versionBadgeOldText}>
                {t.appUpdate.currentVersion} v{currentVersion}
              </Text>
            </View>
            <Text style={styles.arrowText}>➔</Text>
            <View style={styles.versionBadgeNew}>
              <Text style={styles.versionBadgeNewText}>
                {t.appUpdate.latestVersion} v{latestVersion}
              </Text>
            </View>
          </View>

          {/* Release Notes */}
          {releaseNotes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>{t.appUpdate.whatsNew}</Text>
              <Text style={styles.notesContent}>{releaseNotes}</Text>
            </View>
          )}

          {/* Mandatory Notice Banner (Force Update) */}
          {forceUpdate && (
            <View style={styles.mandatoryBox}>
              <Text style={styles.mandatoryText}>
                ⚠️ {t.appUpdate.mandatoryNotice}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={handleOpenDownloadUrl}
            activeOpacity={0.85}
          >
            <Text style={styles.updateBtnText}>{t.appUpdate.updateNow}</Text>
          </TouchableOpacity>

          {!forceUpdate && (
            <TouchableOpacity
              style={styles.laterBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.laterBtnText}>{t.appUpdate.later}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 34,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  versionBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  versionBadgeOld: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  versionBadgeOldText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  arrowText: {
    fontFamily: Fonts.bold,
    color: Colors.primary,
    fontSize: 12,
  },
  versionBadgeNew: {
    backgroundColor: '#E8F8EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  versionBadgeNewText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: '#15803D',
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  notesTitle: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  notesContent: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  mandatoryBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginBottom: 16,
  },
  mandatoryText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 17,
  },
  updateBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateBtnText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 14,
  },
  laterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  laterBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
});

export default AppUpdateModal;
