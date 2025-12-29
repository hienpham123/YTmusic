const AUTO_QUEUE_KEY = "ytmusic_auto_queue";

export const autoQueueStorage = {
  getAutoQueue: (): boolean => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(AUTO_QUEUE_KEY);
    return stored === "true";
  },

  setAutoQueue: (enabled: boolean): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUTO_QUEUE_KEY, enabled.toString());
  },
};
