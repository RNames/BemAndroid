import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
} from '@react-native-firebase/firestore';
import { APP_VERSION } from '../constants/appVersion';

export interface VersionCheckResult {
  hasUpdate: boolean;
  forceUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
  releaseNotes?: string;
}

/**
 * Membandingkan 2 string versi semver (misal '1.0.0' vs '1.1.0')
 * Mengembalikan:
 * - -1 jika v1 < v2 (butuh update)
 * -  0 jika v1 == v2
 * -  1 jika v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const cleanV1 = v1.replace(/^v/, '').split('.').map(Number);
  const cleanV2 = v2.replace(/^v/, '').split('.').map(Number);

  const len = Math.max(cleanV1.length, cleanV2.length);
  for (let i = 0; i < len; i++) {
    const num1 = cleanV1[i] || 0;
    const num2 = cleanV2[i] || 0;
    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }
  return 0;
}

/**
 * Memeriksa pembaruan versi aplikasi dari basis data desa (Firestore /app_config/version)
 * URL website default mengarah ke portal resmi desa Dlemer
 */
export async function checkAppUpdate(): Promise<VersionCheckResult> {
  const defaultWebsiteUrl = 'https://risetbemgtd2026.vercel.app/';

  try {
    const db = getFirestore();
    let data: any = null;

    // 1. Cek document spesifik 'version'
    const configDocRef = doc(db, 'app_config', 'version');
    const docSnap = await getDoc(configDocRef);

    const isDocExists =
      typeof docSnap?.exists === 'function'
        ? docSnap.exists()
        : Boolean(docSnap?.exists);

    if (isDocExists) {
      data = docSnap.data();
    } else {
      // 2. Fallback: jika document dibuat dengan ID lain di collection 'app_config'
      const colRef = collection(db, 'app_config');
      const colSnap = await getDocs(colRef);
      if (!colSnap.empty) {
        data = colSnap.docs[0].data();
      }
    }

    console.log('[VersionService] Fetched app_config data:', data);

    if (data) {
      // Mendukung berbagai penamaan field (latestVersion, latest, version, latest_version, dll)
      const latestVersion = String(
        data.latestVersion ||
          data.latest ||
          data.version ||
          data.latest_version ||
          data.newVersion ||
          data.new_version ||
          APP_VERSION,
      );
      const minVersion = String(
        data.minVersion ||
          data.min ||
          data.min_version ||
          data.minimumVersion ||
          latestVersion,
      );
      const downloadUrl = String(
        data.downloadUrl ||
          data.download_url ||
          data.download ||
          data.url ||
          data.apk_url ||
          data.link ||
          defaultWebsiteUrl,
      );
      const releaseNotes = String(
        data.releaseNotes ||
          data.release_notes ||
          data.whats_new ||
          data.whatsNew ||
          data.notes ||
          data.changelog ||
          'Pembaruan performa dan fitur terbaru aplikasi desa.',
      );
      const forceUpdateFlag = Boolean(
        data.forceUpdate ??
          data.force_update ??
          data.force ??
          data.isForceUpdate ??
          data.is_force_update ??
          false,
      );

      const isOutdated = compareVersions(APP_VERSION, latestVersion) < 0;
      const isForceUpdate =
        compareVersions(APP_VERSION, minVersion) < 0 || forceUpdateFlag;

      return {
        hasUpdate: isOutdated,
        forceUpdate: isForceUpdate,
        currentVersion: APP_VERSION,
        latestVersion,
        downloadUrl,
        releaseNotes,
      };
    }
  } catch (err) {
    console.warn('[VersionService] Check app update error from Firestore:', err);
  }

  return {
    hasUpdate: false,
    forceUpdate: false,
    currentVersion: APP_VERSION,
    latestVersion: APP_VERSION,
    downloadUrl: defaultWebsiteUrl,
  };
}
