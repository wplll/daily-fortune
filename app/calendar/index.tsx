import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarView } from '../../src/components/CalendarView';
import { useFortuneStore } from '../../src/store/fortuneStore';
import { today, daysInMonth, firstDayOfWeek } from '../../src/utils/date';

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasRecords: boolean;
}

export default function CalendarScreen() {
  const router = useRouter();
  const getDatesWithRecords = useFortuneStore((s) => s.getDatesWithRecords);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);

  const recordDates = useMemo(() => getDatesWithRecords(), [getDatesWithRecords]);
  const recordSet = new Set(recordDates);
  const todayStr = today();

  const days: CalendarDay[] = useMemo(() => {
    const total = daysInMonth(viewYear, viewMonth);
    const firstDay = firstDayOfWeek(viewYear, viewMonth);
    const result: CalendarDay[] = [];

    // Previous month padding
    const prevMonth = viewMonth === 1 ? 12 : viewMonth - 1;
    const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;
    const prevTotal = daysInMonth(prevYear, prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevTotal - i;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({
        date: dateStr,
        day: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        hasRecords: recordSet.has(dateStr),
      });
    }

    // Current month
    for (let d = 1; d <= total; d++) {
      const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({
        date: dateStr,
        day: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        hasRecords: recordSet.has(dateStr),
      });
    }

    // Next month padding
    const remaining = (7 - (result.length % 7)) % 7;
    const nextMonth = viewMonth === 12 ? 1 : viewMonth + 1;
    const nextYear = viewMonth === 12 ? viewYear + 1 : viewYear;

    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({
        date: dateStr,
        day: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        hasRecords: recordSet.has(dateStr),
      });
    }

    return result;
  }, [viewYear, viewMonth, recordSet]);

  const handleDayPress = (date: string) => {
    router.push(`/calendar/${date}`);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.back} onPress={() => router.back()}>‹ 返回</Text>
          <Text style={styles.title}>📆 历史记录</Text>
        </View>

        <CalendarView
          year={viewYear}
          month={viewMonth}
          days={days}
          onDayPress={handleDayPress}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <Text style={styles.hint}>点击有标记的日期查看该日的运势记录</Text>
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
  hint: { color: '#555', fontSize: 12, textAlign: 'center', marginTop: 16 },
});
