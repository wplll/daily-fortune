import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Animated, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { ResultSection } from '../../src/components/ResultSection';
import { MarkdownView } from '../../src/components/MarkdownView';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { Toast } from '../../src/components/Toast';
import { ShareActions } from '../../src/components/ShareActions';
import { FortuneShareCard } from '../../src/components/FortuneShareCard';
import { generateTarot } from '../../src/services/fortuneGenerator';
import { analyzeFortune } from '../../src/services/aiService';
import { storageService } from '../../src/services/storageService';
import { loadHistory, saveHistory, addToHistory, deleteHistoryItem } from '../../src/services/tarotHistoryService';
import { useFortuneStore } from '../../src/store/fortuneStore';
import { useUserStore } from '../../src/store/userStore';
import { useAISettingsStore } from '../../src/store/aiSettingsStore';
import { today, formatDate } from '../../src/utils/date';
import { FortuneRecord, TarotResult, TarotHistoryItem, TarotCard, AppError } from '../../src/types/fortune';
import { majorArcana } from '../../src/data/tarotCards';
import { generateId } from '../../src/utils/random';

function getOrientationText(o: string): string {
  return o === 'upright' ? '正位 ↑' : '逆位 ↓';
}

function getOrientationColor(o: string): string {
  return o === 'upright' ? '#4CAF50' : '#FF9800';
}

function getCardById(id: number): TarotCard | undefined {
  return majorArcana.find((c) => c.id === id);
}

