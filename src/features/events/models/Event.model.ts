/**
 * Event Model
 * Mendefinisikan struktur data acara desa (/events) di Firestore
 */

export type EventCategory =
  | 'Semua'
  | 'Keagamaan'
  | 'Olahraga'
  | 'Kebudayaan'
  | 'Pendidikan'
  | 'Sosial'
  | 'Pemerintahan'
  | 'Lainnya';

export const EVENT_CATEGORIES: EventCategory[] = [
  'Semua',
  'Keagamaan',
  'Olahraga',
  'Kebudayaan',
  'Pendidikan',
  'Sosial',
  'Pemerintahan',
  'Lainnya',
];

export interface EventItem {
  id: string;
  title: string;
  category: string;
  organizer: string;
  date: number; // Start timestamp (ms)
  endDate?: number; // End timestamp (ms, opsional)
  location: string;
  description: string;
  imageUrl: string;
  approved: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}
