import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import {
    ActivityIndicator, Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { BorderRadius, Colors, Spacing } from '../constants/theme';
import { getDailyVerse, VerseData } from '../services/bibleApi';

type Template = {
  id: string;
  label: string;
  background: string;
  textColor: string;
  refColor: string;
  accent: string;
};

const TEMPLATES: Template[] = [
  { id: 'forest', label: 'Forest', background: '#1A3D1C', textColor: '#FFFFFF', refColor: '#A8D5AA', accent: '#4A8C4D' },
  { id: 'sunrise', label: 'Sunrise', background: '#FF6B35', textColor: '#FFFFFF', refColor: '#FFE0D0', accent: '#FFB347' },
  { id: 'ocean', label: 'Ocean', background: '#1565C0', textColor: '#FFFFFF', refColor: '#BBDEFB', accent: '#42A5F5' },
  { id: 'gold', label: 'Royal Gold', background: '#7B5E00', textColor: '#FFF8E1', refColor: '#D4AF37', accent: '#D4AF37' },
  { id: 'night', label: 'Night Sky', background: '#0D1B2A', textColor: '#E8EAF6', refColor: '#9FA8DA', accent: '#5C6BC0' },
  { id: 'rose', label: 'Rose', background: '#880E4F', textColor: '#FCE4EC', refColor: '#F48FB1', accent: '#F06292' },
  { id: 'earth', label: 'Earth', background: '#3E2723', textColor: '#EFEBE9', refColor: '#BCAAA4', accent: '#A1887F' },
  { id: 'sky', label: 'Sky', background: '#E3F2FD', textColor: '#1A237E', refColor: '#1565C0', accent: '#1E88E5' },
];

export default function ShareCardScreen() {
  const router = useRouter();
  const { verseText, verseRef } = useLocalSearchParams<{
    verseText?: string;
    verseRef?: string;
  }>();

  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<View>(null);

  const loadVerse = async () => {
    setLoading(true);
    const data = await getDailyVerse();
    setVerse(data);
    setLoading(false);
  };

  const shareImage = async () => {
    try {
      setSaving(true);
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your verse card',
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not share image.');
    } finally {
      setSaving(false);
    }
  };

  const displayVerse = verse || (verseText && verseRef ? {
    text: verseText,
    reference: verseRef,
  } : {
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    reference: 'John 3:16',
  });

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Verse Card</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Verse Card Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preview</Text>
          <View
            ref={cardRef}
            style={[styles.card, { backgroundColor: selectedTemplate.background }]}
            collapsable={false}
          >
            <View style={[styles.cardAccentTop, { backgroundColor: selectedTemplate.accent }]} />
            <Text style={[styles.cardWatermark, { color: selectedTemplate.accent }]}>
              ShepherdVerse
            </Text>
            <Text style={[styles.quoteMarks, { color: selectedTemplate.accent }]}>"</Text>
            <Text style={[styles.cardVerseText, { color: selectedTemplate.textColor }]}>
              {displayVerse.text.trim()}
            </Text>
            <View style={[styles.refContainer, { borderTopColor: selectedTemplate.accent + '60' }]}>
              <Text style={[styles.cardReference, { color: selectedTemplate.refColor }]}>
                — {displayVerse.reference}
              </Text>
            </View>
            <View style={[styles.cardAccentBottom, { backgroundColor: selectedTemplate.accent }]} />
          </View>
        </View>

        {/* Load Different Verse */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.loadBtn} onPress={loadVerse} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.textLight} size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={18} color={Colors.textLight} />
                <Text style={styles.loadBtnText}>Load Different Verse</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Template Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Choose Background</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                onPress={() => setSelectedTemplate(template)}
                style={[
                  styles.templateChip,
                  { backgroundColor: template.background },
                  selectedTemplate.id === template.id && styles.templateChipSelected,
                ]}
              >
                {selectedTemplate.id === template.id && (
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
                )}
                <Text style={styles.templateChipText}>{template.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Export & Share</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
              onPress={shareImage}
              disabled={saving}
            >
              <Ionicons name="download-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Save to Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#25D366' }]}
              onPress={shareImage}
              disabled={saving}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.shareAllBtn}
            onPress={shareImage}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <>
                <Ionicons name="share-social-outline" size={20} color={Colors.primary} />
                <Text style={styles.shareAllBtnText}>Share to Instagram / Facebook / More</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
          <Text style={styles.tipText}>
            Tip: After tapping Share, choose Instagram Stories or Facebook Stories to post as a story!
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: Colors.textLight, textAlign: 'center' },
  section: { margin: Spacing.md, marginBottom: 0 },
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  card: {
    borderRadius: BorderRadius.xl, padding: 28, minHeight: 320,
    justifyContent: 'center', overflow: 'hidden', elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
  },
  cardAccentTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl,
  },
  cardAccentBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
    borderBottomLeftRadius: BorderRadius.xl, borderBottomRightRadius: BorderRadius.xl,
  },
  cardWatermark: {
    fontSize: 11, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: 16, opacity: 0.8,
  },
  quoteMarks: { fontSize: 64, fontWeight: 'bold', lineHeight: 48, marginBottom: 8, opacity: 0.6 },
  cardVerseText: { fontSize: 17, lineHeight: 28, fontStyle: 'italic' },
  refContainer: { marginTop: 20, paddingTop: 14, borderTopWidth: 0.5 },
  cardReference: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  loadBtn: {
    backgroundColor: Colors.primaryLight, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: BorderRadius.lg,
  },
  loadBtnText: { color: Colors.textLight, fontWeight: '600', fontSize: 15 },
  templateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full,
    marginRight: 8, borderWidth: 2, borderColor: 'transparent',
  },
  templateChipSelected: { borderColor: Colors.secondary },
  templateChipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, padding: 14, borderRadius: BorderRadius.lg,
  },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  shareAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 14, borderRadius: BorderRadius.lg,
    borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: Colors.surface,
  },
  shareAllBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  tipBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    margin: Spacing.md, marginTop: Spacing.md,
    backgroundColor: Colors.verseHighlight, padding: 12,
    borderRadius: BorderRadius.md, borderWidth: 0.5, borderColor: '#E8D5A0',
  },
  tipText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});