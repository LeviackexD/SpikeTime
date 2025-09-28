
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a singleton instance of the Supabase client.
// This prevents the client from being created multiple times.
let supabaseInstance: any;

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Provide a mock client if the environment variables are not set.
  // This allows the application to build without crashing.
  console.warn("Supabase environment variables not set. Using a mock client for build process.");
  supabaseInstance = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
    }),
    auth: {
      getSession: () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => ({ data: null, error: new Error('Mock client') }),
      signUp: () => ({ data: null, error: new Error('Mock client') }),
      signOut: () => Promise.resolve({ error: null }),
    },
    channel: () => ({
        on: () => ({
            subscribe: () => ({
                unsubscribe: () => {}
            })
        })
    }),
    removeChannel: () => {}
  };
}

export const supabase = supabaseInstance;
export const adminSupabase = null;
