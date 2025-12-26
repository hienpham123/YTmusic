import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Use service role key for server-side operations (bypasses RLS)
// Use anon key for client-side operations
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

// Check if URL is valid
const isValidUrl = supabaseUrl && (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"));

let supabase: ReturnType<typeof createClient>;

if (isValidUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn(
    "Supabase URL and Key are not configured. Please add them to .env.local. Using dummy client."
  );
  // Create dummy client to prevent crashes
  supabase = createClient(
    "https://placeholder.supabase.co",
    "placeholder-key"
  );
}

export { supabase };

