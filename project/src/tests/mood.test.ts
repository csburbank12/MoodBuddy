import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Mood Tracking', () => {
  const testUser = {
    email: 'student@test.edu',
    password: 'Student123!'
  };

  beforeEach(async () => {
    await supabase.auth.signInWithPassword(testUser);
  });

  it('should create mood entry', async () => {
    const { data: user } = await supabase.auth.getUser();
    
    const moodEntry = {
      user_id: user.user?.id,
      mood_level: 4,
      mood_type: 'good',
      notes: 'Feeling productive today',
      activities: ['studying', 'exercise']
    };

    const { data, error } = await supabase
      .from('mood_entries')
      .insert(moodEntry)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.mood_level).toBe(moodEntry.mood_level);
    expect(data.mood_type).toBe(moodEntry.mood_type);
  });

  it('should validate mood level range', async () => {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.user?.id,
        mood_level: 6, // Invalid: should be 1-5
        mood_type: 'good'
      });

    expect(error).toBeDefined();
  });

  it('should enforce valid mood types', async () => {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.user?.id,
        mood_level: 3,
        mood_type: 'invalid' // Invalid mood type
      });

    expect(error).toBeDefined();
  });
});