import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables.');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const databaseService = {
  async createUser(data: {
    email: string;
    full_name: string;
    role: 'student' | 'staff';
    grade_level?: string;
    age_group?: string;
  }): Promise<any> {    
    const { data: userData, error } = await supabase.auth.signUp({
      email: data.email,
      password: Math.random().toString(36).slice(-10), // Temporary random password
      options: {
        data: {
          full_name: data.full_name,
          role: data.role,
          grade_level: data.grade_level,
          age_group: data.age_group,
        },
      },
    });

    if (error) {
      console.error('Failed to create user:', error);
      throw error;
    }

    return userData.user;
  },

  async getUser(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }

    return data;
  },  

  async createMoodEntry(data: {
    user_id: string;
    mood_level: number;
    mood_type: string;
    notes?: string;
    activities: string[];
  }): Promise<any> {
    const { data: moodEntry, error } = await supabase
      .from('mood_entries')
      .insert([{ ...data }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create mood entry:', error);
      throw error;
    }

    return moodEntry;
  },  

  async getUserMoodEntries(userId: string): Promise<any[]> {
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Error fetching mood entries:', error);
          throw new DatabaseError('Failed to fetch mood entries', error);
        }
        return data || [];
      },
};