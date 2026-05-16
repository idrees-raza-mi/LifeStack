import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('lifestack.db');
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      display_name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT NOT NULL DEFAULT 'star',
      color TEXT NOT NULL DEFAULT '#2563EB',
      frequency TEXT NOT NULL DEFAULT 'daily',
      custom_days TEXT,
      reminder_enabled INTEGER NOT NULL DEFAULT 0,
      reminder_time TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      archived INTEGER NOT NULL DEFAULT 0,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (habit_id) REFERENCES habits(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT,
      due_date TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      archived INTEGER NOT NULL DEFAULT 0,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_date TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      progress REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS goal_milestones (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      "order" INTEGER NOT NULL DEFAULT 0,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (goal_id) REFERENCES goals(id)
    );

    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT NOT NULL DEFAULT 'star',
      color TEXT NOT NULL DEFAULT '#2563EB',
      days_of_week TEXT NOT NULL DEFAULT '[]',
      time_of_day TEXT,
      estimated_minutes INTEGER NOT NULL DEFAULT 30,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      archived INTEGER NOT NULL DEFAULT 0,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS routine_steps (
      id TEXT PRIMARY KEY,
      routine_id TEXT NOT NULL,
      title TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 5,
      "order" INTEGER NOT NULL DEFAULT 0,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (routine_id) REFERENCES routines(id)
    );

    CREATE TABLE IF NOT EXISTS routine_logs (
      id TEXT PRIMARY KEY,
      routine_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      started_at TEXT,
      completed_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (routine_id) REFERENCES routines(id)
    );

    CREATE TABLE IF NOT EXISTS health_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      steps INTEGER,
      water_ml INTEGER,
      calories INTEGER,
      sleep_hours REAL,
      weight_kg REAL,
      notes TEXT,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_sets (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      reps INTEGER NOT NULL DEFAULT 0,
      weight_kg REAL NOT NULL DEFAULT 0,
      done INTEGER NOT NULL DEFAULT 0,
      sync_status TEXT NOT NULL DEFAULT 'synced',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES workout_sessions(id)
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'fitness'
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(habit_id, date);
    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id, completed);
    CREATE INDEX IF NOT EXISTS idx_health_date ON health_entries(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_workout_date ON workout_sessions(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_queue(created_at);
  `);
}

export async function clearDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
