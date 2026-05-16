import { create } from 'zustand';
import { getDatabase } from '../lib/database';
import { Routine, RoutineStep, RoutineLog } from '../types';
import { markPendingSync } from '../lib/sync';
import { useAuthStore } from './authStore';
import { generateId } from '../lib/id';

interface RoutineState {
  routines: Routine[];
  steps: RoutineStep[];
  logs: RoutineLog[];
  isLoading: boolean;
  loadRoutines: () => Promise<void>;
  loadSteps: (routineId: string) => Promise<void>;
  loadLogs: (routineId: string, startDate: string, endDate: string) => Promise<void>;
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'archived'>) => Promise<void>;
  updateRoutine: (id: string, data: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  addStep: (step: Omit<RoutineStep, 'id'>) => Promise<void>;
  removeStep: (id: string, routineId: string) => Promise<void>;
  logRoutine: (routineId: string, date: string, completed: boolean) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  steps: [],
  logs: [],
  isLoading: false,

  loadRoutines: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ isLoading: true });
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM routines WHERE user_id = ? AND archived = 0 ORDER BY created_at DESC',
      user.id
    );
    const routines: Routine[] = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      description: r.description,
      icon: r.icon,
      color: r.color,
      daysOfWeek: JSON.parse(r.days_of_week || '[]'),
      timeOfDay: r.time_of_day,
      estimatedMinutes: r.estimated_minutes,
      createdAt: r.created_at,
      archived: !!r.archived,
    }));
    set({ routines, isLoading: false });
  },

  loadSteps: async (routineId) => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM routine_steps WHERE routine_id = ? ORDER BY "order" ASC',
      routineId
    );
    const steps: RoutineStep[] = rows.map(r => ({
      id: r.id,
      routineId: r.routine_id,
      title: r.title,
      durationMinutes: r.duration_minutes,
      order: r.order,
    }));
    set({ steps });
  },

  loadLogs: async (routineId, startDate, endDate) => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM routine_logs WHERE routine_id = ? AND date >= ? AND date <= ? ORDER BY date',
      routineId, startDate, endDate
    );
    const logs: RoutineLog[] = rows.map(r => ({
      id: r.id,
      routineId: r.routine_id,
      userId: r.user_id,
      date: r.date,
      completed: !!r.completed,
      startedAt: r.started_at,
      completedAt: r.completed_at,
    }));
    set({ logs });
  },

  addRoutine: async (routine) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const id = generateId();
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO routines (id, user_id, name, description, icon, color, days_of_week, time_of_day, estimated_minutes, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      id, user.id, routine.name, routine.description ?? null, routine.icon, routine.color,
      JSON.stringify(routine.daysOfWeek), routine.timeOfDay ?? null, routine.estimatedMinutes
    );
    await markPendingSync('routines', id, 'insert', {
      id, user_id: user.id, name: routine.name, description: routine.description ?? null,
      icon: routine.icon, color: routine.color, days_of_week: JSON.stringify(routine.daysOfWeek),
      time_of_day: routine.timeOfDay ?? null, estimated_minutes: routine.estimatedMinutes,
    });
    await get().loadRoutines();
  },

  updateRoutine: async (id, data) => {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: any[] = [];
    Object.entries(data).forEach(([key, value]) => {
      const col = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
      fields.push(`${col} = ?`);
      values.push(typeof value === 'object' ? JSON.stringify(value) : value);
    });
    values.push(id);
    await db.runAsync(
      `UPDATE routines SET ${fields.join(', ')}, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?`,
      ...values
    );
    await markPendingSync('routines', id, 'update', { id, ...data });
    await get().loadRoutines();
  },

  deleteRoutine: async (id) => {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM routine_steps WHERE routine_id = ?", id);
    await db.runAsync("DELETE FROM routine_logs WHERE routine_id = ?", id);
    await db.runAsync("DELETE FROM routines WHERE id = ?", id);
    await get().loadRoutines();
  },

  addStep: async (step) => {
    const id = generateId();
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO routine_steps (id, routine_id, title, duration_minutes, "order", sync_status, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\'))',
      id, step.routineId, step.title, step.durationMinutes, step.order
    );
    await markPendingSync('routine_steps', id, 'insert', {
      id, routine_id: step.routineId, title: step.title,
      duration_minutes: step.durationMinutes, order: step.order,
    });
    await get().loadSteps(step.routineId);
  },

  removeStep: async (id, routineId) => {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM routine_steps WHERE id = ?", id);
    await get().loadSteps(routineId);
  },

  logRoutine: async (routineId, date, completed) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const db = await getDatabase();
    const existing = await db.getFirstAsync<any>(
      'SELECT * FROM routine_logs WHERE routine_id = ? AND date = ?', routineId, date
    );
    if (existing) {
      await db.runAsync(
        "UPDATE routine_logs SET completed = ?, completed_at = ?, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?",
        completed ? 1 : 0, completed ? new Date().toISOString() : null, existing.id
      );
      await markPendingSync('routine_logs', existing.id, 'update', {
        id: existing.id, completed, completed_at: completed ? new Date().toISOString() : null,
      });
    } else {
      const id = generateId();
      await db.runAsync(
        'INSERT INTO routine_logs (id, routine_id, user_id, date, completed, completed_at, sync_status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))',
        id, routineId, user.id, date, completed ? 1 : 0,
        completed ? new Date().toISOString() : null
      );
      await markPendingSync('routine_logs', id, 'insert', {
        id, routine_id: routineId, user_id: user.id, date, completed,
      });
    }
    const startDate = date;
    await get().loadLogs(routineId, startDate, startDate);
  },
}));
