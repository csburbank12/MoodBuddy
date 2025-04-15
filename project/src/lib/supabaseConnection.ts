// src/lib/supabaseConnection.ts
import { supabase } from './supabase';

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Supabase connection test failed:', error.message);
    } else {
      console.log('Supabase connection test successful. User data:', data);
    }
  } catch (error) {
    console.error('An unexpected error occurred during the Supabase connection test:', error);
  }
}

testSupabaseConnection();