import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NEW_TESTAMENT, OLD_TESTAMENT } from '../../constants/BibleBooks';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';

type Book = {
  name: string;
  testament: 'old' | 'new';
};

const OLD_BOOKS: Book[] = OLD_TESTAMENT.map(name => ({ name, testament: 'old' }));
const NEW_BOOKS: Book[] = NEW_TESTAMENT.map(name => ({ name, testament: 'new' }));
const ALL_BOOKS: Book[] = [...OLD_BOOKS, ...NEW_BOOKS];

export default function BibleScreen() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'old' | 'new'>('all');
  const router = useRouter();

  const getBooks = () => {
    let books = activeTab === 'old' ? OLD_BOOKS : activeTab === 'new' ? NEW_BOOKS : ALL_BOOKS;
    if (search.trim()) {
      books = books.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
    }
    return books;
  };

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: '/reader',
      params: { book: book.name, chapter: '1' },
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search book..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Testament Tabs */}
      <View style={styles.tabRow}>
        {(['all', 'old', 'new'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'all' ? 'All Books' : tab === 'old' ? 'Old Testament' : 'New Testament'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Book Count */}
      <Text style={styles.countText}>{getBooks().length} books</Text>

      {/* Book List */}
      <FlatList
        data={getBooks()}
        keyExtractor={item => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.bookCard,
              { backgroundColor: item.testament === 'old' ? '#EBF5EC' : '#EEF2FF' }
            ]}
            onPress={() => handleBookPress(item)}
          >
            <View style={styles.bookNumber}>
              <Text style={styles.bookNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.bookName}>{item.name}</Text>
            <Text style={styles.bookTestament}>
              {item.testament === 'old' ? 'OT' : 'NT'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 4,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: Colors.textLight, fontWeight: '600' },
  countText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: Spacing.md + 4,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  listContent: { padding: Spacing.md, paddingTop: Spacing.sm },
  row: { justifyContent: 'space-between', marginBottom: 10 },
  bookCard: {
    width: '48.5%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  bookNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bookNumberText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  bookName: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  bookTestament: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
});