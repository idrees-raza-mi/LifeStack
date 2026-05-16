import { create } from 'zustand';
import { getDatabase } from '../lib/database';
import { Task } from '../types';
import { markPendingSync } from '../lib/sync';
import { useAuthStore } from './authStore';
import { generateId } from '../lib/id';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  filter: 'all' | 'today' | 'upcoming' | 'completed';
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt' | 'archived'>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilter: (filter: TaskState['filter']) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  filter: 'all',

  loadTasks: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ isLoading: true });
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM tasks WHERE user_id = ? AND archived = 0 ORDER BY created_at DESC',
      user.id
    );
    const tasks: Task[] = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      category: r.category,
      dueDate: r.due_date,
      completed: !!r.completed,
      completedAt: r.completed_at,
      createdAt: r.created_at,
      archived: !!r.archived,
    }));
    set({ tasks, isLoading: false });
  },

  addTask: async (task) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const id = generateId();
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO tasks (id, user_id, title, description, priority, category, due_date, sync_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      id, user.id, task.title, task.description ?? null, task.priority, task.category ?? null, task.dueDate ?? null
    );
    await markPendingSync('tasks', id, 'insert', {
      id, user_id: user.id, title: task.title, description: task.description ?? null,
      priority: task.priority, category: task.category ?? null, due_date: task.dueDate ?? null,
    });
    await get().loadTasks();
  },

  toggleTask: async (id) => {
    const db = await getDatabase();
    const task = await db.getFirstAsync<any>('SELECT * FROM tasks WHERE id = ?', id);
    if (!task) return;
    const completed = task.completed ? 0 : 1;
    const completedAt = completed ? new Date().toISOString() : null;
    await db.runAsync(
      "UPDATE tasks SET completed = ?, completed_at = ?, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?",
      completed, completedAt, id
    );
    await markPendingSync('tasks', id, 'update', { id, completed, completed_at: completedAt });
    await get().loadTasks();
  },

  updateTask: async (id, data) => {
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
      `UPDATE tasks SET ${fields.join(', ')}, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?`,
      ...values
    );
    await markPendingSync('tasks', id, 'update', { id, ...data });
    await get().loadTasks();
  },

  deleteTask: async (id) => {
    const db = await getDatabase();
    await db.runAsync("UPDATE tasks SET archived = 1, sync_status = 'pending', updated_at = datetime('now') WHERE id = ?", id);
    await markPendingSync('tasks', id, 'delete', { id, archived: true });
    await get().loadTasks();
  },

  setFilter: (filter) => set({ filter }),
}));
