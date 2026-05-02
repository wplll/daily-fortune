import React from 'react';
import { Stack } from 'expo-router';

export default function FortuneLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#12122a' } }}>
      <Stack.Screen name="almanac" />
      <Stack.Screen name="iching" />
      <Stack.Screen name="tarot" />
      <Stack.Screen name="zodiac" />
    </Stack>
  );
}
