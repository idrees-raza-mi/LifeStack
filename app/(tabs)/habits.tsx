import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, FAB, Dialog, Portal, TextInput, Button, IconButton, Icon, Chip } from 'react-native-paper';
import { ScreenWrapper, Card } from '../../src/components/ui/ScreenWrapper';
import { PageHeader, StatCard, SectionHeader } from '../../src/components/ui/PageHeader';
import { HabitCard } from '../../src/components/ui/StatCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useHabitStore } from '../../src/store/habitStore';
import { Habit } from '../../src/types';
import { Colors, HabitColors, HabitIcons, ShadowStyle } from '../../src/constants';
import { format, addDays, startOfWeek, subDays, isSameDay, parseISO } from 'date-fns';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function computeStreak(logs: { habitId: string; date: string; completed: boolean }[], habitId: string): number {
  const habitLogs = logs.filter(l => l.habitId === habitId && l.completed).map(l => l.date).sort().reverse();
  if (habitLogs.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    if (habitLogs.includes(date)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function HabitsScreen() {
  const { habits, loadHabits, addHabit, toggleLog, logs, loadLogs } = useHabitStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(HabitIcons[0]);
  const [color, setColor] = useState(HabitColors[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'habits' | 'tasks'>('habits');

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    if (habits.length === 0) return;
    const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const end = format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), 'yyyy-MM-dd');
    habits.forEach(h => loadLogs(h.id, start, end));
  }, [habits.length]);

  const today = format(selectedDate, 'yyyy-MM-dd');
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const completedToday = habits.filter(h => logs.some(l => l.habitId === h.id && l.date === today && l.completed)).length;
  const weeklyProgress = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  const maxStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => computeStreak(logs, h.id)));
  }, [logs, habits]);

  const weekCompletionsTotal = useMemo(() => {
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(addDays(weekStart, 6), 'yyyy-MM-dd');
    const weekLogs = logs.filter(l => l.date >= weekStartStr && l.date <= weekEndStr && l.completed);
    return weekLogs.length;
  }, [logs, weekStart]);

  const totalPossible = habits.length * 7;
  const weekDisplay = `${weekCompletionsTotal}/${totalPossible}`;

  const handleToggle = useCallback(async (habitId: string) => {
    await toggleLog(habitId, today);
  }, [today]);

  const handleAddHabit = async () => {
    if (!name.trim()) return;
    await addHabit({
      name, userId: '', icon, color, frequency: 'daily',
      reminderEnabled: false, description: '',
    });
    setDialogVisible(false);
    setName('');
  };

  return (
    <ScreenWrapper scroll>
      <PageHeader
        title="My Habits"
        subtitle={`${completedToday}/${habits.length} done today`}
        icon="checkbox-marked-circle-outline"
        right={
          <TouchableOpacity style={styles.streakBadgeLarge} activeOpacity={0.7}>
            <Icon source="fire" size={18} color={Colors.peach} />
            <Text style={styles.streakTextLarge}>{maxStreak}</Text>
          </TouchableOpacity>
        }
      />

      {/* Weekly Progress Card */}
      <Card style={styles.progressCard}>
        <View style={styles.progressCardContent}>
          <View style={styles.progressRing}>
            <View style={[styles.ringOuter, { borderColor: Colors.lavenderLight }]}>
              <View style={styles.ringInner}>
                <Text style={styles.ringValue}>{weeklyProgress}%</Text>
                <Text style={styles.ringLabel}>Today</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressStats}>
            <StatCard icon="fire" label="Streak" value={`${maxStreak} days`} color={Colors.peach} />
            <StatCard icon="calendar-check" label="This Week" value={weekDisplay} color={Colors.primary} />
          </View>
        </View>
      </Card>

      {/* Date Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow} contentContainerStyle={styles.dateContent}>
        {weekDays.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayLogs = logs.filter(l => l.date === dateStr);
          const dayDone = dayLogs.filter(l => l.completed).length;
          const active = format(day, 'yyyy-MM-dd') === today;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.dateItem, active && styles.dateItemActive]}
              onPress={() => setSelectedDate(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateDay, active && styles.dateDayActive]}>{WEEKDAYS[i]}</Text>
              <Text style={[styles.dateNum, active && styles.dateNumActive]}>{format(day, 'd')}</Text>
              {dayDone > 0 && <View style={[styles.dateDot, { backgroundColor: Colors.primary }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        {['habits', 'tasks'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Habits List */}
      {habits.length === 0 ? (
        <EmptyState
          icon="star"
          title="No habits yet"
          description="Create your first habit and start building streaks"
        />
      ) : (
        habits.map(habit => {
          const habitLogs = logs.filter(l => l.habitId === habit.id);
          const done = habitLogs.some(l => l.date === today && l.completed);
          const weekCompletions = habitLogs.filter(l => l.completed).length;
          const progress = Math.round((weekCompletions / 7) * 100);
          const streak = computeStreak(logs, habit.id);
          return (
            <HabitCard
              key={habit.id}
              name={habit.name}
              icon={habit.icon}
              color={habit.color}
              progress={progress}
              streak={streak}
              completed={done}
              onToggle={() => handleToggle(habit.id)}
            />
          );
        })
      )}

      <View style={{ height: 80 }} />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>New Habit</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Habit name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.dialogInput}
              outlineStyle={{ borderRadius: 16, borderColor: Colors.cardBorder }}
            />
            <Text style={styles.label}>Choose Icon</Text>
            <View style={styles.iconRow}>
              {HabitIcons.map(i => (
                <IconButton
                  key={i}
                  icon={i}
                  size={22}
                  selected={icon === i}
                  mode={icon === i ? 'contained' : 'outlined'}
                  onPress={() => setIcon(i)}
                  containerColor={icon === i ? Colors.lavenderLight : 'transparent'}
                  iconColor={icon === i ? Colors.primary : Colors.textTertiary}
                />
              ))}
            </View>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
              {HabitColors.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor={Colors.textTertiary}>Cancel</Button>
            <Button onPress={handleAddHabit} buttonColor={Colors.primary} textColor={Colors.white} style={{ borderRadius: 12 }}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        color={Colors.white}
        onPress={() => setDialogVisible(true)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  progressCard: { marginBottom: 16 },
  progressCardContent: { flexDirection: 'row', alignItems: 'center' },
  progressRing: { marginRight: 16 },
  ringOuter: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 4,
    justifyContent: 'center', alignItems: 'center',
  },
  ringInner: { alignItems: 'center' },
  ringValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  ringLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: -2 },
  progressStats: { flex: 1 },
  streakBadgeLarge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.peachLight,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
    ...ShadowStyle.card,
  },
  streakTextLarge: { fontSize: 16, fontWeight: '800', color: Colors.peach, marginLeft: 4 },
  dateRow: { marginBottom: 16 },
  dateContent: { gap: 10, paddingVertical: 4 },
  dateItem: {
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, backgroundColor: Colors.card, ...ShadowStyle.card,
  },
  dateItemActive: { backgroundColor: Colors.primary },
  dateDay: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  dateDayActive: { color: Colors.white },
  dateNum: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 2 },
  dateNumActive: { color: Colors.white },
  dateDot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
  tabRow: {
    flexDirection: 'row', backgroundColor: Colors.lavenderLight,
    borderRadius: 16, padding: 4, marginBottom: 16,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderRadius: 14,
  },
  tabBtnActive: { backgroundColor: Colors.white, ...ShadowStyle.card },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textTertiary },
  tabTextActive: { color: Colors.primary },
  fab: {
    position: 'absolute', right: 20, bottom: 90,
    backgroundColor: Colors.primary, borderRadius: 20,
    ...ShadowStyle.floating,
  },
  dialog: { borderRadius: 28, backgroundColor: Colors.card },
  dialogTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  dialogInput: { marginBottom: 16, backgroundColor: Colors.background },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 10 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 4 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 8 },
  colorDot: { width: 34, height: 34, borderRadius: 17 },
  colorDotActive: { borderWidth: 3, borderColor: Colors.text },
});
