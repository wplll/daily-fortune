import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { ResultSection, ResultRow } from '../../src/components/ResultSection';
import { MarkdownView } from '../../src/components/MarkdownView';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { Toast } from '../../src/components/Toast';
import { ShareActions } from '../../src/components/ShareActions';
import { FortuneShareCard } from '../../src/components/FortuneShareCard';
import { analyzeFortune } from '../../src/services/aiService';
import { getAlmanacByDate, refreshAlmanac } from '../../src/services/almanacService';
import { storageService } from '../../src/services/storageService';
import { loadAICache, saveAICache } from '../../src/services/aiCacheService';
import { useFortuneStore } from '../../src/store/fortuneStore';
import { useUserStore } from '../../src/store/userStore';
import { useAISettingsStore } from '../../src/store/aiSettingsStore';
import { today, formatDate } from '../../src/utils/date';
import { FortuneRecord, AlmanacResult, AppError } from '../../src/types/fortune';
import { useAlmanacSettingsStore } from '../../src/store/almanacSettingsStore';
import { generateId } from '../../src/utils/random';

export default function AlmanacScreen() {
  const router = useRouter();
  const addRecord = useFortuneStore((s) => s.addRecord);
  const records = useFortuneStore((s) => s.records);
  const profile = useUserStore((s) => s.profile);
  const aiSettings = useAISettingsStore((s) => s.aiSettings);
  const almanacSettings = useAlmanacSettingsStore((s) => s.settings);

  const [data, setData] = useState<AlmanacResult | null>(null);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const d = today();
  const [tdVisible, setTdVisible] = useState(false);
  const [tdMessage, setTdMessage] = useState('');
  const [tdType, setTdType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setTdMessage(msg);
    setTdType(type);
    setTdVisible(true);
  };

  const loadAlmanac = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const result = await getAlmanacByDate(d, almanacSettings);
      setData(result);
      const cached = await loadAICache('almanac', d);
      if (cached) setAiAnalysis(cached);
    } catch {
      setFetchError('加载失败');
    } finally {
      setFetching(false);
    }
  }, [almanacSettings]);

  useEffect(() => { loadAlmanac(); }, [loadAlmanac]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await refreshAlmanac(d, almanacSettings);
      setData(result);
      showToast('已刷新');
    } catch {
      showToast('刷新失败，使用缓存数据', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;
    const record: FortuneRecord = {
      id: generateId(),
      date: d,
      type: 'almanac',
      title: `黄历 - ${formatDate(d)}`,
      rawResult: data as unknown as Record<string, unknown>,
      aiAnalysis: aiAnalysis ?? undefined,
      savedAt: new Date().toISOString(),
    };
    addRecord(record);
    await storageService.saveRecords(records);
    showToast('黄历运势已保存');
  };

  const handleAI = async () => {
    if (!data) return;
    if (!aiSettings.apiKey) {
      showToast('请先在设置页配置 API Key', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await analyzeFortune({
        type: 'almanac',
        date: d,
        result: data as unknown as Record<string, unknown>,
        userProfile: {
          zodiacSign: profile.zodiacSign,
          birthDate: profile.birthDate,
          name: profile.name || '用户',
        },
        aiSettings,
      });
      setAiAnalysis(response.analysis);
      await saveAICache('almanac', d, response.analysis);
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

  // Loading state
  if (fetching || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>加载黄历数据...</Text>
          {fetchError && <Text style={styles.errorText}>{fetchError}</Text>}
        </View>
      </SafeAreaView>
    );
  }

  const isFromAPI = data.source === 'api';
  const sourceLabel = almanacSettings.provider === 'apihz' ? 'apihz.cn' : data.source;

  const shareHighlights = [
    { label: '农历', value: data.lunarDate },
    ...(data.ganzhiYear ? [{ label: '干支年', value: data.ganzhiYear }] : []),
    ...(data.shengxiao ? [{ label: '生肖', value: data.shengxiao }] : []),
    { label: '冲煞', value: data.clash },
    ...(data.xingxiu ? [{ label: '星宿', value: data.xingxiu }] : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.backLink} onPress={() => router.back()}>‹ 返回</Text>
          <View style={styles.headerRow}>
            <Text style={styles.title}>📅 今日黄历</Text>
            <Text style={[styles.sourceBadge, { color: isFromAPI ? '#4CAF50' : '#888' }]}>
              {sourceLabel}
            </Text>
          </View>
          <Text style={styles.subtitle}>{formatDate(d)}</Text>
        </View>

        {/* Basic info: lunar, ganzhi, weekday, shengxiao, xingzuo */}
        <ResultSection title="基本信息">
          <ResultRow label="农历" value={data.lunarDate} />
          {data.weekday && <ResultRow label="星期" value={data.weekday} />}
          {data.ganzhiYear && <ResultRow label="年干支" value={data.ganzhiYear} />}
          {data.ganzhiMonth && <ResultRow label="月干支" value={data.ganzhiMonth} />}
          {data.ganzhiDay && <ResultRow label="日干支" value={data.ganzhiDay} />}
          {data.shengxiao && <ResultRow label="生肖" value={data.shengxiao} />}
          {data.constellation && <ResultRow label="星座" value={data.constellation} />}
          {data.season && <ResultRow label="季节" value={data.season} />}
          <ResultRow label="相冲" value={data.clash} />
        </ResultSection>

        {/* Holidays */}
        {data.holidays && data.holidays.length > 0 && (
          <ResultSection title="节日">
            <View style={styles.tagRow}>
              {data.holidays.map((h: string) => (
                <View key={h} style={[styles.tag, styles.tagHoliday]}>
                  <Text style={styles.tagText}>{h}</Text>
                </View>
              ))}
            </View>
          </ResultSection>
        )}

        {/* Wu Xing */}
        {(data.yearWuxing || data.monthWuxing || data.dayWuxing) && (
          <ResultSection title="五行">
            {data.yearWuxing && <ResultRow label="年五行" value={data.yearWuxing} />}
            {data.monthWuxing && <ResultRow label="月五行" value={data.monthWuxing} />}
            {data.dayWuxing && <ResultRow label="日五行" value={data.dayWuxing} />}
          </ResultSection>
        )}

        {/* Suitable / Unsuitable */}
        <ResultSection title="宜">
          <View style={styles.tagRow}>
            {data.suitable.map((s: string) => (
              <View key={s} style={[styles.tag, styles.tagGood]}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
          </View>
        </ResultSection>

        <ResultSection title="忌">
          <View style={styles.tagRow}>
            {data.unsuitable.map((s: string) => (
              <View key={s} style={[styles.tag, styles.tagBad]}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
          </View>
        </ResultSection>

        {/* Astrology extras from API */}
        {(data.xingxiu || data.liuyao || data.shiershen) && (
          <ResultSection title="星神">
            {data.xingxiu && <ResultRow label="星宿" value={data.xingxiu} />}
            {data.liuyao && <ResultRow label="六曜" value={data.liuyao} />}
            {data.shiershen && <ResultRow label="十二神" value={data.shiershen} />}
          </ResultSection>
        )}

        {/* Pengzu & Taishen */}
        {(data.pengzu || data.taishen) && (
          <ResultSection title="禁忌">
            {data.pengzu && <ResultRow label="彭祖百忌" value={data.pengzu} />}
            {data.taishen && <ResultRow label="胎神占方" value={data.taishen} />}
          </ResultSection>
        )}

        {/* Solar terms */}
        {(data.jieqi || data.jieqiMsg) && (
          <ResultSection title="节气">
            {data.jieqi && <ResultRow label="节气" value={data.jieqi} />}
            {data.jieqiMsg && <ResultRow label="说明" value={data.jieqiMsg} />}
          </ResultSection>
        )}

        {/* Advice (from fallback) or from API if available */}
        {data.advice ? (
          <ResultSection title="今日建议">
            <Text style={styles.advice}>{data.advice}</Text>
          </ResultSection>
        ) : null}

        {/* Lucky hints */}
        {(data.luckyColor || data.luckyNumber > 0 || data.wealthDirection || data.joyDirection) ? (
          <ResultSection title="幸运提示">
            {data.wealthDirection ? <ResultRow label="财神方位" value={data.wealthDirection} /> : null}
            {data.joyDirection ? <ResultRow label="喜神方位" value={data.joyDirection} /> : null}
            {data.luckyColor ? <ResultRow label="幸运颜色" value={data.luckyColor} /> : null}
            {data.luckyNumber > 0 ? <ResultRow label="幸运数字" value={String(data.luckyNumber)} /> : null}
          </ResultSection>
        ) : null}

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
          <ActionButton title="保存今日黄历" onPress={handleSave} variant="secondary" />
          <ActionButton title="刷新数据" onPress={handleRefresh} variant="secondary" loading={refreshing} />
        </View>

        <ShareActions
          shareCard={
            <FortuneShareCard
              type="almanac"
              title="今日黄历"
              subtitle={data.lunarDate}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#888', fontSize: 14 },
  errorText: { color: '#e74c3c', fontSize: 13 },
  header: { marginBottom: 20 },
  backLink: { color: '#6C63FF', fontSize: 16, marginBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: '#e8e8f0', fontSize: 24, fontWeight: '700' },
  sourceBadge: { fontSize: 11, fontWeight: '600' },
  subtitle: { color: '#7777aa', fontSize: 14, marginTop: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  tagGood: { backgroundColor: '#4CAF5030' },
  tagBad: { backgroundColor: '#e74c3c30' },
  tagHoliday: { backgroundColor: '#FFD70020' },
  tagText: { color: '#e8e8f0', fontSize: 13 },
  advice: { color: '#ccccee', fontSize: 14, lineHeight: 22 },
  aiText: { color: '#ccccee', fontSize: 14, lineHeight: 24 },
  actions: { marginTop: 20, gap: 12 },
});
