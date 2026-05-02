import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasRecords: boolean;
}

interface CalendarViewProps {
  year: number;
  month: number;
  days: CalendarDay[];
  onDayPress: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarView({
  year,
  month,
  days,
  onDayPress,
  onPrevMonth,
  onNextMonth,
}: CalendarViewProps) {
  const weekHeaders = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <View style={styles.container}>
      {/* Month header */}
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>
          {year}年{month}月
        </Text>
        <Pressable onPress={onNextMonth} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      {/* Week day headers */}
      <View style={styles.weekRow}>
        {weekHeaders.map((d) => (
          <View key={d} style={styles.weekCell}>
            <Text style={styles.weekText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {days.map((day) => (
          <Pressable
            key={day.date}
            style={[
              styles.dayCell,
              day.isToday && styles.todayCell,
            ]}
            onPress={() => onDayPress(day.date)}
          >
            <Text
              style={[
                styles.dayText,
                !day.isCurrentMonth && styles.otherMonthText,
                day.isToday && styles.todayText,
              ]}
            >
              {day.day}
            </Text>
            {day.hasRecords && <View style={styles.dot} />}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e3a',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: '#ccc',
    fontSize: 22,
    fontWeight: '300',
  },
  monthTitle: {
    color: '#e8e8f0',
    fontSize: 17,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    backgroundColor: '#6C63FF30',
    borderRadius: 20,
  },
  dayText: {
    color: '#e8e8f0',
    fontSize: 14,
  },
  otherMonthText: {
    color: '#444',
  },
  todayText: {
    color: '#6C63FF',
    fontWeight: '700',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#6C63FF',
    marginTop: 2,
  },
});
