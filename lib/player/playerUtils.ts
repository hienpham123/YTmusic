import { Track } from "@/types/track";

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Finds the index of a track in a playlist by ID
 */
export function findTrackIndex(playlist: Track[], trackId: string): number {
  return playlist.findIndex((t) => t.id === trackId);
}

/**
 * Checks if a track exists in a playlist
 */
export function trackExistsInPlaylist(
  playlist: Track[],
  track: Track
): boolean {
  return playlist.some((t) => t.youtubeVideoId === track.youtubeVideoId);
}

/**
 * Gets the next track index based on current index and repeat mode
 */
export function getNextTrackIndex(
  currentIndex: number,
  playlistLength: number,
  repeatMode: "off" | "one" | "all"
): number | null {
  if (repeatMode === "one") {
    return currentIndex; // Repeat current track
  }

  if (currentIndex < playlistLength - 1) {
    return currentIndex + 1;
  }

  if (repeatMode === "all") {
    return 0; // Loop back to start
  }

  return null; // No next track
}

/**
 * Gets the previous track index based on current index and repeat mode
 */
export function getPreviousTrackIndex(
  currentIndex: number,
  playlistLength: number,
  repeatMode: "off" | "one" | "all"
): number | null {
  if (repeatMode === "one") {
    return currentIndex; // Repeat current track
  }

  if (currentIndex > 0) {
    return currentIndex - 1;
  }

  if (repeatMode === "all") {
    return playlistLength - 1; // Loop to end
  }

  return null; // No previous track
}
