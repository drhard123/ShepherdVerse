import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';

export default function ShareScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Verse Card Creator</Text>
      <Text style={styles.sub}>
        Generate beautiful verse images to share on WhatsApp, Instagram & Facebook — coming in Phase 3!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: { fontSize: 22, fontWeight: 'bold', color: Colors.primary },
  sub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
});