import React from 'react';
import { Stack } from 'expo-router';

export default function CalendarLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#12122a' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[date]" />
    </Stack>
  );
}
