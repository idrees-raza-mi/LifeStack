import { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { ScreenWrapper, Card } from '../../src/components/ui/ScreenWrapper';
import { PageHeader, SectionHeader, StatCard } from '../../src/components/ui/PageHeader';
import { Colors, ShadowStyle, AchievementColors } from '../../src/constants';
import { useHabitStore } from '../../src/store/habitStore';
import { useTaskStore } from '../../src/store/taskStore';
import { useGymStore } from '../../src/store/gymStore';
import { format, startOfWeek, addDays, subDays } from 'date-fns';

export default function AwardsScreen() {
  const { habits, logs, loadHabits } = useHabitStore();
  const { tasks, loadTasks } = useTaskStore();
  const { sessions, loadSessions } = useGymStore();

  useEffect(() => {
    loadHabits();
    loadTasks();
    loadSessions();
    const end = format(new Date(), 'yyyy-MM-dd');
    const start = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    habits.forEach(h => {
      const store = useHabitStore.getState();
      store.loadLogs(h.id, start, end);
    });
  }, []);

  const totalCompletions = useMemo(() => {
    const habitDone = logs.filter(l => l.completed).length;
    const taskDone = tasks.filter(t => t.completed).length;
    return habitDone + taskDone;
  }, [logs, tasks]);

  const level = Math.floor(totalCompletions / 20) + 1;
  const xp = totalCompletions % 20;
  const xpNext = 20;
  const xpPercent = (xp / xpNext) * 100;

  const weekHabits = useMemo(() => {
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    let count = 0;
    const current = new Date(weekStart);
    const end = new Date(today);
    while (current <= end) {
      const dateStr = format(current, 'yyyy-MM-dd');
      const dayLogs = logs.filter(l => l.date === dateStr && l.completed);
      if (dayLogs.length > 0) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }, [logs]);

  // Real achievements based on data
  const achievements = useMemo(() => {
    const list: { id: string; title: string; description: string; icon: string; tier: 'bronze' | 'silver' | 'gold' | 'diamond'; progress: number; unlocked: boolean; category: string }[] = [];

    // First habit completed
    const hasDoneHabit = logs.some(l => l.completed);
    list.push({
      id: '1', title: 'First Step', description: 'Complete your first habit', icon: 'star',
      tier: 'bronze', progress: hasDoneHabit ? 100 : 0, unlocked: hasDoneHabit, category: 'Getting Started',
    });

    // 10 completions
    const tenDone = totalCompletions >= 10;
    list.push({
      id: '2', title: 'Getting Consistent', description: 'Reach 10 total completions', icon: 'fire',
      tier: 'bronze', progress: Math.min(Math.round((totalCompletions / 10) * 100), 100), unlocked: tenDone, category: 'Consistency',
    });

    // 50 completions
    const fiftyDone = totalCompletions >= 50;
    list.push({
      id: '3', title: 'Half Century', description: 'Reach 50 total completions', icon: 'shield-star',
      tier: 'silver', progress: Math.min(Math.round((totalCompletions / 50) * 100), 100), unlocked: fiftyDone, category: 'Consistency',
    });

    // 100 completions
    const hundredDone = totalCompletions >= 100;
    list.push({
      id: '4', title: 'Century Club', description: 'Reach 100 total completions', icon: 'trophy',
      tier: 'gold', progress: Math.min(Math.round((totalCompletions / 100) * 100), 100), unlocked: hundredDone, category: 'Consistency',
    });

    // 5 habits created
    const fiveHabits = habits.length >= 5;
    list.push({
      id: '5', title: 'Habit Stacker', description: 'Create 5 habits', icon: 'checkbox-marked-circle-outline',
      tier: 'silver', progress: Math.min(Math.round((habits.length / 5) * 100), 100), unlocked: fiveHabits, category: 'Building',
    });

    // First task done
    const hasDoneTask = tasks.some(t => t.completed);
    list.push({
      id: '6', title: 'Task Crusher', description: 'Complete your first task', icon: 'format-list-checks',
      tier: 'bronze', progress: hasDoneTask ? 100 : 0, unlocked: hasDoneTask, category: 'Getting Started',
    });

    // First workout
    const hasWorkout = sessions.length > 0;
    list.push({
      id: '7', title: 'First Sweat', description: 'Complete your first workout', icon: 'dumbbell',
      tier: 'bronze', progress: hasWorkout ? 100 : 0, unlocked: hasWorkout, category: 'Fitness',
    });

    // 7-day streak (1 week consecutive)
    const streak7 = weekHabits >= 7;
    list.push({
      id: '8', title: 'Iron Will', description: '7-day active streak', icon: 'meditation',
      tier: 'silver', progress: Math.min(Math.round((weekHabits / 7) * 100), 100), unlocked: streak7, category: 'Consistency',
    });

    return list;
  }, [logs, tasks, habits, sessions, totalCompletions, weekHabits]);

  const unlocked = achievements.filter(a => a.unlocked).length;
  const total = achievements.length;

  return (
    <ScreenWrapper scroll>
      <PageHeader title="Awards" subtitle={`${unlocked}/${total} unlocked`} icon="trophy" />

      {/* Level & XP Card */}
      <Card style={styles.levelCard}>
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{level}</Text>
            <Text style={styles.levelLabel}>Level</Text>
          </View>
          <View style={styles.xpSection}>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
            </View>
            <Text style={styles.xpText}>{xp} / {xpNext} XP</Text>
          </View>
        </View>
        <View style={styles.levelRewards}>
          <Icon source="fire" size={16} color={Colors.peach} />
          <Text style={styles.levelRewardText}>{weekHabits} day{weekHabits !== 1 ? 's' : ''} this week</Text>
          <View style={styles.dot} />
          <Icon source="trophy" size={16} color={Colors.mint} />
          <Text style={styles.levelRewardText}>{totalCompletions} total</Text>
        </View>
      </Card>

      <SectionHeader title="Achievements" />

      {achievements.map(a => (
        <TouchableOpacity key={a.id} activeOpacity={0.7}>
          <Card style={[styles.achievementCard, !a.unlocked && styles.achievementLocked]}>
            <View style={[styles.achievementIconWrap, { backgroundColor: (a.unlocked ? AchievementColors[a.tier] : Colors.textTertiary) + '20' }]}>
              <Icon source={a.icon as any} size={22} color={a.unlocked ? (AchievementColors[a.tier] || Colors.primary) : Colors.textTertiary} />
            </View>
            <View style={styles.achievementInfo}>
              <View style={styles.achievementHeader}>
                <Text style={[styles.achievementTitle, !a.unlocked && styles.textLocked]}>{a.title}</Text>
                <View style={[styles.tierBadge, { backgroundColor: (a.unlocked ? AchievementColors[a.tier] : Colors.textTertiary) + '20' }]}>
                  <Text style={[styles.tierText, { color: a.unlocked ? (AchievementColors[a.tier] || Colors.primary) : Colors.textTertiary }]}>{a.tier}</Text>
                </View>
              </View>
              <Text style={styles.achievementDesc}>{a.description}</Text>
              <View style={styles.achievementBarBg}>
                <View style={[styles.achievementBarFill, { width: `${a.progress}%`, backgroundColor: a.unlocked ? (AchievementColors[a.tier] || Colors.primary) : Colors.textTertiary }]} />
              </View>
            </View>
            {a.unlocked ? (
              <Icon source="check-circle" size={20} color={Colors.mint} />
            ) : (
              <Text style={styles.achievementPercent}>{a.progress}%</Text>
            )}
          </Card>
        </TouchableOpacity>
      ))}
      <View style={{ height: 40 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  levelCard: { marginBottom: 16 },
  levelRow: { flexDirection: 'row', alignItems: 'center' },
  levelBadge: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  levelNumber: { fontSize: 26, fontWeight: '800', color: Colors.white },
  levelLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: -2 },
  xpSection: { flex: 1 },
  xpBarBg: { height: 10, backgroundColor: Colors.lavenderLight, borderRadius: 5, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 5 },
  xpText: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  levelRewards: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textTertiary, marginHorizontal: 8 },
  levelRewardText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  achievementCard: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
  },
  achievementLocked: { opacity: 0.7 },
  achievementIconWrap: {
    width: 48, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  achievementInfo: { flex: 1 },
  achievementHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  achievementTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  textLocked: { color: Colors.textTertiary },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  tierText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  achievementDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  achievementBarBg: { height: 4, backgroundColor: Colors.lavenderLight, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  achievementBarFill: { height: '100%', borderRadius: 2 },
  achievementPercent: { fontSize: 12, fontWeight: '700', color: Colors.textTertiary, marginLeft: 8 },
});
