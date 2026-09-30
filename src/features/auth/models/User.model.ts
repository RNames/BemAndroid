/**
 * User Model
 * Mendefinisikan struktur data profil pengguna dari Firestore (/admin_users)
 */
export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoUrl?: string;
  role: UserRole;
  createdAt: number;
  lastLogin: number;
}
