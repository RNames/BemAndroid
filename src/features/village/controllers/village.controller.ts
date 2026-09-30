import { useState, useEffect, useCallback } from 'react';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { VillageProfile, DEFAULT_VILLAGE_PROFILE } from '../models/Village.model';

export interface VillageState {
  profile: VillageProfile;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export interface VillageActions {
  fetchProfile: () => Promise<void>;
  onRefresh: () => void;
}

export const useVillageController = (): [VillageState, VillageActions] => {
  const [profile, setProfile] = useState<VillageProfile>(DEFAULT_VILLAGE_PROFILE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      const db = getFirestore();
      const profileDocRef = doc(db, 'village_profile', 'main-village');
      const snap = await getDoc(profileDocRef);

      if (snap.exists()) {
        const data = snap.data() as Partial<VillageProfile>;
        setProfile({
          ...DEFAULT_VILLAGE_PROFILE,
          ...data,
          // Tangani jika imageUrl berupa path lokal relatif, gunakan gambar hero fallback berkualitas tinggi
          imageUrl:
            data.imageUrl && data.imageUrl.startsWith('http')
              ? data.imageUrl
              : DEFAULT_VILLAGE_PROFILE.imageUrl,
        });
      } else {
        setProfile(DEFAULT_VILLAGE_PROFILE);
      }
    } catch (err) {
      console.warn('[VillageController] fetchProfile warning, using fallback data:', err);
      // Tetap sediakan profil default agar user tidak melihat layar kosong
      setProfile(DEFAULT_VILLAGE_PROFILE);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return [{ profile, loading, refreshing, error }, { fetchProfile, onRefresh }];
};
