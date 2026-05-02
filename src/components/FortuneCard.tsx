import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface FortuneCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  color?: string;
}

export function FortuneCard({ icon, title, description, onPress, color = '#6C63FF' }: FortuneCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { borderLeftColor: color }, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e3a',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#e8e8f0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: '#8888a8',
    fontSize: 13,
  },
  arrow: {
    color: '#555',
    fontSize: 28,
    fontWeight: '300',
  },
});
