import { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Icon, Switch, Button } from 'react-native-paper';
import { ScreenWrapper, Card } from '../../src/components/ui/ScreenWrapper';
import { PageHeader, StatCard, SectionHeader } from '../../src/components/ui/PageHeader';
import { Colors, ShadowStyle } from '../../src/constants';
import { useAuthStore } from '../../src/store/authStore';
import { useHabitStore } from '../../src/store/habitStore';
import { useTaskStore } from '../../src/store/taskStore';
import { useGoalStore } from '../../src/store/goalStore';
import { useRoutineStore } from '../../src/store/routineStore';
import { router } from 'expo-router';
import { format, startOfWeek, addDays, subDays } from 'date-fns';

const QUOTES = [
  '"Small daily improvements lead to stunning results."',
  '"The secret of getting ahead is getting started."',
  '"Success is the sum of small efforts repeated day in and day out."',
  '"Your habits shape your future."',
  '"Be stronger than your excuses."',
];

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { habits, logs, loadHabits, loadLogs } = useHabitStore();
  const { tasks, loadTasks } = useTaskStore();
  const { goals, loadGoals } = useGoalStore();
  const { routines, loadRoutines } = useRoutineStore();
  const [notifications, setNotifications] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));
    loadHabits();
    loadTasks();
    loadGoals();
    loadRoutines();
  }, []);

  useEffect(() => {
    if (habits.length === 0) return;
    const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const end = format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), 'yyyy-MM-dd');
    habits.forEach(h => loadLogs(h.id, format(subDays(new Date(), 30), 'yyyy-MM-dd'), end));
  }, [habits.length]);

  const maxStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    const today = new Date();
    let bestStreak = 0;
    for (const habit of habits) {
      const habitDates = logs.filter(l => l.habitId === habit.id && l.completed).map(l => l.date).sort().reverse();
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        if (habitDates.includes(date)) { streak++; } else { break; }
      }
      if (streak > bestStreak) bestStreak = streak;
    }
    return bestStreak;
  }, [logs, habits]);

  const completedTotal = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayLogs = logs.filter(l => l.date === today && l.completed).length;
    const todayTasks = tasks.filter(t => t.completed).length;
    return todayLogs + todayTasks;
  }, [logs, tasks]);

  const activeGoals = goals.filter(g => g.status === 'active').length;
  const totalRoutines = routines.length;

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStats = Array.from({ length: 7 }, (_, i) => {
    const date = format(addDays(weekStart, i), 'yyyy-MM-dd');
    const dayLogs = logs.filter(l => l.completed && l) || [];
    const count = dayLogs.filter(l => l.date === date).length;
    return { label: weekDays[i], done: count > 0 };
  });
  const activeDays = weekStats.filter(d => d.done).length;

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenWrapper scroll>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Icon source="account" size={40} color={Colors.white} />
        </View>
        <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.profileEmail}>{user?.email || 'Guest'}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard icon="fire" label="Streak" value={`${maxStreak} days`} color={Colors.peach} />
        <StatCard icon="checkbox-marked" label="Today" value={String(completedTotal)} color={Colors.mint} />
      </View>

      {/* More Features — Quick Access */}
      <SectionHeader title="All Features" />
      <View style={styles.featureGrid}>
        <TouchableOpacity style={[styles.featureCard, { backgroundColor: Colors.lavenderLight }]} onPress={() => router.push('/(features)/goals')} activeOpacity={0.7}>
          <View style={styles.featureIcon}>
            <Icon source="target" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.featureName}>Goals</Text>
          <Text style={styles.featureCount}>{activeGoals} active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.featureCard, { backgroundColor: Colors.skyBlueLight }]} onPress={() => router.push('/(features)/routines')} activeOpacity={0.7}>
          <View style={styles.featureIcon}>
            <Icon source="repeat-variant" size={24} color={Colors.secondary} />
          </View>
          <Text style={styles.featureName}>Routines</Text>
          <Text style={styles.featureCount}>{totalRoutines} total</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.featureCard, { backgroundColor: Colors.roseLight }]} onPress={() => router.push('/(features)/gym')} activeOpacity={0.7}>
          <View style={styles.featureIcon}>
            <Icon source="dumbbell" size={24} color={Colors.accent} />
          </View>
          <Text style={styles.featureName}>Gym</Text>
          <Text style={styles.featureCount}>Track workouts</Text>
        </TouchableOpacity>
      </View>

      {/* Quote */}
      <Card style={[styles.quoteCard, { backgroundColor: Colors.lavenderLight }]}>
        <Icon source="format-quote-open" size={20} color={Colors.primary} />
        <Text style={styles.quoteText}>{QUOTES[quoteIndex]}</Text>
      </Card>

      {/* Weekly Stats */}
      <SectionHeader title="Weekly Stats" />
      <Card style={styles.weeklyCard}>
        <View style={styles.weekRow}>
          {weekStats.map((d, i) => (
            <View key={i} style={styles.weekDay}>
              <Text style={styles.weekDayLabel}>{d.label}</Text>
              <View style={[styles.weekDayDot, d.done && styles.weekDayDotDone]} />
            </View>
          ))}
        </View>
        <View style={styles.weekStats}>
          <Text style={styles.weekStatText}>{activeDays}/7 days active</Text>
          <Text style={styles.weekStatText}>{Math.round((activeDays / 7) * 100)}% this week</Text>
        </View>
      </Card>

      {/* Settings */}
      <SectionHeader title="Settings" />
      <Card style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Icon source="bell-outline" size={20} color={Colors.primary} />
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} color={Colors.primary} />
        </View>
        <View style={styles.settingDivider} />
        <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
          <View style={styles.settingLeft}>
            <Icon source="logout" size={20} color={Colors.error} />
            <Text style={[styles.settingLabel, { color: Colors.error }]}>Logout</Text>
          </View>
          <Icon source="chevron-right" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      </Card>
      <View style={{ height: 40 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', paddingVertical: 8, marginBottom: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, ...ShadowStyle.elevated,
  },
  profileName: { fontSize: 22, fontWeight: '800', color: Colors.text },
  profileEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  featureGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  featureCard: {
    flex: 1, borderRadius: 20, padding: 16, alignItems: 'center',
    ...ShadowStyle.card,
  },
  featureIcon: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  featureName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  featureCount: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  quoteCard: { marginBottom: 16, alignItems: 'center' },
  quoteText: { fontSize: 14, color: Colors.text, textAlign: 'center', fontStyle: 'italic', marginTop: 8, lineHeight: 20 },
  weeklyCard: { marginBottom: 16 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  weekDay: { alignItems: 'center', gap: 6 },
  weekDayLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  weekDayDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.lavenderLight },
  weekDayDotDone: { backgroundColor: Colors.primary },
  weekStats: { flexDirection: 'row', justifyContent: 'space-between' },
  weekStatText: { fontSize: 12, color: Colors.textTertiary, fontWeight: '600' },
  settingsCard: { marginBottom: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  settingDivider: { height: 1, backgroundColor: Colors.lavenderLight },
});
