import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FortuneCard } from '../src/components/FortuneCard';
import { generateSummary } from '../src/services/fortuneGenerator';
import { today, formatDateFull, chineseWeekday } from '../src/utils/date';
import { useUserStore } from '../src/store/userStore';

export default function HomeScreen() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const summary = useMemo(() => generateSummary(), []);

  const userName = profile.name || '朋友';
  const todayStr = today();
  const weekday = chineseWeekday(todayStr);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {userName}，{weekday}好
          </Text>
          <Text style={styles.date}>{formatDateFull(todayStr)}</Text>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>今日综合运势</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{summary.data.overallScore}</Text>
            </View>
          </View>
          <Text style={styles.summaryMood}>{summary.data.mood}</Text>
          <View style={styles.keywordRow}>
            {summary.data.keywords.map((kw: string) => (
              <View key={kw} style={styles.keyword}>
                <Text style={styles.keywordText}>{kw}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.summaryAdvice}>💡 {summary.data.advice}</Text>
        </View>

        {/* Fortune entries */}
        <Text style={styles.sectionTitle}>选择运势方式</Text>

        <FortuneCard
          icon="📅"
          title="黄历"
          description="查看今日宜忌、冲煞、财神方位"
          color="#D4A574"
          onPress={() => router.push('/fortune/almanac')}
        />
        <FortuneCard
          icon="☯️"
          title="卦象"
          description="抽取今日卦象，获得易经指引"
          color="#C9A3D9"
          onPress={() => router.push('/fortune/iching')}
        />
        <FortuneCard
          icon="🔮"
          title="塔罗"
          description="每日一牌，探索内心世界"
          color="#7B68EE"
          onPress={() => router.push('/fortune/tarot')}
        />
        <FortuneCard
          icon="⭐"
          title="星座"
          description="查看今日星座运势详情"
          color="#5C9CE6"
          onPress={() => router.push('/fortune/zodiac')}
        />

        {/* Bottom entries */}
        <FortuneCard
          icon="📆"
          title="历史记录"
          description="回顾保存过的每日运势"
          color="#4ECDC4"
          onPress={() => router.push('/calendar')}
        />
        <FortuneCard
          icon="⚙️"
          title="设置"
          description="管理个人信息和应用偏好"
          color="#888"
          onPress={() => router.push('/settings')}
        />

        <Text style={styles.disclaimer}>
          免责声明：本应用内容仅供娱乐和自我反思参考，不构成任何形式的预测或建议。
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12122a',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  greeting: {
    color: '#e8e8f0',
    fontSize: 26,
    fontWeight: '700',
  },
  date: {
    color: '#7777aa',
    fontSize: 14,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a5a',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    color: '#e8e8f0',
    fontSize: 18,
    fontWeight: '600',
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  summaryMood: {
    color: '#ccccee',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  keywordRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  keyword: {
    backgroundColor: '#6C63FF20',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  keywordText: {
    color: '#6C63FF',
    fontSize: 13,
  },
  summaryAdvice: {
    color: '#aaaacc',
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#8888aa',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  disclaimer: {
    color: '#555',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
