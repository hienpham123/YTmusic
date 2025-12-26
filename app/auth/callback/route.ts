import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("❌ OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (code) {
    try {
      console.log("🔄 Exchanging OAuth code for session...");
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("❌ Error exchanging code for session:", exchangeError);
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        );
      }

      if (data.session) {
        console.log("✅ OAuth login successful:", data.user?.email);
        // Redirect to home - Supabase client will handle session storage
        return NextResponse.redirect(new URL("/", requestUrl.origin));
      }
    } catch (err) {
      console.error("❌ Error in OAuth callback:", err);
      return NextResponse.redirect(
        new URL("/?error=oauth_failed", requestUrl.origin)
      );
    }
  }

  // No code provided, redirect to home
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}

