import * as FileSystem from 'expo-file-system/legacy';

const ONBOARDING_FILE = FileSystem.documentDirectory + 'onboarding.json';

export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const info = await FileSystem.getInfoAsync(ONBOARDING_FILE);
    if (!info.exists) return false;
    const content = await FileSystem.readAsStringAsync(ONBOARDING_FILE);
    const data = JSON.parse(content);
    return data.completed === true;
  } catch (e) {
    return false;
  }
};

export const completeOnboarding = async (userName: string): Promise<void> => {
  try {
    await FileSystem.writeAsStringAsync(
      ONBOARDING_FILE,
      JSON.stringify({ completed: true, userName, completedAt: new Date().toISOString() })
    );
  } catch (e) {
    console.error('completeOnboarding error:', e);
  }
};

export const getUserName = async (): Promise<string | null> => {
  try {
    const info = await FileSystem.getInfoAsync(ONBOARDING_FILE);
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(ONBOARDING_FILE);
    const data = JSON.parse(content);
    return data.userName || null;
  } catch (e) {
    return null;
  }
};