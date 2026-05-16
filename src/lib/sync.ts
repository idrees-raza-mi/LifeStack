import { getDatabase } from './database';
import { supabase } from './supabase';

const SYNC_TABLES = [
  'habits', 'habit_logs', 'tasks', 'goals',
  'goal_milestones', 'routines', 'routine_steps',
  'routine_logs', 'health_entries', 'workout_sessions', 'workout_sets',
];

async function pushPendingChanges(userId: string): Promise<void> {
  const db = await getDatabase();
  const queue = await db.getAllAsync<any>(
    'SELECT * FROM sync_queue ORDER BY created_at ASC'
  );

  for (const item of queue) {
    try {
      const { error } = await supabase
        .from(item.table_name)
        .upsert(JSON.parse(item.data), { onConflict: 'id' });

      if (!error) {
        await db.runAsync(
          'DELETE FROM sync_queue WHERE id = ?',
          item.id
        );
        await db.runAsync(
          `UPDATE ${item.table_name} SET sync_status = 'synced', updated_at = datetime('now') WHERE id = ?`,
          item.record_id
        );
      }
    } catch {}
  }
}

async function pullRemoteData(userId: string): Promise<void> {
  const db = await getDatabase();

  for (const table of SYNC_TABLES) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: true });

      if (error || !data) continue;

      for (const record of data) {
        const local = await db.getFirstAsync<any>(
          `SELECT * FROM ${table} WHERE id = ?`,
          record.id
        );

        if (!local || new Date(record.updated_at) > new Date(local.updated_at)) {
          await upsertLocalRecord(db, table, record);
        }
      }
    } catch {}
  }
}

async function upsertLocalRecord(db: any, table: string, record: any): Promise<void> {
  const columns = Object.keys(record).filter(k => k !== 'sync_status' && k !== 'updated_at');
  const values = columns.map(c => record[c]);
  const placeholders = columns.map(() => '?').join(', ');
  const updateCols = columns.map(c => `${c} = ?`).join(', ');

  await db.runAsync(
    `INSERT INTO ${table} (${columns.join(', ')}, sync_status, updated_at)
     VALUES (${placeholders}, 'synced', datetime('now'))
     ON CONFLICT(id) DO UPDATE SET ${updateCols}, sync_status = 'synced', updated_at = datetime('now')`,
    ...values, ...values
  );
}

export async function syncData(userId: string): Promise<void> {
  try {
    await pushPendingChanges(userId);
    await pullRemoteData(userId);
  } catch {}
}

export async function markPendingSync(
  table: string,
  recordId: string,
  operation: 'insert' | 'update' | 'delete',
  data: any
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE ${table} SET sync_status = 'pending', updated_at = datetime('now') WHERE id = ?`,
    recordId
  );
  await db.runAsync(
    'INSERT INTO sync_queue (table_name, record_id, operation, data) VALUES (?, ?, ?, ?)',
    table, recordId, operation, JSON.stringify(data)
  );
}
