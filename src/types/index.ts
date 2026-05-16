export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[];
  reminderEnabled: boolean;
  reminderTime?: string;
  createdAt: string;
  archived: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
  note?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  archived: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'active' | 'completed' | 'abandoned';
  progress: number;
  createdAt: string;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  daysOfWeek: number[];
  timeOfDay?: string;
  estimatedMinutes: number;
  createdAt: string;
  archived: boolean;
}

export interface RoutineStep {
  id: string;
  routineId: string;
  title: string;
  durationMinutes: number;
  order: number;
}

export interface RoutineLog {
  id: string;
  routineId: string;
  userId: string;
  date: string;
  completed: boolean;
  startedAt?: string;
  completedAt?: string;
}

export interface HealthEntry {
  id: string;
  userId: string;
  date: string;
  steps?: number;
  waterMl?: number;
  calories?: number;
  sleepHours?: number;
  weightKg?: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'full_body';
  icon: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  name: string;
  date: string;
  durationMinutes: number;
  notes?: string;
  createdAt: string;
}

export interface WorkoutSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  done: boolean;
}

export type SyncStatus = 'synced' | 'pending' | 'conflict';
export type Syncable = { syncStatus: SyncStatus; updatedAt: string };
