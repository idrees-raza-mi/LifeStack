import { create } from 'zustand';
import { getDatabase } from '../lib/database';
import { WorkoutSession, WorkoutSet, Exercise } from '../types';
import { markPendingSync } from '../lib/sync';
import { useAuthStore } from './authStore';
import { generateId } from '../lib/id';

const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'bench-press', name: 'Bench Press', category: 'chest', icon: 'fitness' },
  { id: 'squat', name: 'Squat', category: 'legs', icon: 'fitness' },
  { id: 'deadlift', name: 'Deadlift', category: 'back', icon: 'fitness' },
  { id: 'overhead-press', name: 'Overhead Press', category: 'shoulders', icon: 'fitness' },
  { id: 'barbell-row', name: 'Barbell Row', category: 'back', icon: 'fitness' },
  { id: 'pull-up', name: 'Pull Up', category: 'back', icon: 'fitness' },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', category: 'arms', icon: 'fitness' },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'arms', icon: 'fitness' },
  { id: 'leg-press', name: 'Leg Press', category: 'legs', icon: 'fitness' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'back', icon: 'fitness' },
  { id: 'cable-fly', name: 'Cable Fly', category: 'chest', icon: 'fitness' },
  { id: 'plank', name: 'Plank', category: 'core', icon: 'fitness' },
  { id: 'running', name: 'Running', category: 'cardio', icon: 'walk' },
  { id: 'cycling', name: 'Cycling', category: 'cardio', icon: 'bicycle' },
];

interface GymState {
  sessions: WorkoutSession[];
  currentSession: WorkoutSession | null;
  currentSets: WorkoutSet[];
  exercises: Exercise[];
  isLoading: boolean;
  loadSessions: () => Promise<void>;
  loadExercises: () => Promise<void>;
  startSession: (name: string) => Promise<void>;
  endSession: (durationMinutes: number, notes?: string) => Promise<void>;
  loadSessionSets: (sessionId: string) => Promise<void>;
  addSet: (exercise: { id: string; name: string }, reps: number, weightKg: number) => Promise<void>;
  toggleSet: (setId: string) => Promise<void>;
  removeSet: (setId: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

export const useGymStore = create<GymState>((set, get) => ({
  sessions: [],
  currentSession: null,
  currentSets: [],
  exercises: DEFAULT_EXERCISES,
  isLoading: false,

  loadSessions: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ isLoading: true });
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY created_at DESC',
      user.id
    );
    const sessions: WorkoutSession[] = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      date: r.date,
      durationMinutes: r.duration_minutes,
      notes: r.notes,
      createdAt: r.created_at,
    }));
    set({ sessions, isLoading: false });
  },

  loadExercises: async () => {
    const db = await getDatabase();
    const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM exercises');
    if (count?.count === 0) {
      for (const ex of DEFAULT_EXERCISES) {
        await db.runAsync(
          'INSERT OR IGNORE INTO exercises (id, name, category, icon) VALUES (?, ?, ?, ?)',
          ex.id, ex.name, ex.category, ex.icon
        );
      }
    }
    const rows = await db.getAllAsync<any>('SELECT * FROM exercises ORDER BY category, name');
    const exercises: Exercise[] = rows.map(r => ({
      id: r.id, name: r.name, category: r.category, icon: r.icon,
    }));
    set({ exercises: exercises.length > 0 ? exercises : DEFAULT_EXERCISES });
  },

  startSession: async (name) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const id = generateId();
    const date = new Date().toISOString().split('T')[0];
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO workout_sessions (id, user_id, name, date, duration_minutes, sync_status, updated_at)
       VALUES (?, ?, ?, ?, 0, 'pending', datetime('now'))`,
      id, user.id, name, date
    );
    await markPendingSync('workout_sessions', id, 'insert', {
      id, user_id: user.id, name, date, duration_minutes: 0,
    });
    const session: WorkoutSession = { id, userId: user.id, name, date, durationMinutes: 0, createdAt: new Date().toISOString() };
    set({ currentSession: session, currentSets: [] });
    await get().loadSessions();
  },

  endSession: async (durationMinutes, notes) => {
    const session = get().currentSession;
    if (!session) return;
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE workout_sessions SET duration_minutes = ?, notes = ?, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?",
      durationMinutes, notes ?? null, session.id
    );
    await markPendingSync('workout_sessions', session.id, 'update', {
      id: session.id, duration_minutes: durationMinutes, notes,
    });
    set({ currentSession: null, currentSets: [] });
    await get().loadSessions();
  },

  loadSessionSets: async (sessionId) => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM workout_sets WHERE session_id = ? ORDER BY set_number ASC',
      sessionId
    );
    const sets: WorkoutSet[] = rows.map(r => ({
      id: r.id,
      sessionId: r.session_id,
      exerciseId: r.exercise_id,
      exerciseName: r.exercise_name,
      setNumber: r.set_number,
      reps: r.reps,
      weightKg: r.weight_kg,
      done: !!r.done,
    }));
    set({ currentSets: sets });
  },

  addSet: async (exercise, reps, weightKg) => {
    const session = get().currentSession;
    if (!session) return;
    const id = generateId();
    const db = await getDatabase();
    const nextSet = get().currentSets.filter(s => s.exerciseId === exercise.id).length + 1;
    await db.runAsync(
      'INSERT INTO workout_sets (id, session_id, exercise_id, exercise_name, set_number, reps, weight_kg, done, sync_status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, datetime(\'now\'))',
      id, session.id, exercise.id, exercise.name, nextSet, reps, weightKg
    );
    await markPendingSync('workout_sets', id, 'insert', {
      id, session_id: session.id, exercise_id: exercise.id,
      exercise_name: exercise.name, set_number: nextSet, reps, weight_kg: weightKg,
    });
    await get().loadSessionSets(session.id);
  },

  toggleSet: async (setId) => {
    const db = await getDatabase();
    const set = await db.getFirstAsync<any>('SELECT * FROM workout_sets WHERE id = ?', setId);
    if (!set) return;
    const done = set.done ? 0 : 1;
    await db.runAsync(
      "UPDATE workout_sets SET done = ?, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?",
      done, setId
    );
    const session = get().currentSession;
    if (session) await get().loadSessionSets(session.id);
  },

  removeSet: async (setId) => {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM workout_sets WHERE id = ?", setId);
    const session = get().currentSession;
    if (session) await get().loadSessionSets(session.id);
  },

  deleteSession: async (id) => {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM workout_sets WHERE session_id = ?", id);
    await db.runAsync("DELETE FROM workout_sessions WHERE id = ?", id);
    if (get().currentSession?.id === id) {
      set({ currentSession: null, currentSets: [] });
    }
    await get().loadSessions();
  },
}));
