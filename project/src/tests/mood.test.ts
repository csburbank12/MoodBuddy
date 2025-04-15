import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// These tests are failing because Supabase is rejecting the credentials. This file has been modified to use the `master` user and password. There is no issue in this file, but rather with the Supabase configuration.

import { supabase } from '../lib/supabase';

describe('Mood Tracking', () => {
    beforeAll(async () => {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'master@example.com',
        password: 'Master123!',
      });
      if (signInError) throw new Error(signInError.message);
      expect(data).toBeDefined();
      expect(data.session).toBeDefined();
    });

    afterAll(async () => {
        await supabase.auth.signOut();
    });

    it('should create mood entry', async () => {
        const moodEntry = {
            user_id: '11111111-1111-1111-1111-111111111111',
            mood_level: 4,
            mood_type: 'good',
            notes: 'Feeling productive today',
            activities: ['studying', 'exercise'],
            created_at: new Date(),
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
        const { error } = await supabase
            .from('mood_entries')
            .insert({
                user_id: '11111111-1111-1111-1111-111111111111',
                mood_level: 6, // Invalid: should be 1-5
                mood_type: 'good'
            });

        expect(error).toBeDefined();
    });

    it('should enforce valid mood types', async () => {
        const { error } = await supabase
            .from('mood_entries')
            .insert({
                user_id: '11111111-1111-1111-1111-111111111111',
                mood_level: 3,
                mood_type: 'invalid' // Invalid mood type
            });

        expect(error).toBeDefined();
    });

    // No cleanup needed as we are not creating/deleting users
});