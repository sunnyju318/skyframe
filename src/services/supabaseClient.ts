// ============================================================================
// Supabase Client Configuration
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use custom storage for auth state (we'll use Bluesky auth instead)
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
