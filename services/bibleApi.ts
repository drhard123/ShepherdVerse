import axios from 'axios';

const BASE_URL = 'https://bible-api.com';

export interface VerseData {
  reference: string;
  text: string;
  translation_id: string;
  translation_name: string;
  verses: Array<{
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
}

export const getVerse = async (
  book: string,
  chapter: number,
  verse: number
): Promise<VerseData | null> => {
  try {
    const ref = `${book} ${chapter}:${verse}`;
    const res = await axios.get<VerseData>(
      `${BASE_URL}/${encodeURIComponent(ref)}`
    );
    return res.data;
  } catch (e) {
    console.error('getVerse error:', e);
    return null;
  }
};

export const getChapter = async (
  book: string,
  chapter: number
): Promise<VerseData | null> => {
  try {
    const ref = `${book} ${chapter}`;
    const res = await axios.get<VerseData>(
      `${BASE_URL}/${encodeURIComponent(ref)}`
    );
    return res.data;
  } catch (e) {
    console.error('getChapter error:', e);
    return null;
  }
};

export const getDailyVerse = async (): Promise<VerseData | null> => {
  const verses: string[] = [
    'john 3:16',
    'psalm 23:1',
    'philippians 4:13',
    'jeremiah 29:11',
    'proverbs 3:5',
    'romans 8:28',
    'matthew 11:28',
    'psalm 46:1',
    'isaiah 41:10',
    'joshua 1:9',
  ];
  const today = new Date().getDate();
  const pick = verses[today % verses.length];
  try {
    const res = await axios.get<VerseData>(
      `${BASE_URL}/${encodeURIComponent(pick)}`
    );
    return res.data;
  } catch (e) {
    return null;
  }
};