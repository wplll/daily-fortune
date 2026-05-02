import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { ResultSection } from '../../src/components/ResultSection';
import { MarkdownView } from '../../src/components/MarkdownView';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { Toast } from '../../src/components/Toast';
import { ShareActions } from '../../src/components/ShareActions';
import { FortuneShareCard } from '../../src/components/FortuneShareCard';
import { generateIChing } from '../../src/services/fortuneGenerator';
import { analyzeFortune } from '../../src/services/aiService';
import { storageService } from '../../src/services/storageService';
import { loadAICache, saveAICache } from '../../src/services/aiCacheService';
import { useFortuneStore } from '../../src/store/fortuneStore';
import { useUserStore } from '../../src/store/userStore';
import { useAISettingsStore } from '../../src/store/aiSettingsStore';
import { today, formatDate } from '../../src/utils/date';
import { FortuneRecord, IChingResult, IChingDrawState, AppError } from '../../src/types/fortune';
import { generateId } from '../../src/utils/random';

export default function IChingScreen() {
  const router = useRouter();
  const addRecord = useFortuneStore((s) => s.addRecord);
  const records = useFortuneStore((s) => s.records);
  const profile = useUserStore((s) => s.profile);
  const aiSettings = useAISettingsStore((s) => s.aiSettings);
  const d = today();

  const [drawState, setDrawState] = useState<IChingDrawState>('idle');
  const [result, setResult] = useState<IChingResult | null>(null);
  const [isRecast, setIsRecast] = useState(false);
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

  const castHexagram = useCallback((randomMode: boolean) => {
    if (drawState === 'casting') return;
    setDrawState('casting');
    setTimeout(() => {
      const res = generateIChing(undefined, randomMode);
      setResult(res.data);
      setDrawState('cast');
      loadAICache('iching', d).then((cached) => {
        if (cached) setAiAnalysis(cached);
      });
    }, 1000);
  }, [drawState, d]);

  const handleCast = useCallback(() => castHexagram(false), [castHexagram]);
  const handleRecast = useCallback(() => {
    setIsRecast(true);
    setAiAnalysis(null);
    setResult(null);
    setDrawState('idle');
  }, []);

  useEffect(() => {
    if (isRecast && drawState === 'idle') {
      setIsRecast(false);
      castHexagram(true);
    }
  }, [isRecast, drawState, castHexagram]);

  useEffect(() => {
    storageService.saveRecords(records);
  }, [records]);

  const handleSave = async () => {
    if (!result) return;
    const record: FortuneRecord = {
      id: generateId(),
      date: d,
      type: 'iching',
      title: `卦象 - ${result.hexagram.name}`,
      rawResult: result as unknown as Record<string, unknown>,
      aiAnalysis: aiAnalysis ?? undefined,
      savedAt: new Date().toISOString(),
    };
    addRecord(record);
    showToast('卦象运势已保存');
  };

  const handleAI = async () => {
    if (!result) return;
    if (!aiSettings.apiKey) {
      showToast('请先在设置页配置 API Key', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await analyzeFortune({
        type: 'iching',
        date: d,
        result: result as unknown as Record<string, unknown>,
        userProfile: {
          zodiacSign: profile.zodiacSign,
          birthDate: profile.birthDate,
          name: profile.name || '用户',
        },
        aiSettings,
      });
      setAiAnalysis(response.analysis);
      await saveAICache('iching', d, response.analysis);
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

  // ── IDLE ──
  if (drawState === 'idle') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.back} onPress={() => router.back()}>‹ 返回</Text>
            <Text style={styles.title}>☯️ 今日卦象</Text>
          </View>
          <View style={styles.idleContainer}>
            <Text style={styles.guideTitle}>诚心问卦</Text>
            <Text style={styles.guideText}>
              请在心中默念最想获得指引的问题{'\n'}
              准备好后，点击下方按钮抽取今日卦象
            </Text>
            <View style={styles.symbolCardEmpty}>
              <Text style={styles.symbolEmpty}>☯️</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <ActionButton title="抽取今日卦象" onPress={handleCast} icon="☯️" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── CASTING ──
  if (drawState === 'casting') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.back} onPress={() => router.back()}>‹ 返回</Text>
            <Text style={styles.title}>☯️ 起卦中...</Text>
          </View>
          <View style={styles.symbolCard}>
            <Text style={styles.symbolAnim}>☯️</Text>
            <Text style={styles.castingText}>正在推演卦象...</Text>
          </View>
          <View style={styles.actions}>
            <ActionButton title="起卦中..." onPress={() => {}} disabled loading />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── CAST ──
  const { hexagram } = result!;
  const shareHighlights = [
    { label: '卦名', value: hexagram.name },
    { label: '上卦', value: hexagram.upperTrigram },
    { label: '下卦', value: hexagram.lowerTrigram },
    { label: '卦辞', value: hexagram.judgment.substring(0, 40) + '...' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.back} onPress={() => router.back()}>‹ 返回</Text>
          <Text style={styles.title}>☯️ 今日卦象</Text>
          <Text style={styles.subtitle}>{formatDate(d)}</Text>
        </View>

        <View style={styles.symbolCard}>
          <Text style={styles.symbol}>{hexagram.symbol}</Text>
          <Text style={styles.hexName}>{hexagram.name}</Text>
          <View style={styles.trigramRow}>
            <Text style={styles.trigram}>上卦：{hexagram.upperTrigram}</Text>
            <Text style={styles.trigram}>下卦：{hexagram.lowerTrigram}</Text>
          </View>
        </View>

        <ResultSection title="卦辞">
          <Text style={styles.judgment}>{hexagram.judgment}</Text>
        </ResultSection>
        <ResultSection title="象意">
          <Text style={styles.content}>{hexagram.image}</Text>
        </ResultSection>
        <ResultSection title="今日事业">
          <Text style={styles.content}>{hexagram.career}</Text>
        </ResultSection>
        <ResultSection title="今日感情">
          <Text style={styles.content}>{hexagram.love}</Text>
        </ResultSection>
        <ResultSection title="今日财运">
          <Text style={styles.content}>{hexagram.wealth}</Text>
        </ResultSection>
        <ResultSection title="今日行动建议">
          <Text style={styles.content}>{hexagram.action}</Text>
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
          <ActionButton title="保存今日卦象" onPress={handleSave} variant="secondary" />
          <ActionButton title="重新起卦" onPress={handleRecast} variant="secondary" />
        </View>

        <ShareActions
          shareCard={
            <FortuneShareCard
              type="iching"
              title={hexagram.name}
              subtitle={hexagram.symbol}
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
  idleContainer: { alignItems: 'center', marginVertical: 24 },
  guideTitle: { color: '#e8e8f0', fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  guideText: { color: '#8888a8', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  symbolCardEmpty: {
    width: 140, height: 140, backgroundColor: '#1e1e3a', borderRadius: 70,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#C9A3D9',
  },
  symbolEmpty: { fontSize: 48 },
  symbolCard: { backgroundColor: '#1e1e3a', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 12 },
  symbol: { fontSize: 72, marginBottom: 12 },
  symbolAnim: { fontSize: 64, marginBottom: 12 },
  castingText: { color: '#aaaacc', fontSize: 14 },
  hexName: { color: '#e8e8f0', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  trigramRow: { flexDirection: 'row', gap: 16 },
  trigram: { color: '#8888a8', fontSize: 13 },
  judgment: { color: '#FFD700', fontSize: 15, lineHeight: 24, fontWeight: '500' },
  content: { color: '#ccccee', fontSize: 14, lineHeight: 22 },
  actions: { marginTop: 20, gap: 12 },
});
