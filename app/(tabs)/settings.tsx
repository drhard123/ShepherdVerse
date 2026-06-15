import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import {
  registerForPushNotifications,
  scheduleDailyVerseNotification,
  sendTestNotification,
} from '../../services/notificationService';
import { AppSettings, DEFAULT_SETTINGS, loadSettings, saveSettings } from '../../services/settingsService';

type Translation = {
  id: string;
  name: string;
  shortName: string;
  language: string;
};

const TRANSLATIONS: Translation[] = [
  { id: 'kjv', name: 'King James Version', shortName: 'KJV', language: 'English' },
  { id: 'web', name: 'World English Bible', shortName: 'WEB', language: 'English' },
  { id: 'asv', name: 'American Standard Version', shortName: 'ASV', language: 'English' },
  { id: 'bbe', name: 'Bible in Basic English', shortName: 'BBE', language: 'English' },
  { id: 'darby', name: 'Darby Bible', shortName: 'DARBY', language: 'English' },
  { id: 'ylt', name: "Young's Literal Translation", shortName: 'YLT', language: 'English' },
];

const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);



export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showTranslations, setShowTranslations] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    const s = await loadSettings();
    setSettings(s);
  };

  const saveSettingsData = async (updated: AppSettings) => {
    await saveSettings(updated);
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    await saveSettingsData(updated);
    if (key === 'notificationTime' || key === 'notifications' || key === 'verseOfDay') {
      const granted = await registerForPushNotifications();
      if (granted) {
        await scheduleDailyVerseNotification();
      }
    }
  };

  const selectedTranslation = TRANSLATIONS.find(t => t.id === settings.translation) || TRANSLATIONS[0];

  const clearBookmarks = () => {
    Alert.alert(
      'Clear All Bookmarks',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const bookmarksFile = FileSystem.documentDirectory + 'bookmarks.json';
              await FileSystem.writeAsStringAsync(bookmarksFile, '[]');
              Alert.alert('Done', 'All bookmarks cleared.');
            } catch (e) {
              console.error(e);
            }
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    const granted = await registerForPushNotifications();
    if (granted) {
      await sendTestNotification();
      Toast.show({
        type: 'success',
        text1: '🔔 Test notification sent!',
        text2: 'You will receive it in 5 seconds',
        visibilityTime: 3000,
        position: 'bottom',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Permission denied',
        text2: 'Please allow notifications in your phone settings',
        visibilityTime: 3000,
        position: 'bottom',
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Settings</Text>
        <Text style={styles.bannerSub}>Personalise your ShepherdVerse experience</Text>
      </View>

      {/* Saved indicator */}
      {saved && (
        <View style={styles.savedBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.savedText}>Settings saved!</Text>
        </View>
      )}

      {/* Bible Translation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="book-outline" size={15} color={Colors.primary} /> Bible Translation
        </Text>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowTranslations(!showTranslations)}
        >
          <View>
            <Text style={styles.selectorMain}>{selectedTranslation.shortName}</Text>
            <Text style={styles.selectorSub}>{selectedTranslation.name}</Text>
          </View>
          <Ionicons
            name={showTranslations ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>

        {showTranslations && (
          <View style={styles.dropdown}>
            {TRANSLATIONS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.dropdownItem,
                  settings.translation === t.id && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  updateSetting('translation', t.id);
                  setShowTranslations(false);
                }}
              >
                <View>
                  <Text style={[
                    styles.dropdownItemTitle,
                    settings.translation === t.id && { color: Colors.primary },
                  ]}>
                    {t.shortName} — {t.name}
                  </Text>
                  <Text style={styles.dropdownItemSub}>{t.language}</Text>
                </View>
                {settings.translation === t.id && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Font Size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="text-outline" size={15} color={Colors.primary} /> Font Size
        </Text>
        <View style={styles.card}>
          <View style={styles.fontPreviewRow}>
            <Text style={styles.fontLabel}>Preview</Text>
            <Text style={[styles.fontPreview, { fontSize: settings.fontSize }]}>
              "The Lord is my shepherd."
            </Text>
          </View>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>A</Text>
            <Slider
              style={styles.slider}
              minimumValue={12}
              maximumValue={24}
              step={1}
              value={settings.fontSize}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
              onValueChange={(val) => updateSetting('fontSize', val)}
            />
            <Text style={[styles.sliderLabel, { fontSize: 20 }]}>A</Text>
          </View>
          <Text style={styles.fontSizeValue}>Current size: {settings.fontSize}px</Text>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="notifications-outline" size={15} color={Colors.primary} /> Notifications
        </Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Daily Notifications</Text>
              <Text style={styles.toggleSub}>Receive daily Bible reminders</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(val) => updateSetting('notifications', val)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={settings.notifications ? Colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.divider]} />

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Verse of the Day</Text>
              <Text style={styles.toggleSub}>Morning verse notification</Text>
            </View>
            <Switch
              value={settings.verseOfDay}
              onValueChange={(val) => updateSetting('verseOfDay', val)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={settings.verseOfDay ? Colors.primary : '#f4f3f4'}
            />
          </View>

          {settings.notifications && (
            <>
              <View style={styles.divider} />
              <View style={styles.timeRow}>
                <Text style={styles.toggleTitle}>Notification Time</Text>
                <View style={styles.timeButtons}>
                  {['06:00', '07:00', '08:00', '09:00', '20:00', '21:00'].map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeBtn,
                        settings.notificationTime === time && styles.timeBtnActive,
                      ]}
                      onPress={() => updateSetting('notificationTime', time)}
                    >
                      <Text style={[
                        styles.timeBtnText,
                        settings.notificationTime === time && styles.timeBtnTextActive,
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.testNotifBtn}
                  onPress={handleTestNotification}
                >
                  <Ionicons name="notifications-outline" size={18} color={Colors.primary} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.testNotifTitle}>Send Test Notification</Text>
                    <Text style={styles.testNotifSub}>Receive a test verse in 5 seconds</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="color-palette-outline" size={15} color={Colors.primary} /> Appearance
        </Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Dark Mode</Text>
              <Text style={styles.toggleSub}>Coming in Phase 2</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(val) => updateSetting('darkMode', val)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={settings.darkMode ? Colors.primary : '#f4f3f4'}
              disabled={true}
            />
          </View>
        </View>
      </View>

      {/* Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="server-outline" size={15} color={Colors.primary} /> Data
        </Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.dangerRow} onPress={clearBookmarks}>
            <Ionicons name="trash-outline" size={18} color={Colors.notification} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.dangerTitle}>Clear All Bookmarks</Text>
              <Text style={styles.dangerSub}>Remove all saved verses</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="information-circle-outline" size={15} color={Colors.primary} /> About
        </Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Name</Text>
            <Text style={styles.aboutValue}>ShepherdVerse</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0 (Phase 1)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Bible API</Text>
            <Text style={styles.aboutValue}>bible-api.com</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Built with</Text>
            <Text style={styles.aboutValue}>React Native + Expo</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
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
  bannerSub: { fontSize: 13, color: '#A8D5AA', marginTop: 4, textAlign: 'center' },
  savedBanner: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
  },
  savedText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  section: { margin: Spacing.md, marginBottom: 0 },
  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: Colors.text,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden',
  },
  selector: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: Spacing.md, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  selectorMain: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  selectorSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  dropdown: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    borderWidth: 0.5, borderColor: Colors.border, marginTop: 6, overflow: 'hidden',
  },
  dropdownItem: {
    padding: Spacing.md, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  dropdownItemActive: { backgroundColor: Colors.verseHighlight },
  dropdownItemTitle: { fontSize: 14, fontWeight: '500', color: Colors.text },
  dropdownItemSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  fontPreviewRow: { padding: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  fontLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  fontPreview: { color: Colors.text, fontStyle: 'italic', lineHeight: 28 },
  sliderRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 8,
  },
  sliderLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', width: 20 },
  slider: { flex: 1, marginHorizontal: 8 },
  fontSizeValue: {
    fontSize: 12, color: Colors.textSecondary,
    paddingHorizontal: Spacing.md, paddingBottom: 12, textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: Spacing.md,
  },
  toggleTitle: { fontSize: 15, fontWeight: '500', color: Colors.text },
  toggleSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 0.5, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  timeRow: { padding: Spacing.md },
  timeButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  timeBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  timeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  timeBtnTextActive: { color: '#fff' },
  testNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  testNotifTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.primary,
  },
  testNotifSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dangerRow: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
  },
  dangerTitle: { fontSize: 15, fontWeight: '500', color: Colors.notification },
  dangerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: Spacing.md,
  },
  aboutLabel: { fontSize: 14, color: Colors.textSecondary },
  aboutValue: { fontSize: 14, fontWeight: '500', color: Colors.text },
});