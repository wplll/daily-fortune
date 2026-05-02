import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { useUserStore } from '../../src/store/userStore';
import { useFortuneStore } from '../../src/store/fortuneStore';
import { useAISettingsStore } from '../../src/store/aiSettingsStore';
import { useAlmanacSettingsStore } from '../../src/store/almanacSettingsStore';
import { storageService } from '../../src/services/storageService';
import { testAIConnection } from '../../src/services/aiService';
import { AIProvider, ZodiacSign, AppError } from '../../src/types/fortune';
import { getZodiacSigns } from '../../src/data/zodiacData';

const ALL_SIGNS = getZodiacSigns();
const MODEL_OPTIONS = ['deepseek-v4-flash', 'deepseek-v4-pro'];

export default function SettingsScreen() {
  const router = useRouter();

  // Profile
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const [name, setName] = useState(profile.name);
  const [birthDate, setBirthDate] = useState(profile.birthDate);
  const [showSignPicker, setShowSignPicker] = useState(false);

  // AI Settings
  const aiSettings = useAISettingsStore((s) => s.aiSettings);
  const setAISettings = useAISettingsStore((s) => s.setAISettings);
  const resetAISettings = useAISettingsStore((s) => s.resetAISettings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [customModel, setCustomModel] = useState(aiSettings.model);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showProviderPicker, setShowProviderPicker] = useState(false);

  // Backend
  const backendSettings = useAISettingsStore((s) => s.backendSettings);
  const setBackendSettings = useAISettingsStore((s) => s.setBackendSettings);

  // Almanac
  const almanacSettings = useAlmanacSettingsStore((s) => s.settings);
  const setAlmanacSettings = useAlmanacSettingsStore((s) => s.setSettings);
  const [showAlmanacProvider, setShowAlmanacProvider] = useState(false);

  // Clear data
  const clearAll = useFortuneStore((s) => s.clearAll);

  // ── Handlers ──

  const handleSaveProfile = async () => {
    const newProfile = { name: name.trim(), zodiacSign: profile.zodiacSign, birthDate: birthDate.trim() };
    setProfile(newProfile);
    await storageService.saveProfile(newProfile as unknown as Record<string, unknown>);
    Alert.alert('保存成功', '个人信息已更新');
  };

  const handleSelectSign = (sign: ZodiacSign) => {
    setProfile({ zodiacSign: sign });
    setShowSignPicker(false);
  };

  const handleSaveAI = async () => {
    const updated = { ...aiSettings, model: customModel || aiSettings.model };
    setAISettings(updated);
    await storageService.saveAISettings(updated);
    Alert.alert('保存成功', 'AI 设置已更新');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const msg = await testAIConnection({
        provider: aiSettings.provider,
        baseURL: aiSettings.baseURL,
        model: customModel || aiSettings.model,
        apiKey: aiSettings.apiKey,
      });
      Alert.alert('连接成功', msg);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        Alert.alert('连接失败', err.userMessage);
      } else {
        Alert.alert('连接失败', err instanceof Error ? err.message : '未知错误');
      }
    } finally {
      setTesting(false);
    }
  };

  const handleClearAPIKey = () => {
    Alert.alert('清除 API Key', '确定要清除已保存的 API Key 吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清除',
        style: 'destructive',
        onPress: () => {
          setAISettings({ apiKey: '' });
          storageService.saveAISettings({ ...aiSettings, apiKey: '' });
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('清空所有记录', '此操作将删除所有保存的运势记录，且不可恢复。确定继续吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定清空',
        style: 'destructive',
        onPress: async () => {
          clearAll();
          await storageService.clearAll();
          Alert.alert('已清空', '所有历史记录已被删除');
        },
      },
    ]);
  };

  const handleSaveBackend = async () => {
    await storageService.saveBackendSettings(backendSettings);
    Alert.alert('保存成功', '后端地址已更新');
  };

  const handleSaveAlmanac = async () => {
    await storageService.saveAlmanacSettings(almanacSettings);
    Alert.alert('保存成功', '黄历 API 设置已更新');
  };

  // ── Render ──

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.back} onPress={() => router.back()}>‹ 返回</Text>
          <Text style={styles.title}>⚙️ 设置</Text>
        </View>

        {/* ======== PROFILE ======== */}
        <Text style={styles.sectionLabel}>个人信息</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>昵称</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="请输入你的昵称" placeholderTextColor="#555" maxLength={20} />
          <Text style={styles.fieldLabel}>星座</Text>
          <Pressable style={styles.picker} onPress={() => setShowSignPicker(!showSignPicker)}>
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
          <TextInput style={styles.input} value={birthDate} onChangeText={setBirthDate} placeholder="如：1998-01-01" placeholderTextColor="#555" maxLength={10} />
          <ActionButton title="保存个人信息" onPress={handleSaveProfile} />
        </View>

        {/* ======== BACKEND ======== */}
        <Text style={styles.sectionLabel}>后端代理设置</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>后端 API 地址</Text>
          <TextInput
            style={styles.input}
            value={backendSettings.apiBaseURL}
            onChangeText={(v) => setBackendSettings({ apiBaseURL: v })}
            placeholder="http://localhost:3001"
            placeholderTextColor="#555"
            autoCapitalize="none"
          />
          <Text style={styles.hint}>Android 模拟器使用 http://10.0.2.2:3001{'\n'}iOS 模拟器使用 http://localhost:3001{'\n'}真机使用电脑局域网 IP:3001</Text>
          <ActionButton title="保存后端地址" onPress={handleSaveBackend} variant="secondary" />
        </View>

        {/* ======== AI MODEL ======== */}
        <Text style={styles.sectionLabel}>AI 模型设置</Text>
        <View style={styles.card}>
          {/* Enable toggle */}
          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>启用 AI 解读</Text>
            <Switch
              value={aiSettings.enabled}
              onValueChange={(v) => setAISettings({ enabled: v })}
              trackColor={{ false: '#444', true: '#6C63FF' }}
              thumbColor="#fff"
            />
          </View>

          {/* Provider */}
          <Text style={styles.fieldLabel}>API Provider</Text>
          <Pressable style={styles.picker} onPress={() => setShowProviderPicker(!showProviderPicker)}>
            <Text style={styles.pickerText}>{aiSettings.provider === 'deepseek' ? 'DeepSeek' : 'Custom OpenAI Compatible'}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </Pressable>
          {showProviderPicker && (
            <View style={styles.optionsList}>
              {(['deepseek', 'openai-compatible'] as AIProvider[]).map((p) => (
                <Pressable key={p} style={[styles.optionItem, p === aiSettings.provider && styles.optionItemActive]} onPress={() => { setAISettings({ provider: p }); setShowProviderPicker(false); }}>
                  <Text style={[styles.optionText, p === aiSettings.provider && styles.optionTextActive]}>{p === 'deepseek' ? 'DeepSeek' : 'Custom OpenAI Compatible'}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Base URL */}
          <Text style={styles.fieldLabel}>API Base URL</Text>
          <TextInput
            style={styles.input}
            value={aiSettings.baseURL}
            onChangeText={(v) => setAISettings({ baseURL: v })}
            placeholder="https://api.deepseek.com"
            placeholderTextColor="#555"
            autoCapitalize="none"
          />

          {/* Model */}
          <Text style={styles.fieldLabel}>模型名称</Text>
          <Pressable style={styles.picker} onPress={() => setShowModelPicker(!showModelPicker)}>
            <Text style={styles.pickerText}>{customModel || aiSettings.model}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </Pressable>
          {showModelPicker && (
            <View style={styles.optionsList}>
              {[...MODEL_OPTIONS, '自定义输入'].map((m) => (
                <Pressable key={m} style={[styles.optionItem, m === (customModel || aiSettings.model) && styles.optionItemActive]} onPress={() => {
                  if (m === '自定义输入') {
                    setCustomModel('');
                    setShowModelPicker(false);
                  } else {
                    setCustomModel(m);
                    setShowModelPicker(false);
                  }
                }}>
                  <Text style={[styles.optionText, m === (customModel || aiSettings.model) && styles.optionTextActive]}>{m}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {customModel !== '' && (
            <TextInput
              style={styles.input}
              value={customModel}
              onChangeText={setCustomModel}
              placeholder="输入自定义模型名称"
              placeholderTextColor="#555"
              autoCapitalize="none"
            />
          )}

          {/* API Key */}
          <Text style={styles.fieldLabel}>API Key</Text>
          <View style={styles.apiKeyRow}>
            <TextInput
              style={[styles.input, styles.apiKeyInput]}
              value={aiSettings.apiKey}
              onChangeText={(v) => setAISettings({ apiKey: v })}
              placeholder="sk-..."
              placeholderTextColor="#555"
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
            />
            <Pressable style={styles.toggleBtn} onPress={() => setShowApiKey(!showApiKey)}>
              <Text style={styles.toggleBtnText}>{showApiKey ? '隐藏' : '显示'}</Text>
            </Pressable>
          </View>

          <View style={styles.aiActions}>
            <ActionButton title="保存 AI 设置" onPress={handleSaveAI} />
            <ActionButton title="测试连接" onPress={handleTestConnection} variant="secondary" loading={testing} />
            <ActionButton title="清除 API Key" onPress={handleClearAPIKey} variant="danger" />
          </View>
        </View>

        {/* ======== ALMANAC API ======== */}
        <Text style={styles.sectionLabel}>黄历 API 设置</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>启用真实黄历 API</Text>
            <Switch
              value={almanacSettings.enabled}
              onValueChange={(v) => setAlmanacSettings({ enabled: v })}
              trackColor={{ false: '#444', true: '#6C63FF' }}
              thumbColor="#fff"
            />
          </View>

          <Text style={styles.fieldLabel}>数据源</Text>
          <Pressable style={styles.picker} onPress={() => setShowAlmanacProvider(!showAlmanacProvider)}>
            <Text style={styles.pickerText}>
              {almanacSettings.provider === 'apihz' ? 'apihz.cn（推荐）' : almanacSettings.provider === 'custom' ? '自定义 API' : '本地数据'}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </Pressable>
          {showAlmanacProvider && (
            <View style={styles.optionsList}>
              {(['apihz', 'custom', 'fallback'] as const).map((p) => (
                <Pressable key={p} style={[styles.optionItem, p === almanacSettings.provider && styles.optionItemActive]} onPress={() => { setAlmanacSettings({ provider: p }); setShowAlmanacProvider(false); }}>
                  <Text style={[styles.optionText, p === almanacSettings.provider && styles.optionTextActive]}>
                    {p === 'apihz' ? 'apihz.cn（推荐）' : p === 'custom' ? '自定义 API' : '本地数据'}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* apihz.cn fields */}
          {almanacSettings.provider === 'apihz' && (
            <>
              <Text style={styles.fieldLabel}>用户 ID（数字ID）</Text>
              <TextInput
                style={styles.input}
                value={almanacSettings.userId}
                onChangeText={(v) => setAlmanacSettings({ userId: v })}
                placeholder="在 apihz.cn 用户中心获取"
                placeholderTextColor="#555"
                autoCapitalize="none"
                keyboardType="numeric"
              />
              <Text style={styles.fieldLabel}>通讯秘钥（Key）</Text>
              <TextInput
                style={styles.input}
                value={almanacSettings.userKey}
                onChangeText={(v) => setAlmanacSettings({ userKey: v })}
                placeholder="在 apihz.cn 用户中心获取"
                placeholderTextColor="#555"
                secureTextEntry
                autoCapitalize="none"
              />
              <Text style={styles.hint}>接口地址：https://cn.apihz.cn/api/time/getday.php{'\n'}使用 GET 请求，参数 id 和 key{'\n'}接口免费，每日调用无上限</Text>
            </>
          )}

          {/* Custom API fields */}
          {almanacSettings.provider === 'custom' && (
            <>
              <Text style={styles.fieldLabel}>API Endpoint</Text>
              <TextInput
                style={styles.input}
                value={almanacSettings.endpoint}
                onChangeText={(v) => setAlmanacSettings({ endpoint: v })}
                placeholder="https://your-almanac-api.com/api/today"
                placeholderTextColor="#555"
                autoCapitalize="none"
              />
              <Text style={styles.fieldLabel}>API Key（可选）</Text>
              <TextInput
                style={styles.input}
                value={almanacSettings.apiKey}
                onChangeText={(v) => setAlmanacSettings({ apiKey: v })}
                placeholder="Bearer token（如需要）"
                placeholderTextColor="#555"
                secureTextEntry
                autoCapitalize="none"
              />
              <Text style={styles.hint}>请求格式：GET {'{endpoint}'}?date=YYYY-MM-DD{'\n'}API Key 通过 Authorization: Bearer header 发送</Text>
            </>
          )}

          <Text style={styles.hint}>如果 API 请求失败，将自动回退到本地数据</Text>
          <ActionButton title="保存黄历 API 设置" onPress={handleSaveAlmanac} variant="secondary" />
        </View>

        {/* ======== DANGER ZONE ======== */}
        <Text style={styles.sectionLabel}>数据管理</Text>
        <View style={styles.card}>
          <ActionButton title="清空所有历史记录" onPress={handleClearAll} variant="danger" />
        </View>

        {/* ======== DISCLAIMER ======== */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>免责声明</Text>
          <Text style={styles.disclaimerText}>
            本应用（每日运势）提供的内容仅供娱乐和自我反思参考。{'\n\n'}
            我们不以任何方式声称或保证所提供的运势、卦象、塔罗牌解读或星座分析能够真实预测未来事件。{'\n\n'}
            所有内容均为计算机生成的随机结果或 AI 模型生成的解读文本，不应作为人生决策的依据。{'\n\n'}
            用户应理性看待所有内容，关于生活、职业、感情和财务的重大决定，请咨询相关专业人士。{'\n\n'}
            使用本应用即表示您理解并接受以上声明。
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
  card: { backgroundColor: '#1e1e3a', borderRadius: 16, padding: 16 },
  fieldLabel: { color: '#8888a8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#2a2a4a', borderRadius: 10, padding: 12, color: '#e8e8f0', fontSize: 15, marginBottom: 4 },
  hint: { color: '#555', fontSize: 11, lineHeight: 16, marginTop: 4, marginBottom: 8 },
  picker: { backgroundColor: '#2a2a4a', borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pickerText: { color: '#e8e8f0', fontSize: 15 },
  pickerArrow: { color: '#666', fontSize: 12 },
  signGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12, marginTop: 8 },
  signItem: { width: '30%', paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#2a2a4a' },
  signItemActive: { backgroundColor: '#6C63FF' },
  signText: { color: '#aaa', fontSize: 12 },
  signTextActive: { color: '#fff', fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  apiKeyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  apiKeyInput: { flex: 1 },
  toggleBtn: { backgroundColor: '#2a2a4a', borderRadius: 10, padding: 12, alignItems: 'center' },
  toggleBtnText: { color: '#6C63FF', fontSize: 13 },
  aiActions: { marginTop: 16, gap: 10 },
  optionsList: { backgroundColor: '#2a2a4a', borderRadius: 10, padding: 4, marginBottom: 8 },
  optionItem: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  optionItemActive: { backgroundColor: '#6C63FF' },
  optionText: { color: '#aaa', fontSize: 14 },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  disclaimerBox: { marginTop: 24, padding: 16, backgroundColor: '#1a1a2e', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a5a' },
  disclaimerTitle: { color: '#888888', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  disclaimerText: { color: '#666', fontSize: 12, lineHeight: 20 },
});
