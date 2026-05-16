import { create } from 'zustand';
import { getDatabase } from '../lib/database';
import { Goal, GoalMilestone } from '../types';
import { markPendingSync } from '../lib/sync';
import { useAuthStore } from './authStore';
import { generateId } from '../lib/id';

interface GoalState {
  goals: Goal[];
  milestones: GoalMilestone[];
  isLoading: boolean;
  loadGoals: () => Promise<void>;
  loadMilestones: (goalId: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'progress'>) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addMilestone: (milestone: Omit<GoalMilestone, 'id' | 'completed'>) => Promise<void>;
  toggleMilestone: (id: string, goalId: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  milestones: [],
  isLoading: false,

  loadGoals: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ isLoading: true });
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
      user.id
    );
    const goals: Goal[] = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      description: r.description,
      targetDate: r.target_date,
      status: r.status,
      progress: r.progress,
      createdAt: r.created_at,
    }));
    set({ goals, isLoading: false });
  },

  loadMilestones: async (goalId) => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM goal_milestones WHERE goal_id = ? ORDER BY "order" ASC',
      goalId
    );
    const milestones: GoalMilestone[] = rows.map(r => ({
      id: r.id,
      goalId: r.goal_id,
      title: r.title,
      completed: !!r.completed,
      order: r.order,
    }));
    set({ milestones });
  },

  addGoal: async (goal) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const id = generateId();
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO goals (id, user_id, title, description, target_date, status, progress, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', 0, 'pending', datetime('now'))`,
      id, user.id, goal.title, goal.description ?? null, goal.targetDate ?? null
    );
    await markPendingSync('goals', id, 'insert', {
      id, user_id: user.id, title: goal.title, description: goal.description ?? null,
      target_date: goal.targetDate ?? null, status: 'active', progress: 0,
    });
    await get().loadGoals();
  },

  updateGoal: async (id, data) => {
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
      `UPDATE goals SET ${fields.join(', ')}, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?`,
      ...values
    );
    await markPendingSync('goals', id, 'update', { id, ...data });
    await get().loadGoals();
  },

  deleteGoal: async (id) => {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM goal_milestones WHERE goal_id = ?", id);
    await db.runAsync("DELETE FROM goals WHERE id = ?", id);
    await markPendingSync('goals', id, 'delete', { id });
    await get().loadGoals();
  },

  addMilestone: async (milestone) => {
    const id = generateId();
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO goal_milestones (id, goal_id, title, "order", sync_status, updated_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))',
      id, milestone.goalId, milestone.title, milestone.order
    );
    await markPendingSync('goal_milestones', id, 'insert', {
      id, goal_id: milestone.goalId, title: milestone.title, order: milestone.order,
    });
    await get().loadMilestones(milestone.goalId);
    await recalculateProgress(milestone.goalId);
  },

  toggleMilestone: async (id, goalId) => {
    const db = await getDatabase();
    const ms = await db.getFirstAsync<any>('SELECT * FROM goal_milestones WHERE id = ?', id);
    if (!ms) return;
    const completed = ms.completed ? 0 : 1;
    await db.runAsync(
      "UPDATE goal_milestones SET completed = ?, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?",
      completed, id
    );
    await markPendingSync('goal_milestones', id, 'update', { id, completed });
    await get().loadMilestones(goalId);
    await recalculateProgress(goalId);
  },
}));

async function recalculateProgress(goalId: string): Promise<void> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number; done: number }>(
    'SELECT COUNT(*) as total, SUM(CASE WHEN completed THEN 1 ELSE 0 END) as done FROM goal_milestones WHERE goal_id = ?',
    goalId
  );
  if (result && result.total > 0) {
    const progress = Math.round((result.done / result.total) * 100);
    await db.runAsync(
      "UPDATE goals SET progress = ?, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?",
      progress, goalId
    );
  }
}
