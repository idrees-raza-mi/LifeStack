import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getDatabase } from '../lib/database';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAnonymous: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const db = await getDatabase();
        const localUser = await db.getFirstAsync<any>(
          'SELECT * FROM users WHERE id = ?', session.user.id
        );
        if (localUser) {
          set({
            user: { id: localUser.id, email: localUser.email, displayName: localUser.display_name, createdAt: localUser.created_at },
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
        const email = session.user.email ?? null;
        const displayName = (session.user.user_metadata?.display_name as string) ?? null;
        const newUser: User = {
          id: session.user.id,
          email,
          displayName,
          createdAt: new Date().toISOString(),
        };
        await db.runAsync(
          'INSERT OR REPLACE INTO users (id, email, display_name, created_at) VALUES (?, ?, ?, ?)',
          newUser.id, newUser.email, newUser.displayName, newUser.createdAt
        );
        set({ user: newUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  loginWithEmail: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      const userEmail = data.user.email ?? null;
      const userDisplayName = (data.user.user_metadata?.display_name as string) ?? null;
      const user: User = { id: data.user.id, email: userEmail, displayName: userDisplayName, createdAt: new Date().toISOString() };
      const db = await getDatabase();
      await db.runAsync('INSERT OR REPLACE INTO users (id, email, display_name, created_at) VALUES (?, ?, ?, ?)', user.id, user.email, user.displayName, user.createdAt);
      set({ user, isAuthenticated: true });
    }
  },

  registerWithEmail: async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
    if (error) throw error;
    if (data.user) {
      const userEmail = data.user.email ?? null;
      const user: User = { id: data.user.id, email: userEmail, displayName, createdAt: new Date().toISOString() };
      const db = await getDatabase();
      await db.runAsync('INSERT OR REPLACE INTO users (id, email, display_name, created_at) VALUES (?, ?, ?, ?)', user.id, user.email, user.displayName, user.createdAt);
      set({ user, isAuthenticated: true });
    }
  },

  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
    if (data?.url) {
      set({ isLoading: false });
    }
  },

  loginAnonymous: async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    if (data.user) {
      const user: User = { id: data.user.id, email: null, displayName: 'Guest', createdAt: new Date().toISOString() };
      const db = await getDatabase();
      await db.runAsync('INSERT OR REPLACE INTO users (id, email, display_name, created_at) VALUES (?, ?, ?, ?)', user.id, user.email, user.displayName, user.createdAt);
      set({ user, isAuthenticated: true });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
