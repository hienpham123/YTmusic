import { Mood } from "@/types/track";

/**
 * Rule-based mood detection from title
 */
export function detectMood(title: string): Mood {
  const lowerTitle = title.toLowerCase();

  // Chill patterns
  const chillPatterns = ["lofi", "chill", "relax", "peaceful", "calm", "ambient"];
  if (chillPatterns.some((pattern) => lowerTitle.includes(pattern))) {
    return "Chill";
  }

  // Sad patterns
  const sadPatterns = ["sad", "buồn", "cry", "depressing", "melancholy", "heartbreak"];
  if (sadPatterns.some((pattern) => lowerTitle.includes(pattern))) {
    return "Sad";
  }

  // Night patterns
  const nightPatterns = ["night", "midnight", "đêm", "nocturnal", "late night"];
  if (nightPatterns.some((pattern) => lowerTitle.includes(pattern))) {
    return "Night";
  }

  // Focus patterns
  const focusPatterns = ["focus", "study", "code", "work", "concentrate", "productivity"];
  if (focusPatterns.some((pattern) => lowerTitle.includes(pattern))) {
    return "Focus";
  }

  return "Unknown";
}

