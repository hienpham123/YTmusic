"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a dummy client if URL is not configured to prevent crashes
const isValidUrl =
  supabaseUrl &&
  (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"));

let supabase: ReturnType<typeof createClient>;

if (isValidUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} else {
  // Create a dummy client that won't crash but will fail gracefully
  console.warn(
    "⚠️ Supabase URL and Anon Key are not configured. Please add them to .env.local. Using dummy client."
  );
  console.warn("Current URL:", supabaseUrl || "empty");
  console.warn(
    "Current Key:",
    supabaseAnonKey ? "***" + supabaseAnonKey.slice(-4) : "empty"
  );
  // Use a dummy URL to create client (won't work but won't crash)
  supabase = createClient(
    "https://placeholder.supabase.co",
    "placeholder-key",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export { supabase };
