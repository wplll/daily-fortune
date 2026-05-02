import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { ResultSection, ResultRow, ScoreBadge } from '../../src/components/ResultSection';
import { MarkdownView } from '../../src/components/MarkdownView';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { Toast } from '../../src/components/Toast';
import { ShareActions } from '../../src/components/ShareActions';
import { FortuneShareCard } from '../../src/components/FortuneShareCard';
import { generateZodiac } from '../../src/services/fortuneGenerator';
import { analyzeFortune } from '../../src/services/aiService';
import { storageService } from '../../src/services/storageService';
import { loadAICache, saveAICache } from '../../src/services/aiCacheService';
import { useFortuneStore } from '../../src/store/fortuneStore';
import { useUserStore } from '../../src/store/userStore';
import { useAISettingsStore } from '../../src/store/aiSettingsStore';
import { today, formatDate } from '../../src/utils/date';
import { FortuneRecord, ZodiacSign, AppError } from '../../src/types/fortune';
import { getZodiacSigns } from '../../src/data/zodiacData';
import { generateId } from '../../src/utils/random';

const ALL_SIGNS = getZodiacSigns();

export default function ZodiacScreen() {
  const router = useRouter();
  const userProfile = useUserStore((s) => s.profile);
  const setZodiacSign = useUserStore((s) => s.setZodiacSign);
  const addRecord = useFortuneStore((s) => s.addRecord);
  const records = useFortuneStore((s) => s.records);
  const aiSettings = useAISettingsStore((s) => s.aiSettings);
  const d = today();

  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(userProfile.zodiacSign);
  const [showPicker, setShowPicker] = useState(false);

  const result = useMemo(() => generateZodiac(d, selectedSign), [selectedSign]);
  const data = result.data;

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tdVisible, setTdVisible] = useState(false);
  const [tdMessage, setTdMessage] = useState('');
  const [tdType, setTdType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setTdMessage(msg);
    setTdType(type);
    setTdVisible(true);
  };

  useEffect(() => {
    storageService.saveRecords(records);
  }, [records]);

  // Restore cached AI analysis for current sign on mount
  useEffect(() => {
    loadAICache('zodiac', `${d}_${selectedSign}`).then((cached) => {
      setAiAnalysis(cached || null);
    });
  }, []);

  const handleSelectSign = (sign: ZodiacSign) => {
    setSelectedSign(sign);
    setShowPicker(false);
    setAiAnalysis(null);
  };

  const handleSave = async () => {
    const record: FortuneRecord = {
      id: generateId(),
      date: d,
      type: 'zodiac',
      title: `星座 - ${data.sign}`,
      rawResult: data as unknown as Record<string, unknown>,
      aiAnalysis: aiAnalysis ?? undefined,
      savedAt: new Date().toISOString(),
    };
    setZodiacSign(selectedSign);
    addRecord(record);
    showToast('星座运势已保存');
  };

  const handleAI = async () => {
    if (!aiSettings.apiKey) {
      showToast('请先在设置页配置 API Key', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await analyzeFortune({
        type: 'zodiac',
        date: d,
        result: data as unknown as Record<string, unknown>,
        userProfile: {
          zodiacSign: selectedSign,
          birthDate: userProfile.birthDate,
          name: userProfile.name || '用户',
        },
        aiSettings,
      });
      setAiAnalysis(response.analysis);
      await saveAICache('zodiac', `${d}_${selectedSign}`, response.analysis);
      showToast('AI 分析完成');
    } catch (err: unknown) {
      if (err instanceof AppError) {
        showToast(err.userMessage, 'error');
      } else {
        showToast(err instanceof Error ? err.message : 'AI 分析失败', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const shareHighlights = [
    { label: '综合', value: `${data.overall}分` },
    { label: '爱情', value: `${data.love}分` },
    { label: '事业', value: `${data.career}分` },
    { label: '财运', value: `${data.wealth}分` },
    { label: '幸运色', value: data.luckyColor },
    { label: '速配', value: data.bestMatch },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.back} onPress={() => router.back()}>‹ 返回</Text>
          <Text style={styles.title}>⭐ 星座运势</Text>
          <Text style={styles.subtitle}>{formatDate(d)}</Text>
        </View>

        <Pressable style={styles.signSelector} onPress={() => setShowPicker(!showPicker)}>
          <Text style={styles.signLabel}>选择星座</Text>
          <Text style={styles.signValue}>{selectedSign}</Text>
        </Pressable>

        {showPicker && (
          <View style={styles.pickerGrid}>
            {ALL_SIGNS.map((sign) => (
              <Pressable
                key={sign}
                style={[styles.pickerItem, sign === selectedSign && styles.pickerItemActive]}
                onPress={() => handleSelectSign(sign)}
              >
                <Text style={[styles.pickerItemText, sign === selectedSign && styles.pickerItemTextActive]}>
                  {sign}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.scoreRow}>
          <ScoreBadge score={data.overall} label="综合" />
          <ScoreBadge score={data.love} label="爱情" />
          <ScoreBadge score={data.career} label="事业" />
          <ScoreBadge score={data.wealth} label="财运" />
          <ScoreBadge score={data.health} label="健康" />
        </View>

        <ResultSection title="幸运提示">
          <ResultRow label="幸运颜色" value={data.luckyColor} />
          <ResultRow label="幸运数字" value={String(data.luckyNumber)} />
          <ResultRow label="速配星座" value={data.bestMatch} />
        </ResultSection>

        <ResultSection title="今日建议">
          <Text style={styles.content}>{data.advice}</Text>
        </ResultSection>

        {aiAnalysis && (
          <ResultSection title="AI 深度解读">
            <MarkdownView content={aiAnalysis} />
          </ResultSection>
        )}

        <View style={styles.actions}>
          <ActionButton
            title={aiAnalysis ? '重新生成 AI 解读' : 'AI 深度解读'}
            onPress={handleAI}
            icon="✨"
            disabled={loading}
          />
          <ActionButton title="保存今日星座运势" onPress={handleSave} variant="secondary" />
        </View>

        <ShareActions
          shareCard={
            <FortuneShareCard
              type="zodiac"
              title={data.sign}
              subtitle={`综合运势 ${data.overall} 分`}
              date={formatDate(d)}
              highlights={shareHighlights}
              aiSummary={aiAnalysis?.substring(0, 120)}
            />
          }
        />

        <LoadingOverlay visible={loading} />
        <Toast visible={tdVisible} message={tdMessage} type={tdType} onHide={() => setTdVisible(false)} />
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
  subtitle: { color: '#7777aa', fontSize: 14, marginTop: 4 },
  signSelector: {
    backgroundColor: '#1e1e3a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  signLabel: { color: '#8888a8', fontSize: 14 },
  signValue: { color: '#e8e8f0', fontSize: 16, fontWeight: '600' },
  pickerGrid: {
    backgroundColor: '#1e1e3a',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pickerItem: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#2a2a4a',
  },
  pickerItemActive: { backgroundColor: '#6C63FF' },
  pickerItemText: { color: '#aaa', fontSize: 13 },
  pickerItemTextActive: { color: '#fff', fontWeight: '600' },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1e1e3a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  content: { color: '#ccccee', fontSize: 14, lineHeight: 22 },
  aiText: { color: '#ccccee', fontSize: 14, lineHeight: 24 },
  actions: { marginTop: 20, gap: 12 },
});
