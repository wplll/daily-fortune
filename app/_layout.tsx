import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFortuneStore } from '../src/store/fortuneStore';
import { useUserStore } from '../src/store/userStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { storageService } from '../src/services/storageService';

export default function RootLayout() {
  const setRecords = useFortuneStore((s) => s.setRecords);
  const setProfile = useUserStore((s) => s.setProfile);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    (async () => {
      const [records, profile] = await Promise.all([
        storageService.loadRecords(),
        storageService.loadProfile(),
        loadSettings(),
      ]);

      setRecords(records);
      if (profile) setProfile(profile as Parameters<typeof setProfile>[0]);
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
