import { create } from 'zustand';
import { getDatabase } from '../lib/database';
import { Habit, HabitLog } from '../types';
import { markPendingSync } from '../lib/sync';
import { useAuthStore } from './authStore';
import { generateId } from '../lib/id';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  isLoading: boolean;
  loadHabits: () => Promise<void>;
  loadLogs: (habitId: string, startDate: string, endDate: string) => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleLog: (habitId: string, date: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: [],
  isLoading: false,

  loadHabits: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ isLoading: true });
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM habits WHERE user_id = ? AND archived = 0 ORDER BY created_at DESC',
      user.id
    );
    const habits: Habit[] = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      description: r.description,
      icon: r.icon,
      color: r.color,
      frequency: r.frequency,
      customDays: r.custom_days ? JSON.parse(r.custom_days) : undefined,
      reminderEnabled: !!r.reminder_enabled,
      reminderTime: r.reminder_time,
      createdAt: r.created_at,
      archived: !!r.archived,
    }));
    set({ habits, isLoading: false });
  },

  loadLogs: async (habitId, startDate, endDate) => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date >= ? AND date <= ? ORDER BY date',
      habitId, startDate, endDate
    );
    const newLogs: HabitLog[] = rows.map(r => ({
      id: r.id,
      habitId: r.habit_id,
      userId: r.user_id,
      date: r.date,
      completed: !!r.completed,
      note: r.note,
    }));
    set(state => {
      const filtered = state.logs.filter(l => !(l.habitId === habitId));
      return { logs: [...filtered, ...newLogs] };
    });
  },

  addHabit: async (habit) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const id = generateId();
    const db = await getDatabase();
    const data = {
      id, user_id: user.id, name: habit.name, description: habit.description ?? null,
      icon: habit.icon, color: habit.color, frequency: habit.frequency,
      custom_days: habit.customDays ? JSON.stringify(habit.customDays) : null,
      reminder_enabled: habit.reminderEnabled ? 1 : 0,
      reminder_time: habit.reminderTime ?? null,
    };
    await db.runAsync(
      `INSERT INTO habits (id, user_id, name, description, icon, color, frequency, custom_days, reminder_enabled, reminder_time, sync_status, updated_at)
       VALUES ($id, $user_id, $name, $description, $icon, $color, $frequency, $custom_days, $reminder_enabled, $reminder_time, 'pending', datetime('now'))`,
      data
    );
    await markPendingSync('habits', id, 'insert', { ...data, user_id: user.id });
    await get().loadHabits();
  },

  updateHabit: async (id, data) => {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: any[] = [];
    Object.entries(data).forEach(([key, value]) => {
      const col = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
      fields.push(`${col} = ?`);
      values.push(value);
    });
    values.push(id);
    await db.runAsync(
      `UPDATE habits SET ${fields.join(', ')}, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?`,
      ...values
    );
    await markPendingSync('habits', id, 'update', { id, ...data });
    await get().loadHabits();
  },

  deleteHabit: async (id) => {
    const db = await getDatabase();
    await db.runAsync("UPDATE habits SET archived = 1, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?", id);
    await markPendingSync('habits', id, 'delete', { id, archived: true });
    await get().loadHabits();
  },

  toggleLog: async (habitId, date) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const db = await getDatabase();
    const existing = await db.getFirstAsync<any>(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?', habitId, date
    );
    if (existing) {
      await db.runAsync(
        "UPDATE habit_logs SET completed = ?, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?",
        existing.completed ? 0 : 1, existing.id
      );
      await markPendingSync('habit_logs', existing.id, 'update', { id: existing.id, completed: existing.completed ? 0 : 1 });
    } else {
      const id = generateId();
      await db.runAsync(
        'INSERT INTO habit_logs (id, habit_id, user_id, date, completed, sync_status, updated_at) VALUES (?, ?, ?, ?, 1, ?, datetime(?, \'localtime\'))',
        id, habitId, user.id, date, 'pending'
      );
      await markPendingSync('habit_logs', id, 'insert', { id, habit_id: habitId, user_id: user.id, date, completed: true });
    }
    await get().loadLogs(habitId, date, date);
  },
}));
