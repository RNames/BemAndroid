import { useState, useCallback } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from '@react-native-firebase/firestore';
import { EventItem, EventCategory } from '../models/Event.model';

export interface EventState {
  events: EventItem[];
  filtered: EventItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export type EventSortOption =
  | 'newest'
  | 'oldest'
  | 'name_asc'
  | 'name_desc';

export interface EventActions {
  fetchEvents: () => Promise<void>;
  onRefresh: () => void;
  applyFilter: (
    search: string,
    category: EventCategory,
    sortBy?: EventSortOption,
  ) => void;
  addEvent: (
    newEventData: {
      title: string;
      category: EventCategory;
      organizer: string;
      date: number;
      endDate?: number;
      location: string;
      description: string;
      imageUrl: string;
    },
    userUid: string,
  ) => Promise<boolean>;
}

// Cache acara di level modul
let cachedEvents: EventItem[] = [];
let isEventsLoaded = false;

export const useEventController = (): [EventState, EventActions] => {
  const [events, setEvents] = useState<EventItem[]>(cachedEvents);
  const [filtered, setFiltered] = useState<EventItem[]>(cachedEvents);
  const [loading, setLoading] = useState(!isEventsLoaded);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      if (!isEventsLoaded) {
        setLoading(true);
      }

      const db = getFirestore();
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(eventsRef);

      const parseTs = (val: any): number => {
        if (!val) return Date.now();
        if (typeof val === 'number') return val;
        if (typeof val.toMillis === 'function') return val.toMillis();
        if (typeof val.toDate === 'function') return val.toDate().getTime();
        if (typeof val.seconds === 'number') return val.seconds * 1000;
        const n = Number(val);
        return isNaN(n) ? Date.now() : n;
      };

      const data: EventItem[] = snapshot.docs.map(docSnap => {
        const raw = docSnap.data();
        return {
          id: docSnap.id,
          title: String(raw.title || ''),
          category: String(raw.category || 'Lainnya'),
          organizer: String(raw.organizer || ''),
          location: String(raw.location || ''),
          description: String(raw.description || ''),
          imageUrl: String(raw.imageUrl || ''),
          date: parseTs(raw.date),
          endDate: raw.endDate ? parseTs(raw.endDate) : undefined,
          createdAt: parseTs(raw.createdAt),
          updatedAt: parseTs(raw.updatedAt),
          approved: Boolean(raw.approved),
          createdBy: String(raw.createdBy || ''),
        };
      });

      // Urutkan acara berdasarkan tanggal terdekat lebih dulu
      data.sort((a, b) => a.date - b.date);

      cachedEvents = data;
      isEventsLoaded = true;

      setEvents(data);
      setFiltered(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat acara.';
      setError(message);
      console.error('[EventController] fetchEvents error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  /**
   * Filter acara berdasarkan pencarian teks, kategori, dan pengurutan
   */
  const applyFilter = useCallback(
    (
      search: string,
      category: EventCategory,
      sortBy: EventSortOption = 'newest',
    ) => {
      let result = [...events];

      if (category !== 'Semua') {
        result = result.filter(e => e.category === category);
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        result = result.filter(
          e =>
            e.title.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            e.organizer.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q),
        );
      }

      // Pengurutan (Sorting)
      result.sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return (a.date || a.createdAt || 0) - (b.date || b.createdAt || 0);
          case 'name_asc':
            return a.title.localeCompare(b.title);
          case 'name_desc':
            return b.title.localeCompare(a.title);
          case 'newest':
          default:
            return (b.date || b.createdAt || 0) - (a.date || a.createdAt || 0);
        }
      });

      setFiltered(result);
    },
    [events],
  );

  /**
   * Tambah acara baru ke koleksi /events (status approved: false / pending review admin)
   */
  const addEvent = useCallback(
    async (
      newEventData: {
        title: string;
        category: EventCategory;
        organizer: string;
        date: number;
        endDate?: number;
        location: string;
        description: string;
        imageUrl: string;
      },
      userUid: string,
    ): Promise<boolean> => {
      try {
        const db = getFirestore();
        const timestamp = Date.now();
        const docId = `event_${timestamp}`;
        const newEventRef = doc(db, 'events', docId);

        const eventPayload: Record<string, any> = {
          id: docId,
          title: newEventData.title.trim(),
          category: newEventData.category,
          organizer: newEventData.organizer.trim(),
          date: Number(newEventData.date),
          location: newEventData.location.trim(),
          description: newEventData.description.trim(),
          imageUrl:
            newEventData.imageUrl.trim() ||
            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=60',
          approved: false, // Status pending/false menunggu ACC admin
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: userUid,
        };

        if (newEventData.endDate && !isNaN(Number(newEventData.endDate))) {
          eventPayload.endDate = Number(newEventData.endDate);
        }

        await setDoc(newEventRef, eventPayload);

        // Segarkan data acara
        await fetchEvents();
        return true;
      } catch (err) {
        console.error('[EventController] addEvent error:', err);
        return false;
      }
    },
    [fetchEvents],
  );

  const state: EventState = {
    events,
    filtered,
    loading,
    refreshing,
    error,
  };

  const actions: EventActions = {
    fetchEvents,
    onRefresh,
    applyFilter,
    addEvent,
  };

  return [state, actions];
};
