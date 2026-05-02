import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ResultSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ResultSection({ title, children }: ResultSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

interface ResultRowProps {
  label: string;
  value: string;
}

export function ResultRow({ label, value }: ResultRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

interface ScoreBadgeProps {
  score: number;
  label: string;
}

export function ScoreBadge({ score, label }: ScoreBadgeProps) {
  const color = score >= 80 ? '#4CAF50' : score >= 60 ? '#FF9800' : score >= 40 ? '#FF5722' : '#f44336';
  return (
    <View style={styles.badgeContainer}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeScore}>{score}</Text>
      </View>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e3a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    color: '#aaaacc',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  content: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  label: {
    color: '#8888a8',
    fontSize: 14,
    flex: 1,
  },
  value: {
    color: '#e8e8f0',
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  badgeContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeScore: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  badgeLabel: {
    color: '#8888a8',
    fontSize: 11,
  },
});
