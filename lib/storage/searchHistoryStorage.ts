const STORAGE_KEY = "youtube_search_history";
const MAX_ITEMS = 10;

export const searchHistoryStorage = {
  getAll: (): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading search history:", error);
      return [];
    }
  },

  save: (history: string[]): void => {
    try {
      const limited = history.slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  },

  add: (query: string): void => {
    if (!query.trim()) return;
    const history = searchHistoryStorage.getAll();
    const newHistory = [
      query.trim(),
      ...history.filter((q) => q !== query.trim()),
    ].slice(0, MAX_ITEMS);
    searchHistoryStorage.save(newHistory);
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
