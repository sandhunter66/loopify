import { getEnvVar } from './utils/env';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Initialize Supabase configuration
export const supabaseConfig: SupabaseConfig = {
  url: getEnvVar('VITE_SUPABASE_URL'),
  anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY')
};