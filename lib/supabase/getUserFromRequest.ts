import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function getUserFromRequest(
  request: NextRequest
): Promise<{ id: string } | null> {
  try {
    // First, try to get access token from authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (!error && user) {
        return { id: user.id };
      }
    }

    // Fallback: Try to get from cookies
    // Supabase stores session in localStorage by default, but we can check cookies
    // The cookie name pattern is: sb-<project-ref>-auth-token
    const cookies = request.cookies.getAll();
    for (const cookie of cookies) {
      // Check if this looks like a Supabase auth cookie
      if (cookie.name.includes("auth") || cookie.name.includes("supabase")) {
        try {
          // Try to parse as JSON
          const sessionData = JSON.parse(cookie.value);
          const accessToken =
            sessionData?.access_token || sessionData?.accessToken;
          if (accessToken) {
            const supabase = createClient(supabaseUrl, supabaseAnonKey, {
              global: {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            });
            const {
              data: { user },
              error,
            } = await supabase.auth.getUser(accessToken);
            if (!error && user) {
              return { id: user.id };
            }
          }
        } catch {
          continue;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}
