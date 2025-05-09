// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase'; // Assuming you'll generate types for your DB

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// If you have generated types for your database, you can pass them here
// e.g., createClient<Database>(supabaseUrl, supabaseAnonKey)
// For now, we'll use the generic client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
