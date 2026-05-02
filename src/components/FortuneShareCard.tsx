import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FortuneType } from '../types/fortune';

interface FortuneShareCardProps {
  type: FortuneType;
  title: string;
  subtitle: string;
  date: string;
  highlights: { label: string; value: string }[];
  aiSummary?: string;
}

const typeLabels: Record<FortuneType, string> = {
  almanac: '📅 黄历',
  iching: '☯️ 卦象',
  tarot: '🔮 塔罗',
  zodiac: '⭐ 星座',
  summary: '✨ 综合运势',
};

const bgColors: Record<FortuneType, string> = {
  almanac: '#1a1a3e',
  iching: '#1e1836',
  tarot: '#1a1f3e',
  zodiac: '#182236',
  summary: '#1e1a36',
};

export const FortuneShareCard = forwardRef<View, FortuneShareCardProps>(
  function FortuneShareCard({ type, title, subtitle, date, highlights, aiSummary }, ref) {
    return (
      <View ref={ref} style={[styles.container, { backgroundColor: bgColors[type] || '#1a1a3e' }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>每日运势 Daily Fortune</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        {/* Type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{typeLabels[type]}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {/* Highlights */}
        <View style={styles.highlightSection}>
          {highlights.map((h, i) => (
            <View key={i} style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>{h.label}</Text>
              <Text style={styles.highlightValue}>{h.value}</Text>
            </View>
          ))}
        </View>

        {/* AI summary (truncated) */}
        {aiSummary ? (
          <View style={styles.aiSection}>
            <Text style={styles.aiLabel}>✨ AI 解读</Text>
            <Text style={styles.aiText} numberOfLines={4}>
              {aiSummary}
            </Text>
          </View>
        ) : null}

        {/* Footer disclaimer */}
        <View style={styles.footer}>
          <Text style={styles.disclaimer}>仅供娱乐与自我反思参考</Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: 350,
    padding: 24,
    borderRadius: 20,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    color: '#8888aa',
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    color: '#8888aa',
    fontSize: 12,
  },
  typeBadge: {
    backgroundColor: '#6C63FF30',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  typeText: {
    color: '#6C63FF',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: '#e8e8f0',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#aaaacc',
    fontSize: 14,
    marginBottom: 16,
  },
  highlightSection: {
    backgroundColor: '#ffffff10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  highlightLabel: {
    color: '#8888a8',
    fontSize: 13,
  },
  highlightValue: {
    color: '#e8e8f0',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  aiSection: {
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  aiLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  aiText: {
    color: '#ccccee',
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#ffffff15',
    paddingTop: 12,
    alignItems: 'center',
  },
  disclaimer: {
    color: '#555',
    fontSize: 10,
  },
});
