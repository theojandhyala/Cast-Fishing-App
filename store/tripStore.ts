import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../data/tripData';

interface TripState {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  removeTrip: (id: string) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  loadTrips: () => Promise<void>;
  getUpcomingTrips: () => Trip[];
  getPastTrips: () => Trip[];
}

const generateId = () => 'trip_' + Math.random().toString(36).substr(2, 9);

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],

  loadTrips: async () => {
    try {
      const stored = await AsyncStorage.getItem('cast_trips');
      if (stored) {
        const parsed = JSON.parse(stored);
        const trips = Array.isArray(parsed) ? parsed.filter((trip) => !String(trip.id).match(/^trip[1-4]$/)) : [];
        set({ trips });
        await AsyncStorage.setItem('cast_trips', JSON.stringify(trips));
      } else set({ trips: [] });
    } catch {}
  },

  addTrip: async (trip) => {
    const newTrip: Trip = { ...trip, id: generateId() };
    const updated = [newTrip, ...get().trips];
    set({ trips: updated });
    await AsyncStorage.setItem('cast_trips', JSON.stringify(updated));
  },

  removeTrip: async (id) => {
    const updated = get().trips.filter(t => t.id !== id);
    set({ trips: updated });
    await AsyncStorage.setItem('cast_trips', JSON.stringify(updated));
  },

  updateTrip: async (id, updates) => {
    const updated = get().trips.map(t => t.id === id ? { ...t, ...updates } : t);
    set({ trips: updated });
    await AsyncStorage.setItem('cast_trips', JSON.stringify(updated));
  },

  getUpcomingTrips: () => {
    const now = new Date();
    return get().trips.filter(t => t.status === 'upcoming' && new Date(t.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  getPastTrips: () => {
    return get().trips.filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
}));
