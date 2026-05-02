import AsyncStorage from '@react-native-async-storage/async-storage';
import { TarotHistoryItem } from '../types/fortune';

const HISTORY_KEY = '@tarot_history';

export async function loadHistory(): Promise<TarotHistoryItem[]> {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveHistory(history: TarotHistoryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Silently fail
  }
}

export async function addToHistory(item: TarotHistoryItem): Promise<TarotHistoryItem[]> {
  const history = await loadHistory();
  // Replace existing entry for same date + question, or prepend new
  const filtered = history.filter(
    (h) => !(h.date === item.date && h.question === item.question)
  );
  const updated = [item, ...filtered];
  await saveHistory(updated);
  return updated;
}

export async function deleteHistoryItem(id: string): Promise<TarotHistoryItem[]> {
  const history = await loadHistory();
  const updated = history.filter((h) => h.id !== id);
  await saveHistory(updated);
  return updated;
}
