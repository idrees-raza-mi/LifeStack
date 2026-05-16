import { create } from 'zustand';
import { getDatabase } from '../lib/database';
import { HealthEntry } from '../types';
import { markPendingSync } from '../lib/sync';
import { useAuthStore } from './authStore';
import { generateId } from '../lib/id';

interface HealthState {
  entries: HealthEntry[];
  isLoading: boolean;
  loadEntries: (startDate: string, endDate: string) => Promise<void>;
  getEntry: (date: string) => HealthEntry | undefined;
  saveEntry: (date: string, data: Partial<Omit<HealthEntry, 'id' | 'userId' | 'date'>>) => Promise<void>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  entries: [],
  isLoading: false,

  loadEntries: async (startDate, endDate) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ isLoading: true });
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM health_entries WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date DESC',
      user.id, startDate, endDate
    );
    const entries: HealthEntry[] = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      date: r.date,
      steps: r.steps,
      waterMl: r.water_ml,
      calories: r.calories,
      sleepHours: r.sleep_hours,
      weightKg: r.weight_kg,
      notes: r.notes,
    }));
    set({ entries, isLoading: false });
  },

  getEntry: (date) => {
    return get().entries.find(e => e.date === date);
  },

  saveEntry: async (date, data) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const db = await getDatabase();
    const existing = await db.getFirstAsync<any>(
      'SELECT * FROM health_entries WHERE user_id = ? AND date = ?', user.id, date
    );
    if (existing) {
      await db.runAsync(
        `UPDATE health_entries SET steps = ?, water_ml = ?, calories = ?, sleep_hours = ?, weight_kg = ?, notes = ?,
         sync_status = 'pending', updated_at = datetime('now') WHERE id = ?`,
        data.steps ?? existing.steps, data.waterMl ?? existing.water_ml,
        data.calories ?? existing.calories, data.sleepHours ?? existing.sleep_hours,
        data.weightKg ?? existing.weight_kg, data.notes ?? existing.notes,
        existing.id
      );
      await markPendingSync('health_entries', existing.id, 'update', {
        id: existing.id, date, ...data,
      });
    } else {
      const id = generateId();
      await db.runAsync(
        `INSERT INTO health_entries (id, user_id, date, steps, water_ml, calories, sleep_hours, weight_kg, notes, sync_status, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
        id, user.id, date, data.steps ?? null, data.waterMl ?? null, data.calories ?? null,
        data.sleepHours ?? null, data.weightKg ?? null, data.notes ?? null
      );
      await markPendingSync('health_entries', id, 'insert', {
        id, user_id: user.id, date, ...data,
      });
    }
    await get().loadEntries(date, date);
  },
}));
