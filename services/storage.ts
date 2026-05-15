import * as FileSystem from 'expo-file-system/legacy';

export interface SavedVerse {
  reference: string;
  text: string;
  savedAt: string;
  emotion?: string;
}

const BOOKMARKS_FILE = FileSystem.documentDirectory + 'bookmarks.json';

const readFile = async (): Promise<SavedVerse[]> => {
  try {
    const info = await FileSystem.getInfoAsync(BOOKMARKS_FILE as string);
    if (!info.exists) return [];
    const content = await FileSystem.readAsStringAsync(BOOKMARKS_FILE as string);
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
};

const writeFile = async (data: SavedVerse[]): Promise<void> => {
  try {
    await FileSystem.writeAsStringAsync(
      BOOKMARKS_FILE as string,
      JSON.stringify(data)
    );
  } catch (e) {
    console.error('writeFile error:', e);
  }
};

export const saveBookmark = async (verse: SavedVerse): Promise<void> => {
  try {
    const existing = await readFile();
    const alreadyExists = existing.find(v => v.reference === verse.reference);
    if (alreadyExists) return;
    const updated = [verse, ...existing];
    await writeFile(updated);
  } catch (e) {
    console.error('saveBookmark error:', e);
  }
};

export const removeBookmark = async (reference: string): Promise<void> => {
  try {
    const existing = await readFile();
    const updated = existing.filter(v => v.reference !== reference);
    await writeFile(updated);
  } catch (e) {
    console.error('removeBookmark error:', e);
  }
};

export const getBookmarks = async (): Promise<SavedVerse[]> => {
  return await readFile();
};

export const isBookmarked = async (reference: string): Promise<boolean> => {
  try {
    const existing = await readFile();
    return existing.some(v => v.reference === reference);
  } catch (e) {
    return false;
  }
};