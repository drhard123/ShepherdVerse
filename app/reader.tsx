import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { BorderRadius, Colors, Spacing } from '../constants/theme';
import { getChapter, VerseData } from '../services/bibleApi';
import { isBookmarked, removeBookmark, saveBookmark } from '../services/storage';

type Verse = {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

export default function ReaderScreen() {
  const { book, chapter } = useLocalSearchParams<{ book: string; chapter: string }>();
  const router = useRouter();

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(parseInt(chapter || '1'));
  const [bookmarkedVerses, setBookmarkedVerses] = useState<number[]>([]);

  useEffect(() => {
    loadChapter();
  }, [currentChapter]);

  const loadChapter = async () => {
    setLoading(true);
    setVerses([]);
    const data: VerseData | null = await getChapter(book || 'John', currentChapter);
    if (data && data.verses) {
      setVerses(data.verses);
      await checkBookmarks(data.verses);
    }
    setLoading(false);
  };

  const checkBookmarks = async (verseList: Verse[]) => {
    const bookmarkedNums: number[] = [];
    for (const v of verseList) {
      const ref = `${book} ${currentChapter}:${v.verse}`;
      const saved = await isBookmarked(ref);
      if (saved) bookmarkedNums.push(v.verse);
    }
    setBookmarkedVerses(bookmarkedNums);
  };

  const toggleBookmark = async (verse: Verse) => {
    const ref = `${book} ${currentChapter}:${verse.verse}`;
    const already = bookmarkedVerses.includes(verse.verse);
    if (already) {
      await removeBookmark(ref);
      setBookmarkedVerses(prev => prev.filter(v => v !== verse.verse));
      Toast.show({
        type: 'info',
        text1: 'Bookmark removed',
        text2: ref,
        visibilityTime: 2000,
        position: 'bottom',
      });
    } else {
      await saveBookmark({
        reference: ref,
        text: verse.text,
        savedAt: new Date().toISOString(),
      });
      setBookmarkedVerses(prev => [...prev, verse.verse]);
      Toast.show({
        type: 'success',
        text1: '🔖 Verse saved!',
        text2: ref,
        visibilityTime: 2000,
        position: 'bottom',
      });
    }
  };

  const shareVerse = async (verse: Verse) => {
    const ref = `${book} ${currentChapter}:${verse.verse}`;
    try {
      await Share.share({
        message: `"${verse.text.trim()}"\n\n— ${ref}\n\nShared via ShepherdVerse`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const goToPrev = () => {
    if (currentChapter > 1) setCurrentChapter(c => c - 1);
  };

  const goToNext = () => {
    setCurrentChapter(c => c + 1);
  };

  const renderVerse = ({ item }: { item: Verse }) => {
    const isBookmarkedVerse = bookmarkedVerses.includes(item.verse);

    return (
      <View style={[styles.verseRow, isBookmarkedVerse && styles.verseBookmarked]}>
        <Text style={styles.verseNumber}>{item.verse}</Text>
        <View style={styles.verseContent}>
          <Text style={styles.verseText}>{item.text.trim()}</Text>
          <View style={styles.verseActions}>
            <TouchableOpacity
              style={[styles.actionBtn, isBookmarkedVerse && styles.actionBtnActive]}
              onPress={() => toggleBookmark(item)}
            >
              <Ionicons
                name={isBookmarkedVerse ? 'bookmark' : 'bookmark-outline'}
                size={16}
                color={isBookmarkedVerse ? Colors.secondary : Colors.textSecondary}
              />
              <Text style={[
                styles.actionText,
                isBookmarkedVerse && { color: Colors.secondary }
              ]}>
                {isBookmarkedVerse ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => shareVerse(item)}
            >
              <Ionicons name="share-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push({
                pathname: '/sharecard',
                params: {
                  verseText: item.text.trim(),
                  verseRef: `${book} ${currentChapter}:${item.verse}`,
                }
              })}
            >
              <Ionicons name="image-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.actionText}>Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textLight} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{book}</Text>
          <Text style={styles.headerSubtitle}>Chapter {currentChapter}</Text>
        </View>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push('/bookmarks')}
        >
          <Ionicons name="bookmark-outline" size={22} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading {book} {currentChapter}...</Text>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={item => `${item.verse}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.chapterHeading}>Chapter {currentChapter}</Text>
          }
          renderItem={renderVerse}
        />
      )}

      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navBtn, currentChapter <= 1 && styles.navBtnDisabled]}
          onPress={goToPrev}
          disabled={currentChapter <= 1}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentChapter <= 1 ? Colors.border : Colors.primary}
          />
          <Text style={[styles.navText, currentChapter <= 1 && styles.navTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.chapterBadge}>
          <Text style={styles.chapterBadgeText}>Ch. {currentChapter}</Text>
        </View>

        <TouchableOpacity style={styles.navBtn} onPress={goToNext}>
          <Text style={styles.navText}>Next</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: Spacing.md,
  },
  backBtn: { padding: 6, width: 34 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textLight },
  headerSubtitle: { fontSize: 12, color: '#A8D5AA', marginTop: 2 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 15 },
  listContent: { padding: Spacing.md },
  chapterHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    marginTop: 4,
  },
  verseRow: {
    flexDirection: 'row',
    marginBottom: 14,
    borderRadius: BorderRadius.md,
    padding: 8,
  },
  verseBookmarked: {
    backgroundColor: Colors.verseHighlight,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    width: 28,
    marginTop: 3,
  },
  verseContent: { flex: 1 },
  verseText: { fontSize: 16, lineHeight: 26, color: Colors.text },
  verseActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 10,
  },
  actionBtnActive: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.verseHighlight,
  },
  actionText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  navBtnDisabled: { opacity: 0.4 },
  navText: { fontSize: 14, fontWeight: '500', color: Colors.primary },
  navTextDisabled: { color: Colors.border },
  chapterBadge: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  chapterBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
});