type EnvVar = 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY';

/**
 * Type-safe environment variable accessor
 * @param key Environment variable key
 * @returns Environment variable value
 */
export function getEnvVar(key: EnvVar): string {
  const value = import.meta.env[key];
  
  return value || '';
}