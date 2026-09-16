import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mlzcsnxidlrjluwqiwyr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Returns true if a valid anon key is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseAnonKey && supabaseAnonKey !== '<your-anon-key>' && supabaseAnonKey.length > 20);
};

export const supabase = createClient(
  supabaseUrl,
  isSupabaseConfigured() ? supabaseAnonKey : 'dummy-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
