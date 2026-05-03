import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { getZodiacSigns } from '../../src/data/zodiacData';
import { testAIConnection } from '../../src/services/aiService';
import { testAlmanacConnection } from '../../src/services/almanacService';
import { storageService } from '../../src/services/storageService';
import { useFortuneStore } from '../../src/store/fortuneStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { AIProvider, DEFAULT_AI_SETTINGS } from '../../src/types/settings';
import { AppError, ZodiacSign } from '../../src/types/fortune';

const ALL_SIGNS = getZodiacSigns();
const MODEL_OPTIONS = ['deepseek-v4-flash', 'deepseek-v4-pro', '自定义'];

function getUserMessage(error: unknown): string {
  if (error instanceof AppError) return error.userMessage;
  if (typeof error === 'object' && error !== null && 'userMessage' in error) {
    const userMessage = (error as { userMessage?: unknown }).userMessage;
    if (typeof userMessage === 'string') return userMessage;
  }
  return '操作失败，请稍后重试';
}

export default function SettingsScreen() {
  const router = useRouter();

  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const clearAll = useFortuneStore((s) => s.clearAll);

  const aiSettings = useSettingsStore((s) => s.aiSettings);
  const setAISettings = useSettingsStore((s) => s.setAISettings);
  const saveAISettings = useSettingsStore((s) => s.saveAISettings);
  const almanacSettings = useSettingsStore((s) => s.almanacSettings);
  const setAlmanacSettings = useSettingsStore((s) => s.setAlmanacSettings);
  const saveAlmanacSettings = useSettingsStore((s) => s.saveAlmanacSettings);

  const [name, setName] = useState(profile.name);
  const [birthDate, setBirthDate] = useState(profile.birthDate);
  const [showSignPicker, setShowSignPicker] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAlmanacKey, setShowAlmanacKey] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showProviderPicker, setShowProviderPicker] = useState(false);
  const [testingAI, setTestingAI] = useState(false);
  const [testingAlmanac, setTestingAlmanac] = useState(false);

  const handleSaveProfile = async () => {
    const next = { name: name.trim(), zodiacSign: profile.zodiacSign, birthDate: birthDate.trim() };
    setProfile(next);
    await storageService.saveProfile(next as unknown as Record<string, unknown>);
    Alert.alert('保存成功', '个人信息已更新');
  };

  const handleSelectSign = (sign: ZodiacSign) => {
    setProfile({ zodiacSign: sign });
    setShowSignPicker(false);
  };

  const handleSaveAI = async () => {
    const next = {
      ...aiSettings,
      baseURL: aiSettings.baseURL.trim(),
      model: aiSettings.model.trim() || DEFAULT_AI_SETTINGS.model,
      apiKey: aiSettings.apiKey.trim(),
    };
    setAISettings(next);
    await saveAISettings(next);
    Alert.alert('保存成功', 'AI 模型设置已保存');
  };

  const handleTestAI = async () => {
    setTestingAI(true);
    try {
      await testAIConnection({
        ...aiSettings,
        baseURL: aiSettings.baseURL.trim(),
        model: aiSettings.model.trim(),
        apiKey: aiSettings.apiKey.trim(),
      });
      Alert.alert('AI 连接成功', 'AI 连接成功');
    } catch (error: unknown) {
      Alert.alert('连接失败', getUserMessage(error));
    } finally {
      setTestingAI(false);
    }
  };

  const handleClearAPIKey = async () => {
    const next = { ...aiSettings, apiKey: '' };
    setAISettings({ apiKey: '' });
    await saveAISettings(next);
    Alert.alert('已清除', 'API Key 已从本机设置中清除');
  };

  const handleSaveAlmanac = async () => {
    const next = {
      ...almanacSettings,
      endpoint: almanacSettings.endpoint.trim(),
      apiKey: almanacSettings.apiKey?.trim() ?? '',
    };
    setAlmanacSettings(next);
    await saveAlmanacSettings(next);
    Alert.alert('保存成功', '黄历 API 设置已保存');
  };

  const handleTestAlmanac = async () => {
    setTestingAlmanac(true);
    try {
      await testAlmanacConnection({
        ...almanacSettings,
        endpoint: almanacSettings.endpoint.trim(),
        apiKey: almanacSettings.apiKey?.trim() ?? '',
      });
      Alert.alert('黄历 API 连接成功', '黄历 API 连接成功');
    } catch (error: unknown) {
      Alert.alert('连接失败', getUserMessage(error));
    } finally {
      setTestingAlmanac(false);
    }
  };

  const handleClearAlmanac = async () => {
    const next = { enabled: false, provider: 'fallback' as const, endpoint: '', apiKey: '' };
    setAlmanacSettings(next);
    await saveAlmanacSettings(next);
    Alert.alert('已清除', '黄历 API 配置已清除，将使用本地 fallback 数据');
  };

  const handleClearAll = () => {
    Alert.alert('清空所有记录', '此操作会清空本机保存的运势记录和设置，确定继续吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定清空',
        style: 'destructive',
        onPress: async () => {
          clearAll();
          await storageService.clearAll();
          Alert.alert('已清空', '本机数据已清空');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.back} onPress={() => router.back()}>返回</Text>
          <Text style={styles.title}>设置</Text>
        </View>

        <Text style={styles.sectionLabel}>个人信息</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>昵称</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="请输入昵称" placeholderTextColor="#777" maxLength={20} />

          <Text style={styles.fieldLabel}>星座</Text>
          <Pressable style={styles.picker} onPress={() => setShowSignPicker((v) => !v)}>
            <Text style={styles.pickerText}>{profile.zodiacSign}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </Pressable>
          {showSignPicker && (
            <View style={styles.signGrid}>
              {ALL_SIGNS.map((sign) => (
                <Pressable key={sign} style={[styles.signItem, sign === profile.zodiacSign && styles.signItemActive]} onPress={() => handleSelectSign(sign)}>
                  <Text style={[styles.signText, sign === profile.zodiacSign && styles.signTextActive]}>{sign}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.fieldLabel}>出生日期（可选）</Text>
          <TextInput style={styles.input} value={birthDate} onChangeText={setBirthDate} placeholder="例如：1998-01-01" placeholderTextColor="#777" maxLength={10} />
          <ActionButton title="保存个人信息" onPress={handleSaveProfile} />
        </View>

        <Text style={styles.sectionLabel}>AI 模型设置</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>启用 AI 解读</Text>
            <Switch value={aiSettings.enabled} onValueChange={(enabled) => setAISettings({ enabled })} trackColor={{ false: '#444', true: '#6C63FF' }} thumbColor="#fff" />
          </View>

          <Text style={styles.fieldLabel}>API Provider</Text>
          <Pressable style={styles.picker} onPress={() => setShowProviderPicker((v) => !v)}>
            <Text style={styles.pickerText}>{aiSettings.provider === 'deepseek' ? 'DeepSeek' : 'Custom OpenAI Compatible'}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </Pressable>
          {showProviderPicker && (
            <View style={styles.optionsList}>
              {(['deepseek', 'openai-compatible'] as AIProvider[]).map((provider) => (
                <Pressable key={provider} style={[styles.optionItem, provider === aiSettings.provider && styles.optionItemActive]} onPress={() => { setAISettings({ provider }); setShowProviderPicker(false); }}>
                  <Text style={[styles.optionText, provider === aiSettings.provider && styles.optionTextActive]}>{provider === 'deepseek' ? 'DeepSeek' : 'Custom OpenAI Compatible'}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.fieldLabel}>API Base URL</Text>
          <TextInput style={styles.input} value={aiSettings.baseURL} onChangeText={(baseURL) => setAISettings({ baseURL })} placeholder="https://api.deepseek.com" placeholderTextColor="#777" autoCapitalize="none" />

          <Text style={styles.fieldLabel}>模型名称</Text>
          <Pressable style={styles.picker} onPress={() => setShowModelPicker((v) => !v)}>
            <Text style={styles.pickerText}>{aiSettings.model || '请输入模型名称'}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </Pressable>
          {showModelPicker && (
            <View style={styles.optionsList}>
              {MODEL_OPTIONS.map((model) => (
                <Pressable key={model} style={styles.optionItem} onPress={() => { setAISettings({ model: model === '自定义' ? '' : model }); setShowModelPicker(false); }}>
                  <Text style={styles.optionText}>{model}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <TextInput style={styles.input} value={aiSettings.model} onChangeText={(model) => setAISettings({ model })} placeholder="deepseek-v4-flash" placeholderTextColor="#777" autoCapitalize="none" />

          <Text style={styles.fieldLabel}>API Key</Text>
          <View style={styles.apiKeyRow}>
            <TextInput style={[styles.input, styles.apiKeyInput]} value={aiSettings.apiKey} onChangeText={(apiKey) => setAISettings({ apiKey })} placeholder="sk-..." placeholderTextColor="#777" secureTextEntry={!showApiKey} autoCapitalize="none" />
            <Pressable style={styles.toggleBtn} onPress={() => setShowApiKey((v) => !v)}>
              <Text style={styles.toggleBtnText}>{showApiKey ? '隐藏' : '显示'}</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>API Key 仅保存在本机，用于从 App 直接请求 AI 服务。请不要分享你的 APK 配置数据。</Text>

          <View style={styles.actions}>
            <ActionButton title="保存设置" onPress={handleSaveAI} />
            <ActionButton title="测试连接" onPress={handleTestAI} variant="secondary" loading={testingAI} />
            <ActionButton title="清除 API Key" onPress={handleClearAPIKey} variant="danger" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>黄历 API 设置</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>启用真实黄历 API</Text>
            <Switch
              value={almanacSettings.enabled}
              onValueChange={(enabled) => setAlmanacSettings({ enabled, provider: enabled ? 'custom' : 'fallback' })}
              trackColor={{ false: '#444', true: '#6C63FF' }}
              thumbColor="#fff"
            />
          </View>

          <Text style={styles.fieldLabel}>API Endpoint</Text>
          <TextInput style={styles.input} value={almanacSettings.endpoint} onChangeText={(endpoint) => setAlmanacSettings({ endpoint, provider: 'custom' })} placeholder="https://your-api.example.com/almanac" placeholderTextColor="#777" autoCapitalize="none" />

          <Text style={styles.fieldLabel}>API Key（可选）</Text>
          <View style={styles.apiKeyRow}>
            <TextInput style={[styles.input, styles.apiKeyInput]} value={almanacSettings.apiKey ?? ''} onChangeText={(apiKey) => setAlmanacSettings({ apiKey })} placeholder="Bearer token" placeholderTextColor="#777" secureTextEntry={!showAlmanacKey} autoCapitalize="none" />
            <Pressable style={styles.toggleBtn} onPress={() => setShowAlmanacKey((v) => !v)}>
              <Text style={styles.toggleBtnText}>{showAlmanacKey ? '隐藏' : '显示'}</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>App 会按 {'{endpoint}?date=YYYY-MM-DD'} 请求数据；失败时自动使用本地 fallback 数据。</Text>

          <View style={styles.actions}>
            <ActionButton title="保存黄历 API 设置" onPress={handleSaveAlmanac} />
            <ActionButton title="测试黄历 API" onPress={handleTestAlmanac} variant="secondary" loading={testingAlmanac} />
            <ActionButton title="清除黄历 API 配置" onPress={handleClearAlmanac} variant="danger" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>数据管理</Text>
        <View style={styles.card}>
          <ActionButton title="清空所有本机数据" onPress={handleClearAll} variant="danger" />
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>安全说明</Text>
          <Text style={styles.disclaimerText}>
            纯客户端模式下，用户自己的 API Key 会存储在本机。此架构适合个人使用或轻量分发。如果要做商业化产品，建议恢复后端代理或用户账号体系，以便更好地保护密钥和控制成本。
          </Text>
        </View>
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
  sectionLabel: { color: '#8888aa', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 8 },
  card: { backgroundColor: '#1e1e3a', borderRadius: 12, padding: 16 },
  fieldLabel: { color: '#aaaacc', fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#2a2a4a', borderRadius: 10, padding: 12, color: '#e8e8f0', fontSize: 15, marginBottom: 6 },
  hint: { color: '#8888a8', fontSize: 12, lineHeight: 18, marginTop: 8 },
  picker: { backgroundColor: '#2a2a4a', borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  pickerText: { color: '#e8e8f0', fontSize: 15, flex: 1 },
  pickerArrow: { color: '#888', fontSize: 12 },
  signGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 12 },
  signItem: { width: '30%', paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#2a2a4a' },
  signItemActive: { backgroundColor: '#6C63FF' },
  signText: { color: '#aaa', fontSize: 12 },
  signTextActive: { color: '#fff', fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionsList: { backgroundColor: '#2a2a4a', borderRadius: 10, padding: 4, marginBottom: 8 },
  optionItem: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  optionItemActive: { backgroundColor: '#6C63FF' },
  optionText: { color: '#ccccee', fontSize: 14 },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  apiKeyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  apiKeyInput: { flex: 1 },
  toggleBtn: { backgroundColor: '#2a2a4a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center' },
  toggleBtnText: { color: '#6C63FF', fontSize: 13 },
  actions: { marginTop: 16, gap: 10 },
  disclaimerBox: { marginTop: 24, padding: 16, backgroundColor: '#1a1a2e', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a5a' },
  disclaimerTitle: { color: '#ccccdd', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  disclaimerText: { color: '#8888a8', fontSize: 12, lineHeight: 20 },
});
