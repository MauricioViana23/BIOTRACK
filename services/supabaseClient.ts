import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production app, these would be strictly process.env.
// For this demo, we handle the case where they might be missing to prevent immediate crash,
// falling back to a local-storage based mock service if needed.

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const isSupabaseConfigured = !!supabase;
