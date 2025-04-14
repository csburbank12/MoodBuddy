import { createClient } from '@libsql/client';

// Create an in-memory database
export const db = createClient({
  url: 'file:moodbuddy?mode=memory&cache=shared',
});

// Initialize schema
async function initializeSchema() {
  await db.batch([
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT CHECK (role IN ('student', 'staff')) NOT NULL,
      grade_level TEXT,
      age_group TEXT CHECK (age_group IN ('kids', 'teens', 'adults')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Mood entries table
    `CREATE TABLE IF NOT EXISTS mood_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 5),
      mood_type TEXT CHECK (mood_type IN ('great', 'good', 'okay', 'down', 'bad')),
      notes TEXT,
      activities TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date 
     ON mood_entries(user_id, created_at DESC)`
  ]);
}

// Initialize database
initializeSchema().catch(console.error);

// Database service
export const dbService = {
  async createUser(data: {
    id: string;
    email: string;
    full_name: string;
    role: 'student' | 'staff';
    grade_level?: string;
    age_group?: string;
  }) {
    const result = await db.execute({
      sql: `INSERT INTO users (id, email, full_name, role, grade_level, age_group)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [data.id, data.email, data.full_name, data.role, data.grade_level, data.age_group]
    });
    return result;
  },

  async getUser(id: string) {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  async createMoodEntry(data: {
    user_id: string;
    mood_level: number;
    mood_type: string;
    notes?: string;
    activities?: string;
  }) {
    const result = await db.execute({
      sql: `INSERT INTO mood_entries (id, user_id, mood_level, mood_type, notes, activities)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        crypto.randomUUID(),
        data.user_id,
        data.mood_level,
        data.mood_type,
        data.notes,
        data.activities
      ]
    });
    return result;
  },

  async getUserMoodEntries(userId: string) {
    const result = await db.execute({
      sql: `SELECT * FROM mood_entries 
            WHERE user_id = ? 
            ORDER BY created_at DESC`,
      args: [userId]
    });
    return result.rows;
  }
};