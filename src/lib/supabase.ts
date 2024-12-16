import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { supabaseConfig } from './config';
import { setupFetchInterceptor } from './utils/fetch';

// Initialize Supabase client
export const supabase = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'loopify-web'
    }
  },
  db: {
    schema: 'public'
  }
});

// Setup fetch interceptor for better error handling
setupFetchInterceptor();