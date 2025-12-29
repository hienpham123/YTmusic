const VOLUME_STORAGE_KEY = "ytmusic_volume";
const MUTED_STORAGE_KEY = "ytmusic_muted";
const PREVIOUS_VOLUME_STORAGE_KEY = "ytmusic_previous_volume";

export const volumeStorage = {
  getVolume: (): number => {
    if (typeof window === "undefined") return 100;
    try {
      const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
      if (stored) {
        const volume = parseInt(stored, 10);
        // Validate volume is between 0 and 100
        if (!isNaN(volume) && volume >= 0 && volume <= 100) {
          return volume;
        }
      }
    } catch {
      // Ignore errors
    }
    return 100; // Default volume
  },

  setVolume: (volume: number): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
    } catch {
      // Ignore errors
    }
  },

  getMuted: (): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(MUTED_STORAGE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  },

  setMuted: (muted: boolean): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(MUTED_STORAGE_KEY, muted.toString());
    } catch {
      // Ignore errors
    }
  },

  getPreviousVolume: (): number => {
    if (typeof window === "undefined") return 100;
    try {
      const stored = localStorage.getItem(PREVIOUS_VOLUME_STORAGE_KEY);
      if (stored) {
        const volume = parseInt(stored, 10);
        if (!isNaN(volume) && volume >= 0 && volume <= 100) {
          return volume;
        }
      }
    } catch {
      // Ignore errors
    }
    return 100; // Default previous volume
  },

  setPreviousVolume: (volume: number): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PREVIOUS_VOLUME_STORAGE_KEY, volume.toString());
    } catch {
      // Ignore errors
    }
  },
};
