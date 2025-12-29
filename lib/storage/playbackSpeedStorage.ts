const STORAGE_KEY = "ytmusic_playback_speed";

export const playbackSpeedStorage = {
  getSpeed: (): number => {
    if (typeof window === "undefined") return 1;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const speed = parseFloat(stored);
        // Validate speed value
        if ([0.5, 0.75, 1, 1.25, 1.5, 2].includes(speed)) {
          return speed;
        }
      }
    } catch {
      // Ignore errors
    }
    return 1; // Default to 1x
  },

  setSpeed: (speed: number): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, speed.toString());
    } catch {
      // Ignore errors
    }
  },
};
