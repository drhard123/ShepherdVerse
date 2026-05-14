import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';

export default function SettingsScreen(){
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <Text style={styles.sub}>
        Language, notifications, font size and theme preferences coming in Phase 2!
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