import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BorderRadius, Colors, Spacing } from '../constants/theme';
import { getBookmarks, removeBookmark, SavedVerse } from '../services/storage';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<SavedVerse[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [])
  );

  const loadBookmarks = async () => {
    const data = await getBookmarks();
    setBookmarks(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  };

  const handleDelete = (reference: string) => {
    Alert.alert(
      'Remove Bookmark',
      'Remove this verse from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeBookmark(reference);
            await loadBookmarks();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: SavedVerse }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Ionicons name="bookmark" size={16} color={Colors.secondary} />
        <Text style={styles.reference}>{item.reference}</Text>
        {item.emotion && (
          <View style={styles.emotionBadge}>
            <Text style={styles.emotionText}>{item.emotion}</Text>
          </View>
        )}
      </View>
      <Text style={styles.verseText}>"{item.text.trim()}"</Text>
      <View style={styles.cardBottom}>
        <Text style={styles.savedDate}>
          {new Date(item.savedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </Text>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.reference)}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.notification} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Saved Verses</Text>
        <Text style={styles.bannerSub}>
          {bookmarks.length} {bookmarks.length === 1 ? 'verse' : 'verses'} saved
        </Text>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No saved verses yet</Text>
          <Text style={styles.emptySub}>
            Tap the bookmark icon on any verse in the Bible reader or Emotions tab to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={item => item.reference + item.savedAt}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  banner: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    paddingTop: 20,
    alignItems: 'center',
  },
  bannerTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textLight },
  bannerSub: { fontSize: 13, color: '#A8D5AA', marginTop: 4 },
  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  emptyTitle: {
    fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16,
  },
  emptySub: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
    marginTop: 8, lineHeight: 22,
  },
  listContent: { padding: Spacing.md },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: 12,
    borderWidth: 0.5, borderColor: Colors.border,
    borderLeftWidth: 3, borderLeftColor: Colors.secondary,
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10,
  },
  reference: { fontSize: 14, fontWeight: '700', color: Colors.primary, flex: 1 },
  emotionBadge: {
    backgroundColor: Colors.primary + '18', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: BorderRadius.full,
  },
  emotionText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  verseText: {
    fontSize: 15, lineHeight: 24, color: Colors.text, fontStyle: 'italic',
  },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 10,
  },
  savedDate: { fontSize: 12, color: Colors.textSecondary },
  deleteBtn: { padding: 4 },
});