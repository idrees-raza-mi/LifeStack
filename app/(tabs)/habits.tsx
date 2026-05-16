import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Dialog, Portal, TextInput, Button, IconButton, Icon, Chip } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { ScreenWrapper, Card } from '../../src/components/ui/ScreenWrapper';
import { PageHeader, StatCard, SectionHeader } from '../../src/components/ui/PageHeader';
import { HabitCard } from '../../src/components/ui/StatCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useHabitStore } from '../../src/store/habitStore';
import { useTaskStore } from '../../src/store/taskStore';
import { Habit } from '../../src/types';
import { Colors, HabitColors, HabitIcons, ShadowStyle } from '../../src/constants';
import { format, addDays, startOfWeek, subDays, isSameDay, parseISO, isToday } from 'date-fns';

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
  const { tasks, loadTasks } = useTaskStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(HabitIcons[0]);
  const [color, setColor] = useState(HabitColors[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'habits' | 'tasks'>('habits');

  useEffect(() => {
    loadHabits();
    loadTasks();
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
  const tasksDoneToday = tasks.filter(t => t.completed && t.completedAt && isToday(parseISO(t.completedAt))).length;

  const weeklyProgress = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const ringRadius = 36;
  const ringStroke = 6;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (weeklyProgress / 100) * ringCircumference;

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
    <ScreenWrapper
      scroll
      onFabPress={() => setDialogVisible(true)}
    >
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

      {/* Gradient Progress Card */}
      <View style={styles.gradientCard}>
        <View style={styles.gradientCardContent}>
          <View style={styles.gradientCardLeft}>
            <View style={styles.gradientMetric}>
              <Icon source="checkbox-marked-circle-outline" size={16} color={Colors.white} />
              <Text style={styles.gradientMetricValue}>{completedToday}</Text>
              <Text style={styles.gradientMetricLabel}>habits</Text>
            </View>
            <View style={styles.gradientMetric}>
              <Icon source="format-list-checks" size={16} color={Colors.white} />
              <Text style={styles.gradientMetricValue}>{tasksDoneToday}</Text>
              <Text style={styles.gradientMetricLabel}>tasks</Text>
            </View>
            <View style={styles.emojiWrap}>
              <Text style={styles.emojiText}>{weeklyProgress >= 80 ? '🔥' : weeklyProgress >= 50 ? '💪' : '🌱'}</Text>
            </View>
          </View>
          <View style={styles.gradientCardRight}>
            <Svg width={90} height={90}>
              <Circle cx={45} cy={45} r={ringRadius} stroke="rgba(255,255,255,0.25)" strokeWidth={ringStroke} fill="none" />
              <Circle
                cx={45} cy={45} r={ringRadius}
                stroke={Colors.white}
                strokeWidth={ringStroke}
                fill="none"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                transform="rotate(-90, 45, 45)"
              />
            </Svg>
            <Text style={styles.gradientRingValue}>{weeklyProgress}%</Text>
            <Text style={styles.gradientRingLabel}>today</Text>
          </View>
        </View>
      </View>

      {/* Redesigned Date Selector */}
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
              <View style={styles.dateDots}>
                {dayDone > 0 && <View style={[styles.dateDot, { backgroundColor: Colors.primary }]} />}
              </View>
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  gradientCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#7C6FCD',
    shadowColor: '#7C6FCD',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradientCardLeft: {
    flex: 1,
    gap: 12,
  },
  gradientMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradientMetricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  gradientMetricLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  emojiWrap: {
    marginTop: 8,
  },
  emojiText: {
    fontSize: 28,
  },
  gradientCardRight: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gradientRingValue: {
    position: 'absolute',
    top: 28,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  gradientRingLabel: {
    position: 'absolute',
    bottom: 18,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  streakBadgeLarge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.peachLight,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
    ...ShadowStyle.card,
  },
  streakTextLarge: { fontSize: 16, fontWeight: '800', color: Colors.peach, marginLeft: 4 },
  dateRow: { marginBottom: 16 },
  dateContent: { gap: 10, paddingVertical: 4 },
  dateItem: {
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 20, backgroundColor: Colors.card, ...ShadowStyle.card,
  },
  dateItemActive: { backgroundColor: Colors.primary },
  dateDay: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  dateDayActive: { color: 'rgba(255,255,255,0.8)' },
  dateNum: { fontSize: 18, fontWeight: '700', color: Colors.text },
  dateNumActive: { color: Colors.white },
  dateDots: { height: 8, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  dateDot: { width: 5, height: 5, borderRadius: 3 },
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
  dialog: { borderRadius: 28, backgroundColor: Colors.card },
  dialogTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  dialogInput: { marginBottom: 16, backgroundColor: Colors.background },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 10 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 4 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 8 },
  colorDot: { width: 34, height: 34, borderRadius: 17 },
  colorDotActive: { borderWidth: 3, borderColor: Colors.text },
});
