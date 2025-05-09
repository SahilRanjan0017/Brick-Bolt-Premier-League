// src/lib/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient<Database> | null = null;
let supabaseInitializationError: string | null = null;

if (!supabaseUrl || supabaseUrl.trim() === "" || supabaseUrl === "YOUR_SUPABASE_URL") {
  supabaseInitializationError =
    "NEXT_PUBLIC_SUPABASE_URL is not configured correctly (empty, missing, or placeholder 'YOUR_SUPABASE_URL'). " +
    "Supabase functionalities will be disabled. Please set this environment variable in your .env.local file.";
  console.warn(`Supabase Client Initialization Warning: ${supabaseInitializationError}`);
} else if (!supabaseAnonKey || supabaseAnonKey.trim() === "" || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
  supabaseInitializationError =
    "NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured correctly (empty, missing, or placeholder 'YOUR_SUPABASE_ANON_KEY'). " +
    "Supabase functionalities will be disabled. Please set this environment variable in your .env.local file.";
  console.warn(`Supabase Client Initialization Warning: ${supabaseInitializationError}`);
} else {
  try {
    // Validate URL structure before creating client
    new URL(supabaseUrl); // This will throw if the URL format is invalid
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
    // console.log("Supabase client initialized successfully."); // Optional: for confirming initialization
  } catch (e) {
    const urlError = e instanceof Error ? e.message : String(e);
    supabaseInitializationError =
      `Invalid format for NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}". ` +
      `Supabase functionalities will be disabled. Original error: ${urlError}. Please verify the URL in your .env.local file.`;
    console.error(`Supabase Client Initialization Error: ${supabaseInitializationError}`);
    // supabaseInstance remains null
  }
}

export const supabase = supabaseInstance;
export const getSupabaseInitializationError = (): string | null => supabaseInitializationError;
