import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VillageProfile } from '../../models/Village.model';
import { Colors } from '../../../../shared/constants/colors';
import { Fonts } from '../../../../shared/constants/fonts';

interface Props {
  profile: VillageProfile;
  refreshing: boolean;
  onRefresh: () => void;
}

/**
 * VillageProfileScreen View
 * Menampilkan profil lengkap Desa Dlemer:
 * - Foto banner & identitas desa
 * - Statistik demografi (Penduduk, KK, Luas)
 * - Tautan media sosial & kontak cepat (WhatsApp, Instagram, Facebook, Telepon, Email)
 * - Potensi & keunggulan desa (Highlights)
 * - Visi & Misi serta deskripsi sejarah desa
 */
const VillageProfileScreen: React.FC<Props> = ({ profile, refreshing, onRefresh }) => {
  const insets = useSafeAreaInsets();

  const handleOpenLink = async (url?: string) => {
    if (!url) {return;}
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Gagal Membuka Tautan', 'Tidak dapat membuka tautan ini.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
        />
      }
    >
      {/* ─── Hero Banner ─────────────────────────── */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: profile.imageUrl }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          <View style={styles.badgeKecamatan}>
            <Text style={styles.badgeKecamatanText}>🏛️ Kecamatan Kwanyar</Text>
          </View>
          <Text style={styles.heroVillageName}>{profile.villageName}</Text>
          <Text style={styles.heroLocation}>Kabupaten Bangkalan, Madura</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* ─── Statistik Demografi ───────────────── */}
        <Text style={styles.sectionTitle}>📊 Data Demografi</Text>
        <View style={styles.demographicGrid}>
          <View style={styles.demoCard}>
            <Text style={styles.demoIcon}>👥</Text>
            <Text style={styles.demoValue}>
              {profile.demographics.population.toLocaleString('id-ID')}
            </Text>
            <Text style={styles.demoLabel}>Total Penduduk</Text>
          </View>

          <View style={styles.demoCard}>
            <Text style={styles.demoIcon}>🏠</Text>
            <Text style={styles.demoValue}>
              {profile.demographics.households.toLocaleString('id-ID')}
            </Text>
            <Text style={styles.demoLabel}>Kepala Keluarga</Text>
          </View>

          <View style={styles.demoCard}>
            <Text style={styles.demoIcon}>🗺️</Text>
            <Text style={styles.demoValue}>{profile.demographics.area}</Text>
            <Text style={styles.demoLabel}>Luas Wilayah</Text>
          </View>
        </View>

        {/* ─── Kontak & Sosial Media Cepat ───────── */}
        <Text style={styles.sectionTitle}>📞 Kontak & Media Sosial Resmi</Text>
        <View style={styles.socialRow}>
          {profile.socialMedia.whatsapp ? (
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: '#25D366' }]}
              onPress={() => handleOpenLink(profile.socialMedia.whatsapp)}
              activeOpacity={0.8}
            >
              <Text style={styles.socialBtnText}>💬 WhatsApp</Text>
            </TouchableOpacity>
          ) : null}

          {profile.socialMedia.instagram ? (
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: '#E1306C' }]}
              onPress={() => handleOpenLink(profile.socialMedia.instagram)}
              activeOpacity={0.8}
            >
              <Text style={styles.socialBtnText}>📸 Instagram</Text>
            </TouchableOpacity>
          ) : null}

          {profile.socialMedia.facebook ? (
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: '#1877F2' }]}
              onPress={() => handleOpenLink(profile.socialMedia.facebook)}
              activeOpacity={0.8}
            >
              <Text style={styles.socialBtnText}>📘 Facebook</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.contactDetailsCard}>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleOpenLink(`tel:${profile.contactPhone.replace(/\s+/g, '')}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.contactIcon}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Nomor Telepon Kantor Desa</Text>
              <Text style={styles.contactValue}>{profile.contactPhone}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.contactDivider} />

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleOpenLink(`mailto:${profile.contactEmail}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.contactIcon}>✉️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Email Resmi</Text>
              <Text style={styles.contactValue}>{profile.contactEmail}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── Potensi & Keunggulan Desa ─────────── */}
        <Text style={styles.sectionTitle}>⭐ Potensi & Keunggulan Desa</Text>
        <View style={styles.highlightsContainer}>
          {profile.highlights.map((item, idx) => (
            <View key={idx} style={styles.highlightCard}>
              <View style={styles.highlightHeader}>
                <Text style={styles.highlightIcon}>{item.icon}</Text>
                <Text style={styles.highlightTitle}>{item.title}</Text>
              </View>
              <Text style={styles.highlightDesc}>{item.description}</Text>
            </View>
          ))}
        </View>

        {/* ─── Visi & Misi ───────────────────────── */}
        <Text style={styles.sectionTitle}>🎯 Visi & Misi</Text>
        <View style={styles.visionCard}>
          <Text style={styles.visionText}>{profile.visionMission}</Text>
        </View>

        {/* ─── Tentang Desa ──────────────────────── */}
        <Text style={styles.sectionTitle}>📖 Tentang {profile.villageName}</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>{profile.description}</Text>
          <View style={styles.locationBox}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
        </View>

        <View style={{ height: insets.bottom + 80 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  badgeKecamatan: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(22, 163, 74, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeKecamatanText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 11,
  },
  heroVillageName: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.white,
    marginBottom: 2,
  },
  heroLocation: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#E2E8F0',
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: 18,
    marginBottom: 10,
  },
  demographicGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  demoCard: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  demoIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  demoValue: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  demoLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  socialBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: 12,
  },
  contactDetailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.textMuted,
  },
  contactValue: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  contactDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  highlightsContainer: {
    gap: 10,
  },
  highlightCard: {
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  highlightIcon: {
    fontSize: 18,
  },
  highlightTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  highlightDesc: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  visionCard: {
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  visionText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.primaryDark,
    lineHeight: 20,
  },
  aboutCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aboutText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 12,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  locationIcon: {
    fontSize: 14,
    marginTop: 2,
  },
  locationText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textPrimary,
    flex: 1,
  },
});

export default VillageProfileScreen;
