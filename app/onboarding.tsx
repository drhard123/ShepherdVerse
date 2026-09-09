import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BorderRadius, Colors, Spacing } from '../constants/theme';
import {
    registerForPushNotifications,
    scheduleDailyVerseNotification,
} from '../services/notificationService';
import { completeOnboarding } from '../services/onboardingService';
import { AppSettings, DEFAULT_SETTINGS, saveSettings } from '../services/settingsService';

const { width } = Dimensions.get('window');

type Translation = {
  id: string;
  name: string;
  shortName: string;
};

const TRANSLATIONS: Translation[] = [
  { id: 'kjv', name: 'King James Version', shortName: 'KJV' },
  { id: 'web', name: 'World English Bible', shortName: 'WEB' },
  { id: 'asv', name: 'American Standard Version', shortName: 'ASV' },
  { id: 'bbe', name: 'Bible in Basic English', shortName: 'BBE' },
];

const NOTIF_TIMES = [
  { label: 'Early Morning', time: '06:00', icon: 'partly-sunny-outline' as const },
  { label: 'Morning', time: '08:00', icon: 'sunny-outline' as const },
  { label: 'Evening', time: '19:00', icon: 'cloudy-night-outline' as const },
  { label: 'Night', time: '21:00', icon: 'moon-outline' as const },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedTranslation, setSelectedTranslation] = useState('kjv');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const totalSteps = 4;

  const goNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const finishOnboarding = async () => {
    const settings: AppSettings = {
      ...DEFAULT_SETTINGS,
      translation: selectedTranslation,
      notifications: notificationsEnabled,
      notificationTime: selectedTime,
    };
    await saveSettings(settings);
    await completeOnboarding(name.trim() || 'Friend');

    if (notificationsEnabled) {
      const granted = await registerForPushNotifications();
      if (granted) {
        await scheduleDailyVerseNotification();
      }
    }

    router.replace('/(tabs)');
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    return true;
  };

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i === step && styles.progressDotActive,
              i < step && styles.progressDotDone,
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 0 — Welcome */}
        {step === 0 && (
          <View style={styles.stepContainer}>
            <View style={styles.welcomeIconCircle}>
              <Ionicons name="book" size={56} color={Colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to{'\n'}ShepherdVerse</Text>
            <Text style={styles.welcomeSubtitle}>
              Voice of God • Word of Life
            </Text>
            <Text style={styles.welcomeDescription}>
              Read God's word in your language, find comfort for any emotion,
              and share His promises with the world.
            </Text>
          </View>
        )}

        {/* Step 1 — Name */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Ionicons name="person-circle-outline" size={56} color={Colors.primary} />
            <Text style={styles.stepTitle}>What's your name?</Text>
            <Text style={styles.stepSubtitle}>
              We'll personalise your daily verse experience
            </Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={30}
            />
          </View>
        )}

        {/* Step 2 — Translation */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Ionicons name="globe-outline" size={56} color={Colors.primary} />
            <Text style={styles.stepTitle}>Choose your Bible</Text>
            <Text style={styles.stepSubtitle}>
              You can change this anytime in Settings
            </Text>
            <View style={styles.translationList}>
              {TRANSLATIONS.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.translationCard,
                    selectedTranslation === t.id && styles.translationCardActive,
                  ]}
                  onPress={() => setSelectedTranslation(t.id)}
                >
                  <View>
                    <Text style={[
                      styles.translationShort,
                      selectedTranslation === t.id && { color: Colors.primary },
                    ]}>
                      {t.shortName}
                    </Text>
                    <Text style={styles.translationName}>{t.name}</Text>
                  </View>
                  {selectedTranslation === t.id && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3 — Notifications */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Ionicons name="notifications-outline" size={56} color={Colors.primary} />
            <Text style={styles.stepTitle}>Daily Verse Reminder</Text>
            <Text style={styles.stepSubtitle}>
              Hi {name || 'Friend'}, when would you like to receive God's word?
            </Text>

            <View style={styles.timeGrid}>
              {NOTIF_TIMES.map((t) => (
                <TouchableOpacity
                  key={t.time}
                  style={[
                    styles.timeCard,
                    selectedTime === t.time && styles.timeCardActive,
                  ]}
                  onPress={() => {
                    setSelectedTime(t.time);
                    setNotificationsEnabled(true);
                  }}
                >
                  <Ionicons
                    name={t.icon}
                    size={28}
                    color={selectedTime === t.time ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[
                    styles.timeCardLabel,
                    selectedTime === t.time && { color: Colors.primary, fontWeight: '700' },
                  ]}>
                    {t.label}
                  </Text>
                  <Text style={styles.timeCardTime}>{t.time}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.skipNotifBtn}
              onPress={() => setNotificationsEnabled(false)}
            >
              <Text style={[
                styles.skipNotifText,
                !notificationsEnabled && styles.skipNotifTextActive,
              ]}>
                {notificationsEnabled ? "I don't want daily reminders" : "✓ Reminders disabled — tap to enable"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {step > 0 ? (
          <TouchableOpacity style={styles.backNavBtn} onPress={goBack}>
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
            <Text style={styles.backNavText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}

        <TouchableOpacity
          style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
          onPress={goNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextBtnText}>
            {step === totalSteps - 1 ? 'Start Reading' : 'Continue'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    width: 24, backgroundColor: Colors.primary,
  },
  progressDotDone: {
    backgroundColor: Colors.primaryLight,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 20,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  welcomeIconCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: Colors.verseHighlight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 30, fontWeight: 'bold', color: Colors.text,
    textAlign: 'center', lineHeight: 38,
  },
  welcomeSubtitle: {
    fontSize: 15, color: Colors.primary, fontWeight: '600',
    marginTop: 10, letterSpacing: 0.5,
  },
  welcomeDescription: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center',
    marginTop: 20, lineHeight: 24, paddingHorizontal: 10,
  },
  stepTitle: {
    fontSize: 24, fontWeight: 'bold', color: Colors.text,
    textAlign: 'center', marginTop: 20,
  },
  stepSubtitle: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
    marginTop: 8, marginBottom: 28, paddingHorizontal: 10,
  },
  nameInput: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: 16,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  translationList: { width: '100%', gap: 10 },
  translationCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  translationCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.verseHighlight,
  },
  translationShort: { fontSize: 16, fontWeight: '700', color: Colors.text },
  translationName: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  timeGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, width: '100%', justifyContent: 'center',
  },
  timeCard: {
    width: (width - Spacing.lg * 2 - 12) / 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
  },
  timeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.verseHighlight,
  },
  timeCardLabel: {
    fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 8,
  },
  timeCardTime: {
    fontSize: 12, color: Colors.textSecondary, marginTop: 4,
  },
  skipNotifBtn: { marginTop: 20, padding: 10 },
  skipNotifText: {
    fontSize: 13, color: Colors.textSecondary, textDecorationLine: 'underline',
  },
  skipNotifTextActive: {
    color: Colors.primary, fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  backNavBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    padding: 10,
  },
  backNavText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
  nextBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
  },
  nextBtnDisabled: {
    backgroundColor: Colors.border,
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});