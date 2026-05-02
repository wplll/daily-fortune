import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFortuneStore } from '../../src/store/fortuneStore';
import { storageService } from '../../src/services/storageService';
import { formatDate } from '../../src/utils/date';
import { FortuneRecord, FortuneType } from '../../src/types/fortune';

const typeLabels: Record<FortuneType, string> = {
  almanac: '📅 黄历',
  iching: '☯️ 卦象',
  tarot: '🔮 塔罗',
  zodiac: '⭐ 星座',
  summary: '✨ 综合',
};

export default function DateDetailScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const getRecordsByDate = useFortuneStore((s) => s.getRecordsByDate);
  const removeRecord = useFortuneStore((s) => s.removeRecord);
  const records = useFortuneStore((s) => s.records);

  const dateRecords = useMemo(() => getRecordsByDate(date), [date, getRecordsByDate]);

  const handleDelete = (record: FortuneRecord) => {
    Alert.alert('删除记录', `确定要删除「${record.title}」吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          removeRecord(record.id);
          await storageService.saveRecords(records.filter((r) => r.id !== record.id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.back} onPress={() => router.back()}>‹ 返回</Text>
          <Text style={styles.title}>{formatDate(date)}</Text>
          <Text style={styles.count}>
            {dateRecords.length === 0 ? '暂无记录' : `${dateRecords.length} 条记录`}
          </Text>
        </View>

        {dateRecords.map((record) => (
          <View key={record.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardType}>{typeLabels[record.type]}</Text>
                <Text style={styles.cardTitle}>{record.title}</Text>
              </View>
              <Pressable onPress={() => handleDelete(record)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>删除</Text>
              </Pressable>
            </View>

            {record.aiAnalysis ? (
              <View style={styles.analysisBox}>
                <Text style={styles.aiLabel}>✨ AI 解读</Text>
                <Text style={styles.analysisText} numberOfLines={5}>
                  {record.aiAnalysis}
                </Text>
              </View>
            ) : (
              <Text style={styles.noAnalysis}>暂无 AI 解读</Text>
            )}

            <Text style={styles.savedTime}>
              保存于 {new Date(record.savedAt).toLocaleString('zh-CN')}
            </Text>
          </View>
        ))}

        {dateRecords.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>这一天还没有记录</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12122a' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  back: { color: '#6C63FF', fontSize: 16, marginBottom: 8 },
  title: { color: '#e8e8f0', fontSize: 24, fontWeight: '700' },
  count: { color: '#7777aa', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#1e1e3a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardType: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
  cardTitle: { color: '#e8e8f0', fontSize: 16, fontWeight: '500', marginTop: 2 },
  deleteBtn: {
    backgroundColor: '#e74c3c20',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: { color: '#e74c3c', fontSize: 13 },
  analysisBox: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  aiLabel: { color: '#FFD700', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  analysisText: { color: '#ccccee', fontSize: 13, lineHeight: 20 },
  noAnalysis: { color: '#555', fontSize: 13 },
  savedTime: { color: '#555', fontSize: 11, marginTop: 8 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#666', fontSize: 16 },
});
