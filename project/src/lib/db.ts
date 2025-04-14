import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables.');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database service
export const dbService = {
  async createUser(data: {
    email: string;
    full_name: string;
    role: 'student' | 'staff';
    grade_level?: string;
    age_group?: string;
  }): Promise<any> {
    const { data: userData, error } = await supabase.auth.signUp({
      email: data.email,
      password: Math.random().toString(36).slice(-8), // Temporary random password
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
      console.error('Error creating user:', error);
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
      console.error('Error fetching user:', error);
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
      console.error('Error creating mood entry:', error);
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
      throw error;
    }
    return data || [];
  },
};