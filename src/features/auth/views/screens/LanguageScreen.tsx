import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation, LanguageCode } from '../../../../shared/localization';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';
import ArrowLeftIcon from '../../../../assets/icons/arrow_left.svg';

interface Props {
  onBack: () => void;
}

interface LanguageOption {
  id: LanguageCode;
  name: string;
  nativeName: string;
  tag?: string;
}

/**
 * LanguageScreen
 * Menampilkan opsi pemilihan bahasa antarmuka aplikasi (Bahasa Indonesia & English)
 */
const LanguageScreen: React.FC<Props> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { currentLang, setLanguage, t } = useTranslation();

  const languageOptions: LanguageOption[] = [
    {
      id: 'id',
      name: t.language.indonesian,
      nativeName: 'Bahasa Indonesia',
      tag: t.language.defaultTag,
    },
    {
      id: 'en',
      name: t.language.english,
      nativeName: 'English (US)',
      tag: t.language.availableTag,
    },
  ];

  const handleSelect = (lang: LanguageOption) => {
    setLanguage(lang.id);
    ToastAndroid.show(t.language.switchSuccess, ToastAndroid.SHORT);
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

        <Text style={styles.appBarTitle}>{t.language.title}</Text>

        <View style={styles.appBarRightSpacer} />
      </View>

      <View
        style={[
          styles.container,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Text style={styles.sectionHeader}>{t.language.selectLanguage}</Text>

        {/* ─── Language Cards Container ────────────────── */}
        <View style={styles.cardContainer}>
          {languageOptions.map((lang, index) => {
            const isSelected = currentLang === lang.id;
            const isLast = index === languageOptions.length - 1;

            return (
              <React.Fragment key={lang.id}>
                <TouchableOpacity
                  style={styles.langRow}
                  onPress={() => handleSelect(lang)}
                  activeOpacity={0.7}
                >
                  <View style={styles.langDetails}>
                    <View style={styles.titleRow}>
                      <Text style={styles.langName}>{lang.name}</Text>
                      {lang.tag && (
                        <View
                          style={[
                            styles.tagBadge,
                            isSelected
                              ? styles.tagBadgeActive
                              : styles.tagBadgeNeutral,
                          ]}
                        >
                          <Text
                            style={[
                              styles.tagBadgeText,
                              isSelected
                                ? styles.tagBadgeActiveText
                                : styles.tagBadgeNeutralText,
                            ]}
                          >
                            {isSelected ? t.language.activeTag : lang.tag}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.nativeName}>{lang.nativeName}</Text>
                  </View>

                  {/* Radio Indicator */}
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterActive,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>

                {!isLast && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
        </View>

        {/* ─── Info Box ──────────────────────────────── */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{t.language.infoTitle}</Text>
          <Text style={styles.infoText}>{t.language.infoText}</Text>
        </View>
      </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 16,
  },
  sectionHeader: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardContainer: {
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
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  langDetails: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  langName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  nativeName: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeActive: {
    backgroundColor: '#E8F8EE',
  },
  tagBadgeNeutral: {
    backgroundColor: '#F1F5F9',
  },
  tagBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
  },
  tagBadgeActiveText: {
    color: '#15803D',
  },
  tagBadgeNeutralText: {
    color: Colors.textSecondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioOuterActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

export default LanguageScreen;
