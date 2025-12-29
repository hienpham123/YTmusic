/**
 * Parse duration string (e.g., "4:18" or "1:23:45") to seconds
 */
export function parseDurationToSeconds(duration: string | number): number {
  if (typeof duration === "number") {
    return duration;
  }

  if (!duration || typeof duration !== "string") {
    return 0;
  }

  // If it's already in seconds format (just a number string)
  if (/^\d+$/.test(duration)) {
    return parseInt(duration, 10);
  }

  // Parse format "M:SS" or "H:MM:SS"
  const parts = duration.split(":").map((part) => parseInt(part, 10));

  if (parts.length === 2) {
    // Format: "M:SS"
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // Format: "H:MM:SS"
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

/**
 * Format seconds to duration string (e.g., "4:18" or "1:23:45")
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
