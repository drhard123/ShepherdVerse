import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { getDailyVerse, VerseData } from '../../services/bibleApi';
import { getUserName } from '../../services/onboardingService';
import { loadSettings } from '../../services/settingsService';


type QuickItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  route: string;
};

const QUICK_ITEMS: QuickItem[] = [
  { icon: 'book-outline', label: 'Read Bible', color: '#2C5F2E', route: '/bible' },
  { icon: 'bookmark-outline', label: 'Saved Verses', color: '#1565C0', route: '/bookmarks' },
  { icon: 'image-outline', label: 'Create Card', color: '#6A1B9A', route: '/share' },
  { icon: 'heart-outline', label: 'Emotions', color: '#E65100', route: '/emotions' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    loadDailyVerse();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    const name = await getUserName();
    setUserName(name);
  };

  const loadDailyVerse = async (): Promise<void> => {
    setLoading(true);
    const s = await loadSettings();
    const data = await getDailyVerse(s.translation);
    setVerse(data);
    setLoading(false);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.banner}>
        <Text style={styles.appName}>ShepherdVerse</Text>
        <Text style={styles.tagline}>
          {userName ? `Welcome, ${userName}` : 'Voice of God • Word of Life'}
        </Text>
        <Text style={styles.dateText}>{today}</Text>
      </View>

      {/* Daily Verse Card */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sunny" size={18} color={Colors.secondary} />
          <Text style={styles.sectionTitle}>Verse of the Day</Text>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading today's verse...</Text>
          </View>
        ) : verse ? (
          <View style={styles.verseCard}>
            <Text style={styles.verseText}>"{verse.text}"</Text>
            <Text style={styles.verseRef}>{verse.reference}</Text>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => router.push('/share')}
            >
              <Ionicons name="share-social-outline" size={16} color={Colors.primary} />
              <Text style={styles.shareBtnText}>Share this verse</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.verseCard}>
            <Text style={styles.verseText}>
              "For God so loved the world that he gave his one and only Son,
              that whoever believes in him shall not perish but have eternal life."
            </Text>
            <Text style={styles.verseRef}>John 3:16</Text>
          </View>
        )}
      </View>

      {/* Quick Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickGrid}>
          {QUICK_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.quickIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reading Plans */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reading Plans</Text>
        <View style={styles.planCard}>
          <Ionicons name="calendar-outline" size={32} color={Colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.planTitle}>30-Day New Testament</Text>
            <Text style={styles.planSub}>Coming in Phase 2 · Stay tuned!</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  banner: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    paddingTop: 40,
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textLight,
    letterSpacing: 1,
  },
  tagline: { fontSize: 13, color: '#A8D5AA', marginTop: 4 },
  dateText: { fontSize: 12, color: '#A8D5AA', marginTop: 8 },
  section: { margin: Spacing.md, marginBottom: 0 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  loadingCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 32,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  loadingText: { marginTop: 10, color: Colors.textSecondary, fontSize: 14 },
  verseCard: {
    backgroundColor: Colors.verseHighlight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: '#E8D5A0',
  },
  verseText: { ...Typography.verse, color: Colors.text },
  verseRef: {
    ...Typography.reference,
    color: Colors.primary,
    marginTop: 12,
    textAlign: 'right',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 0.5,
    borderColor: Colors.primary,
  },
  shareBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickItem: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: { fontSize: 13, fontWeight: '500', color: Colors.text },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  planTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  planSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
});