export default function TarotScreen() {
  const router = useRouter();
  const addRecord = useFortuneStore((s) => s.addRecord);
  const records = useFortuneStore((s) => s.records);
  const profile = useUserStore((s) => s.profile);
  const aiSettings = useAISettingsStore((s) => s.aiSettings);
  const d = today();

  // ── State ──
  const [question, setQuestion] = useState('');
  const [drawState, setDrawState] = useState<'input' | 'drawing' | 'result'>('input');
  const [result, setResult] = useState<TarotResult | null>(null);
  const [flipAnim] = useState(() => new Animated.Value(0));

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<TarotHistoryItem[]>([]);
  const [detailItem, setDetailItem] = useState<TarotHistoryItem | null>(null);

  const [tdVisible, setTdVisible] = useState(false);
  const [tdMessage, setTdMessage] = useState('');
  const [tdType, setTdType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setTdMessage(msg);
    setTdType(type);
    setTdVisible(true);
  };

  // ── Load history on mount ──
  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  // ── Draw ──
  const handleDraw = useCallback(() => {
    const q = question.trim();
    if (!q || drawState === 'drawing') return;

    setDrawState('drawing');

    Animated.sequence([
      Animated.timing(flipAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(400),
      Animated.timing(flipAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    setTimeout(async () => {
      const res = generateTarot(d, q);
      setResult(res.data);
      setDrawState('result');

      // Check if this question was already asked today — restore AI if cached
      const hist = await loadHistory();
      const existing = hist.find(
        (h) => h.date === d && h.question === q
      );
      setAiAnalysis(existing?.aiAnalysis || null);

      // Save to history
      const item: TarotHistoryItem = {
        id: generateId(),
        date: d,
        question: q,
        cardId: res.data.card.id,
        cardNameZh: res.data.card.nameZh,
        orientation: res.data.orientation,
        drawnAt: new Date().toISOString(),
      };
      const updatedHistory = await addToHistory(item);
      setHistory(updatedHistory);
    }, 600);
  }, [question, drawState, flipAnim, d]);

  // ── New question ──
  const handleNewQuestion = useCallback(() => {
    setQuestion('');
    setResult(null);
    setAiAnalysis(null);
    setDrawState('input');
    flipAnim.setValue(0);
    setDetailItem(null);
  }, [flipAnim]);

  // ── AI ──
  const handleAI = async () => {
    if (!result) return;
    if (!aiSettings.apiKey) {
      showToast('请先在设置页配置 API Key', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await analyzeFortune({
        type: 'tarot',
        date: d,
        result: { ...result, question: result.question } as unknown as Record<string, unknown>,
        userProfile: {
          zodiacSign: profile.zodiacSign,
          birthDate: profile.birthDate,
          name: profile.name || '用户',
        },
        aiSettings,
      });
      setAiAnalysis(response.analysis);

      // Update history item with AI analysis
      const all = await loadHistory();
      const merged = all.map((h) =>
        h.date === d && h.question === result.question
          ? { ...h, aiAnalysis: response.analysis }
          : h
      );
      setHistory(merged);
      await saveHistory(merged);

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

  // ── Save to fortune records ──
  const handleSave = async () => {
    if (!result) return;
    try {
      const record: FortuneRecord = {
        id: generateId(),
        date: d,
        type: 'tarot',
        title: `塔罗 - ${result.card.nameZh} - ${result.question}`,
        rawResult: result as unknown as Record<string, unknown>,
        aiAnalysis: aiAnalysis ?? undefined,
        savedAt: new Date().toISOString(),
      };
      addRecord(record);
      await storageService.saveRecords([...records, record]);
      showToast('已保存到日历记录');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '保存失败', 'error');
    }
  };

  // ── Delete history item ──
  const handleDeleteHistory = (id: string) => {
    Alert.alert('删除记录', '确定删除这条抽取记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteHistoryItem(id);
          setHistory(updated);
          if (detailItem?.id === id) setDetailItem(null);
        },
      },
    ]);
  };

  // ── Share ──
  const shareHighlights = result
    ? [
        { label: '问题', value: result.question },
        { label: '牌名', value: result.card.nameZh },
        { label: '方位', value: getOrientationText(result.orientation) },
        { label: '关键词', value: (result.orientation === 'upright'
          ? result.card.keywords : result.card.keywordsReversed).join('、') },
      ]
    : [];

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <Text style={s.backLink} onPress={() => router.back()}>‹ 返回</Text>
          <Text style={s.title}>🔮 塔罗占卜</Text>
          <Text style={s.subtitle}>{formatDate(d)}</Text>
        </View>

        {/* ── Question input (always visible) ── */}
        {drawState === 'input' && (
          <>
            <View style={s.questionCard}>
              <Text style={s.questionLabel}>请输入你想问的问题</Text>
              <TextInput
                style={s.questionInput}
                value={question}
                onChangeText={setQuestion}
                placeholder="例如：我今天的工作运势如何？"
                placeholderTextColor="#555"
                maxLength={100}
                multiline
                returnKeyType="done"
              />
              <Text style={s.questionHint}>
                同一个问题在同一天抽到的牌是相同的{'\n'}
                宇宙会根据你的问题给出对应的指引
              </Text>
            </View>

            <View style={s.actions}>
              <ActionButton
                title={question.trim() ? '抽取今日塔罗' : '请先输入问题'}
                onPress={handleDraw}
                icon="✨"
                disabled={!question.trim()}
              />
            </View>
          </>
        )}

        {/* ── Drawing animation ── */}
        {drawState === 'drawing' && (
          <>
            <View style={s.questionSummary}>
              <Text style={s.questionSummaryLabel}>你的问题</Text>
              <Text style={s.questionSummaryText}>{question}</Text>
            </View>
            <Animated.View style={[s.cardBackContainer, {
              transform: [{ rotateY: flipAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: ['0deg', '90deg', '0deg'],
              }) }],
            }]}>
              <View style={s.cardBack}>
                <Text style={s.cardBackSymbol}>🃏</Text>
                <Text style={s.cardBackText}>洗牌中...</Text>
              </View>
            </Animated.View>
            <View style={s.actions}>
              <ActionButton title="抽取中..." onPress={() => {}} disabled loading />
            </View>
          </>
        )}

        {/* ── Result ── */}
        {drawState === 'result' && result && (() => {
          const { card, orientation } = result;
          const isUpright = orientation === 'upright';
          const keywords = isUpright ? card.keywords : card.keywordsReversed;

          return (
            <>
              {/* Question badge */}
              <View style={s.questionSummary}>
                <Text style={s.questionSummaryLabel}>你的问题</Text>
                <Text style={s.questionSummaryText}>{result.question}</Text>
              </View>

              {/* Card display */}
              <View style={s.cardDisplay}>
                <View style={s.cardInner}>
                  <Text style={s.cardName}>{card.nameZh}</Text>
                  <Text style={s.cardNameEn}>{card.name}</Text>
                  <View style={[s.orientationBadge, { backgroundColor: getOrientationColor(orientation) }]}>
                    <Text style={s.orientationText}>{getOrientationText(orientation)}</Text>
                  </View>
                </View>
              </View>

              <ResultSection title="关键词">
                <View style={s.tagRow}>
                  {keywords.map((kw: string) => (
                    <View key={kw} style={s.tag}>
                      <Text style={s.tagText}>{kw}</Text>
                    </View>
                  ))}
                </View>
              </ResultSection>

              <ResultSection title="牌义解读">
                <Text style={s.content}>{isUpright ? card.meaning : card.meaningReversed}</Text>
              </ResultSection>
              <ResultSection title="爱情建议">
                <Text style={s.content}>{isUpright ? card.love : card.loveReversed}</Text>
              </ResultSection>
              <ResultSection title="事业建议">
                <Text style={s.content}>{isUpright ? card.career : card.careerReversed}</Text>
              </ResultSection>
              <ResultSection title="财运建议">
                <Text style={s.content}>{isUpright ? card.wealth : card.wealthReversed}</Text>
              </ResultSection>
              <ResultSection title="行动建议">
                <Text style={s.content}>{isUpright ? card.action : card.actionReversed}</Text>
              </ResultSection>

              {aiAnalysis && (
                <ResultSection title="AI 深度解读">
                  <MarkdownView content={aiAnalysis} />
                </ResultSection>
              )}

              <View style={s.actions}>
                <ActionButton
                  title={aiAnalysis ? '重新生成 AI 解读' : 'AI 深度解读'}
                  onPress={handleAI}
                  icon="✨"
                  disabled={loading}
                />
                <ActionButton title="保存到日历记录" onPress={handleSave} variant="secondary" />
                <ActionButton title="问一个新问题" onPress={handleNewQuestion} variant="secondary" />
              </View>

              <ShareActions
                shareCard={
                  <FortuneShareCard
                    type="tarot"
                    title={`${card.nameZh} - ${card.name}`}
                    subtitle={`Q: ${result.question}`}
                    date={formatDate(d)}
                    highlights={shareHighlights}
                    aiSummary={aiAnalysis?.substring(0, 120)}
                  />
                }
              />
            </>
          );
        })()}

        {/* ═══════════════════════════════════════════ */}
        {/* ── History ── */}
        {/* ═══════════════════════════════════════════ */}
        {history.length > 0 && (
          <>
            <Text style={s.sectionTitle}>历史抽取</Text>

            {history.map((item) => (
              <Pressable
                key={item.id}
                style={s.historyCard}
                onPress={() => setDetailItem(item)}
              >
                <View style={s.historyRow}>
                  <View style={s.historyInfo}>
                    <Text style={s.historyDate}>{item.date === d ? '今天' : item.date}</Text>
                    <Text style={s.historyQuestion} numberOfLines={1}>{item.question}</Text>
                    <View style={s.historyMeta}>
                      <Text style={s.historyCardName}>{item.cardNameZh}</Text>
                      <Text style={[s.historyOrientation, {
                        color: item.orientation === 'upright' ? '#4CAF50' : '#FF9800',
                      }]}>
                        {getOrientationText(item.orientation)}
                      </Text>
                      {item.aiAnalysis && <Text style={s.hasAIBadge}>AI</Text>}
                    </View>
                  </View>
                  <View style={s.historyActions}>
                    <Text style={s.viewArrow}>查看 ›</Text>
                    <Pressable
                      style={s.deleteBtn}
                      onPress={() => handleDeleteHistory(item.id)}
                      hitSlop={8}
                    >
                      <Text style={s.deleteText}>删除</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ── History Detail Modal ── */}
        {/* ═══════════════════════════════════════════ */}
        <Modal
          visible={detailItem !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setDetailItem(null)}
        >
          {detailItem && (() => {
            const item = detailItem;
            const card = getCardById(item.cardId);
            const isUpright = item.orientation === 'upright';

            return (
              <SafeAreaView style={s.modalContainer}>
                <View style={s.modalHeader}>
                  <Pressable onPress={() => setDetailItem(null)}>
                    <Text style={s.modalClose}>关闭</Text>
                  </Pressable>
                  <Text style={s.modalTitle}>历史详情</Text>
                  <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={s.modalScroll} showsVerticalScrollIndicator={false}>
                  {/* Card info */}
                  <View style={s.modalCard}>
                    <Text style={s.modalDate}>{item.date}</Text>
                    <Text style={s.modalQuestion}>{item.question}</Text>
                    <View style={s.modalCardRow}>
                      <Text style={s.modalCardName}>{item.cardNameZh}</Text>
                      <Text style={[s.modalOrientation, {
                        color: isUpright ? '#4CAF50' : '#FF9800',
                      }]}>
                        {getOrientationText(item.orientation)}
                      </Text>
                    </View>
                  </View>

                  {card && (
                    <>
                      <ResultSection title="牌义解读">
                        <Text style={s.content}>{isUpright ? card.meaning : card.meaningReversed}</Text>
                      </ResultSection>
                      <ResultSection title="爱情建议">
                        <Text style={s.content}>{isUpright ? card.love : card.loveReversed}</Text>
                      </ResultSection>
                      <ResultSection title="事业建议">
                        <Text style={s.content}>{isUpright ? card.career : card.careerReversed}</Text>
                      </ResultSection>
                      <ResultSection title="财运建议">
                        <Text style={s.content}>{isUpright ? card.wealth : card.wealthReversed}</Text>
                      </ResultSection>
                      <ResultSection title="行动建议">
                        <Text style={s.content}>{isUpright ? card.action : card.actionReversed}</Text>
                      </ResultSection>
                    </>
                  )}

                  {item.aiAnalysis && (
                    <ResultSection title="AI 深度解读">
                      <MarkdownView content={item.aiAnalysis} />
                    </ResultSection>
                  )}

                  {!item.aiAnalysis && (
                    <Text style={s.modalNoAI}>暂无 AI 解读</Text>
                  )}
                </ScrollView>
              </SafeAreaView>
            );
          })()}
        </Modal>

        <LoadingOverlay visible={loading} />
        <Toast visible={tdVisible} message={tdMessage} type={tdType} onHide={() => setTdVisible(false)} />
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══ Styles ═══
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12122a' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  backLink: { color: '#6C63FF', fontSize: 16, marginBottom: 8 },
  title: { color: '#e8e8f0', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#7777aa', fontSize: 14, marginTop: 4 },

  // Question input
  questionCard: {
    backgroundColor: '#1e1e3a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3a3a6a',
  },
  questionLabel: { color: '#e8e8f0', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  questionInput: {
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 14,
    color: '#e8e8f0',
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  questionHint: { color: '#555', fontSize: 12, marginTop: 10, lineHeight: 18, textAlign: 'center' },

  // Question summary (shown above card)
  questionSummary: {
    backgroundColor: '#1e1e3a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6C63FF',
  },
  questionSummaryLabel: { color: '#8888a8', fontSize: 11, marginBottom: 4 },
  questionSummaryText: { color: '#e8e8f0', fontSize: 15, fontWeight: '500' },

  // Card back / animation
  cardBackContainer: { alignItems: 'center', marginVertical: 12 },
  cardBack: {
    width: 140, height: 210, backgroundColor: '#2a1a5e', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#6C63FF',
  },
  cardBackSymbol: { fontSize: 48, marginBottom: 8 },
  cardBackText: { color: '#6C63FF', fontSize: 15, fontWeight: '600' },

  // Card result
  cardDisplay: {
    backgroundColor: '#1e1e3a', borderRadius: 16, padding: 28,
    alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#3a3a6a',
  },
  cardInner: { alignItems: 'center' },
  cardName: { color: '#e8e8f0', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  cardNameEn: { color: '#8888a8', fontSize: 14, marginBottom: 12 },
  orientationBadge: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 4 },
  orientationText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#6C63FF20', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: '#ccccee', fontSize: 13 },
  content: { color: '#ccccee', fontSize: 14, lineHeight: 22 },
  actions: { marginTop: 20, gap: 12 },

  // History
  sectionTitle: {
    color: '#8888aa', fontSize: 13, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 28, marginBottom: 10,
  },
  historyCard: {
    backgroundColor: '#1e1e3a', borderRadius: 14, padding: 14, marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  historyInfo: { flex: 1, marginRight: 12 },
  historyDate: { color: '#666', fontSize: 11, marginBottom: 2 },
  historyQuestion: { color: '#ccccee', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  historyMeta: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  historyCardName: { color: '#e8e8f0', fontSize: 13, fontWeight: '600' },
  historyOrientation: { fontSize: 12, fontWeight: '600' },
  hasAIBadge: {
    color: '#FFD700', fontSize: 10, fontWeight: '700',
    backgroundColor: '#FFD70020', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1,
  },
  historyActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  viewArrow: { color: '#6C63FF', fontSize: 13 },
  deleteBtn: {
    backgroundColor: '#e74c3c15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  deleteText: { color: '#e74c3c88', fontSize: 12 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#12122a' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#2a2a4a',
  },
  modalClose: { color: '#6C63FF', fontSize: 15 },
  modalTitle: { color: '#e8e8f0', fontSize: 16, fontWeight: '600' },
  modalScroll: { padding: 20, paddingBottom: 40 },
  modalCard: {
    backgroundColor: '#1e1e3a', borderRadius: 16, padding: 20, marginBottom: 12,
    borderWidth: 1, borderColor: '#3a3a6a',
  },
  modalDate: { color: '#666', fontSize: 12, marginBottom: 8 },
  modalQuestion: { color: '#e8e8f0', fontSize: 17, fontWeight: '600', marginBottom: 12, lineHeight: 24 },
  modalCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalCardName: { color: '#e8e8f0', fontSize: 16, fontWeight: '700' },
  modalOrientation: { fontSize: 14, fontWeight: '600' },
  modalNoAI: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 20 },
});
