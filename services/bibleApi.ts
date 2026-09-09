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
  verse: number,
  translation: string = 'kjv'
): Promise<VerseData | null> => {
  try {
    const ref = `${book} ${chapter}:${verse}`;
    const res = await axios.get<VerseData>(
      `${BASE_URL}/${encodeURIComponent(ref)}?translation=${translation}`
    );
    return res.data;
  } catch (e) {
    console.error('getVerse error:', e);
    return null;
  }
};

export const getChapter = async (
  book: string,
  chapter: number,
  translation: string = 'kjv'
): Promise<VerseData | null> => {
  try {
    const ref = `${book} ${chapter}`;
    const res = await axios.get<VerseData>(
      `${BASE_URL}/${encodeURIComponent(ref)}?translation=${translation}`
    );
    return res.data;
  } catch (e) {
    console.error('getChapter error:', e);
    return null;
  }
};

export const getDailyVerse = async (
  translation: string = 'kjv'
): Promise<VerseData | null> => {
  const verses: string[] = [
    'john 3:16', 'psalm 23:1', 'philippians 4:13',
    'jeremiah 29:11', 'proverbs 3:5', 'romans 8:28',
    'matthew 11:28', 'psalm 46:1', 'isaiah 41:10',
    'joshua 1:9', 'psalm 119:105', 'john 14:6',
    'romans 12:2', 'galatians 5:22', 'ephesians 2:8',
    'hebrews 11:1', '1 corinthians 13:4', 'psalm 91:1',
    'isaiah 40:31', 'matthew 6:33', 'john 1:1',
    'psalm 46:10', 'romans 5:8', 'proverbs 31:25',
    '2 timothy 1:7', 'james 1:2', 'psalm 37:4',
    'matthew 5:16', 'colossians 3:23', 'john 15:5',
    'deuteronomy 31:6',
  ];

  // Use full date as seed so it changes every day
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const pick = verses[seed % verses.length];

  try {
    const res = await axios.get<VerseData>(
      `${BASE_URL}/${encodeURIComponent(pick)}?translation=${translation}`
    );
    return res.data;
  } catch (e) {
    return null;
  }
};