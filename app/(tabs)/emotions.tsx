import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';

type Emotion = {
  emoji: string;
  label: string;
  color: string;
  verses: string[];
};

const EMOTIONS: Emotion[] = [
  {
    emoji: '😰', label: 'Anxiety', color: '#7B68EE',
    verses: ['matthew 6:34', 'philippians 4:6', 'psalm 94:19', '1 peter 5:7', 'john 14:27'],
  },
  {
    emoji: '😢', label: 'Sadness', color: '#4682B4',
    verses: ['psalm 34:18', 'matthew 5:4', 'revelation 21:4', 'psalm 30:5', 'isaiah 53:3'],
  },
  {
    emoji: '😨', label: 'Fear', color: '#9370DB',
    verses: ['isaiah 41:10', 'psalm 23:4', '2 timothy 1:7', 'psalm 56:3', 'deuteronomy 31:6'],
  },
  {
    emoji: '😠', label: 'Anger', color: '#CD5C5C',
    verses: ['ephesians 4:26', 'proverbs 15:1', 'james 1:19', 'psalm 37:8', 'proverbs 29:11'],
  },
  {
    emoji: '😔', label: 'Disappointment', color: '#708090',
    verses: ['romans 8:28', 'jeremiah 29:11', 'psalm 43:5', 'isaiah 40:31', 'lamentations 3:22'],
  },
  {
    emoji: '🥺', label: 'Loneliness', color: '#5F9EA0',
    verses: ['deuteronomy 31:8', 'psalm 68:6', 'matthew 28:20', 'hebrews 13:5', 'isaiah 43:2'],
  },
  {
    emoji: '💔', label: 'Hurt', color: '#E88080',
    verses: ['psalm 147:3', 'psalm 34:18', 'isaiah 61:1', 'matthew 11:28', 'revelation 21:4'],
  },
  {
    emoji: '😞', label: 'Rejection', color: '#BC8F8F',
    verses: ['psalm 27:10', 'john 15:16', 'isaiah 53:3', '1 peter 2:4', 'ephesians 1:6'],
  },
  {
    emoji: '😶', label: 'Emptiness', color: '#A9A9A9',
    verses: ['john 6:35', 'psalm 107:9', 'isaiah 55:2', 'john 10:10', 'psalm 63:1'],
  },
  {
    emoji: '😩', label: 'Exhaustion', color: '#D2691E',
    verses: ['matthew 11:28', 'isaiah 40:31', 'psalm 23:2', 'galatians 6:9', 'mark 6:31'],
  },
  {
    emoji: '😊', label: 'Happy', color: '#FFB347',
    verses: ['psalm 118:24', 'philippians 4:4', 'nehemiah 8:10', 'psalm 16:11', 'john 15:11'],
  },
  {
    emoji: '🙏', label: 'Grateful', color: '#3CB371',
    verses: ['1 thessalonians 5:18', 'psalm 107:1', 'colossians 3:17', 'psalm 100:4', 'ephesians 5:20'],
  },
  {
    emoji: '✨', label: 'Hope', color: '#DAA520',
    verses: ['jeremiah 29:11', 'romans 15:13', 'psalm 62:5', 'isaiah 40:31', 'hebrews 11:1'],
  },
  {
    emoji: '💪', label: 'Strength', color: '#2E8B57',
    verses: ['philippians 4:13', 'isaiah 40:29', 'psalm 46:1', 'ephesians 6:10', '2 corinthians 12:9'],
  },
  {
    emoji: '😌', label: 'Peace', color: '#48D1CC',
    verses: ['john 14:27', 'philippians 4:7', 'psalm 29:11', 'isaiah 26:3', 'numbers 6:26'],
  },
  {
    emoji: '🌑', label: 'Lost', color: '#696969',
    verses: ['luke 15:4', 'psalm 119:105', 'proverbs 3:6', 'john 10:14', 'isaiah 42:16'],
  },
  {
    emoji: '🤔', label: 'Doubt', color: '#9932CC',
    verses: ['mark 9:24', 'hebrews 11:1', 'james 1:6', 'matthew 14:31', 'john 20:27'],
  },
  {
    emoji: '🕊️', label: 'Worship', color: '#1E90FF',
    verses: ['psalm 100:1', 'john 4:24', 'psalm 150:6', 'romans 12:1', 'psalm 95:6'],
  },
];

type VerseResult = {
  reference: string;
  text: string;
};

export default function EmotionsScreen() {
  const [selected, setSelected] = useState<Emotion | null>(null);
  const [results, setResults] = useState<VerseResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleEmotionPress = async (emotion: Emotion) => {
    setSelected(emotion);
    setLoading(true);
    setResults([]);

    const fetched: VerseResult[] = [];
    for (const ref of emotion.verses) {
      try {
        const res = await axios.get(`https://bible-api.com/${encodeURIComponent(ref)}`);
        if (res.data) {
          fetched.push({ reference: res.data.reference, text: res.data.text });
        }
      } catch (e) {
        console.error(e);
      }
    }
    setResults(fetched);
    setLoading(false);
  };

  const handleBack = () => {
    setSelected(null);
    setResults([]);
  };

  if (selected) {
    return (
      <View style={styles.container}>
        {/* Results Header */}
        <View style={[styles.resultHeader, { backgroundColor: selected.color }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.resultHeaderCenter}>
            <Text style={styles.resultEmoji}>{selected.emoji}</Text>
            <Text style={styles.resultTitle}>Feeling {selected.label}</Text>
            <Text style={styles.resultSubtitle}>God's word for you</Text>
          </View>
          <View style={{ width: 34 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={selected.color} />
            <Text style={styles.loadingText}>Finding verses for you...</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.verseCard, { borderLeftColor: selected.color }]}>
                <Text style={styles.verseText}>"{item.text.trim()}"</Text>
                <Text style={[styles.verseRef, { color: selected.color }]}>
                  {item.reference}
                </Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="bookmark-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.actionText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="image-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.actionText}>Create Card</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="share-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.actionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <Text style={styles.bannerTitle}>How are you feeling?</Text>
        <Text style={styles.bannerSubtitle}>
          Let God's word speak to your heart right now
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.emotionGrid}
        showsVerticalScrollIndicator={false}
      >
        {EMOTIONS.map((emotion) => (
          <TouchableOpacity
            key={emotion.label}
            style={[styles.emotionCard, { borderColor: emotion.color + '60' }]}
            onPress={() => handleEmotionPress(emotion)}
          >
            <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
            <Text style={styles.emotionLabel}>{emotion.label}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBanner: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    paddingTop: 20,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#A8D5AA',
    marginTop: 4,
    textAlign: 'center',
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: 10,
    justifyContent: 'space-between',
  },
  emotionCard: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  emotionEmoji: { fontSize: 28, marginBottom: 6 },
  emotionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: Spacing.md,
  },
  backBtn: { padding: 6, width: 34 },
  resultHeaderCenter: { flex: 1, alignItems: 'center' },
  resultEmoji: { fontSize: 32, marginBottom: 4 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  resultSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 15 },
  resultsList: { padding: Spacing.md },
  verseCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.text,
    fontStyle: 'italic',
  },
  verseRef: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  actionText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
});