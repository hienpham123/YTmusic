import { NextRequest, NextResponse } from "next/server";

/**
 * YouTube Autocomplete Suggestions API
 * Uses Google's autocomplete service (same as YouTube uses)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ suggestions: [] });
    }

    // YouTube uses Google's autocomplete service
    // This is the same endpoint YouTube uses internally
    const suggestUrl = new URL(
      "https://suggestqueries.google.com/complete/search"
    );
    suggestUrl.searchParams.set("client", "youtube");
    suggestUrl.searchParams.set("ds", "yt");
    suggestUrl.searchParams.set("q", query.trim());

    const response = await fetch(suggestUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.error("YouTube suggestions API error:", response.status);
      return NextResponse.json({ suggestions: [] });
    }

    // The response is in JSONP format: callback([query, [suggestions], ...])
    const text = await response.text();

    // Parse JSONP response
    // Format: window.google.ac.h(["query", ["suggestion1", "suggestion2", ...], ...])
    try {
      // Remove JSONP wrapper - find the array part
      // The response format is: window.google.ac.h(["query", ["suggestion1", ...], ...])
      // We need to extract the array part
      const arrayStart = text.indexOf("[");
      const arrayEnd = text.lastIndexOf("]");

      if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        const jsonArray = text.substring(arrayStart, arrayEnd + 1);
        const data = JSON.parse(jsonArray);

        // Data structure: [query, [suggestions], ...]
        // Suggestions are in the second element, which is an array of arrays
        // Each suggestion is [text, ...]
        if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
          const suggestionsArray = data[1] as unknown[];
          const suggestions: string[] = [];

          for (const item of suggestionsArray) {
            if (
              Array.isArray(item) &&
              item.length > 0 &&
              typeof item[0] === "string"
            ) {
              suggestions.push(item[0]);
            } else if (typeof item === "string") {
              suggestions.push(item);
            }
          }

          return NextResponse.json({ suggestions });
        }
      }
    } catch (parseError) {
      console.error("Error parsing suggestions response:", parseError);
    }

    return NextResponse.json({ suggestions: [] });
  } catch (error) {
    console.error("Error in YouTube suggestions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
