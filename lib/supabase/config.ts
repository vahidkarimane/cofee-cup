import {createClient} from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export storage bucket name
export const STORAGE_BUCKET = 'coffee-cup';
