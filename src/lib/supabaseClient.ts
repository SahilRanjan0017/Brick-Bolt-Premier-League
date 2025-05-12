// src/lib/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient<Database> | null = null;
let supabaseInitializationError: string | null = null;

// Helper function for error message generation
const generateErrorMessage = (variableName: string): string => {
  return `Environment variable ${variableName} is not configured correctly (empty, missing, or placeholder). Please set this environment variable in your .env.local file.`;
};

// Error logging for development
const logErrorForDev = (message: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Supabase Initialization Warning: ${message}`);
  }
};

// Validate the URL format
const validateSupabaseUrl = (url: string): boolean => {
  try {
    new URL(url); // Throws an error if the URL is invalid
    return true;
  } catch (e) {
    const urlError = e instanceof Error ? e.message : String(e);
    supabaseInitializationError =
      `Invalid format for NEXT_PUBLIC_SUPABASE_URL: "${url}". ` +
      `Supabase functionalities will be disabled. Original error: ${urlError}. Please verify the URL in your .env.local file.`;
    console.error(`Supabase Client Initialization Error: ${supabaseInitializationError}`);
    return false;
  }
};

// Main initialization logic
if (!supabaseUrl || supabaseUrl.trim() === "" || supabaseUrl === "YOUR_SUPABASE_URL") {
  supabaseInitializationError = generateErrorMessage("NEXT_PUBLIC_SUPABASE_URL");
  logErrorForDev(supabaseInitializationError);
} else if (!supabaseAnonKey || supabaseAnonKey.trim() === "" || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
  supabaseInitializationError = generateErrorMessage("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  logErrorForDev(supabaseInitializationError);
} else {
  if (validateSupabaseUrl(supabaseUrl)) {
    try {
      // Create the Supabase client if URL is valid
      supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
      // Optional: for confirming successful initialization in development
      if (process.env.NODE_ENV === 'development') {
        console.log("Supabase client initialized successfully.");
      }
    } catch (error) {
      supabaseInitializationError = `Error initializing Supabase client: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`Supabase Client Initialization Error: ${supabaseInitializationError}`);
    }
  }
}

export const supabase = supabaseInstance;

// Getter function for accessing initialization error
export const getSupabaseInitializationError = (): string | null => supabaseInitializationError;

