import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFortuneStore } from '../src/store/fortuneStore';
import { useUserStore } from '../src/store/userStore';
import { useAISettingsStore } from '../src/store/aiSettingsStore';
import { useAlmanacSettingsStore } from '../src/store/almanacSettingsStore';
import { storageService } from '../src/services/storageService';

export default function RootLayout() {
  const setRecords = useFortuneStore((s) => s.setRecords);
  const setProfile = useUserStore((s) => s.setProfile);
  const setAISettings = useAISettingsStore((s) => s.setAISettings);
  const setBackendSettings = useAISettingsStore((s) => s.setBackendSettings);
  const setAlmanacSettings = useAlmanacSettingsStore((s) => s.setSettings);

  useEffect(() => {
    (async () => {
      const [records, profile, aiSettings, backendSettings, almanacSettings] = await Promise.all([
        storageService.loadRecords(),
        storageService.loadProfile(),
        storageService.loadAISettings(),
        storageService.loadBackendSettings(),
        storageService.loadAlmanacSettings(),
      ]);

      setRecords(records);
      if (profile) setProfile(profile as Parameters<typeof setProfile>[0]);
      if (aiSettings) setAISettings(aiSettings);
      if (backendSettings) setBackendSettings(backendSettings);
      if (almanacSettings) setAlmanacSettings(almanacSettings);
    })();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#12122a' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="fortune" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="calendar" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}
