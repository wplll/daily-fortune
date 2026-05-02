import { create } from 'zustand';
import { FortuneRecord, FortuneType } from '../types/fortune';

interface FortuneState {
  records: FortuneRecord[];
  setRecords: (records: FortuneRecord[]) => void;
  addRecord: (record: FortuneRecord) => void;
  removeRecord: (id: string) => void;
  clearAll: () => void;
  getRecordsByDate: (date: string) => FortuneRecord[];
  getDatesWithRecords: () => string[];
}

export const useFortuneStore = create<FortuneState>((set, get) => ({
  records: [],
  setRecords: (records) => set({ records }),
  addRecord: (record) =>
    set((state) => {
      // Replace existing record of same type+date, or add new
      const filtered = state.records.filter(
        (r) => !(r.date === record.date && r.type === record.type)
      );
      return { records: [...filtered, record] };
    }),
  removeRecord: (id) =>
    set((state) => ({ records: state.records.filter((r) => r.id !== id) })),
  clearAll: () => set({ records: [] }),
  getRecordsByDate: (date) => get().records.filter((r) => r.date === date),
  getDatesWithRecords: () => {
    const dates = new Set(get().records.map((r) => r.date));
    return Array.from(dates).sort();
  },
}));
