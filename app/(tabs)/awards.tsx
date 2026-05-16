import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { ScreenWrapper, Card } from '../../src/components/ui/ScreenWrapper';
import { PageHeader, SectionHeader, StatCard } from '../../src/components/ui/PageHeader';
import { Colors, ShadowStyle, AchievementColors } from '../../src/constants';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  progress: number;
  unlocked: boolean;
  category: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Early Bird', description: 'Complete 7 morning habits', icon: 'weather-sunny', tier: 'bronze', progress: 100, unlocked: true, category: 'Consistency' },
  { id: '2', title: 'Streak Master', description: '7-day perfect streak', icon: 'fire', tier: 'silver', progress: 100, unlocked: true, category: 'Consistency' },
  { id: '3', title: 'Iron Will', description: '30-day streak', icon: 'shield-star', tier: 'gold', progress: 73, unlocked: false, category: 'Consistency' },
  { id: '4', title: 'Fitness Freak', description: '20 workouts completed', icon: 'dumbbell', tier: 'silver', progress: 100, unlocked: true, category: 'Fitness' },
  { id: '5', title: 'Runner Up', description: 'Run 50km total', icon: 'run', tier: 'gold', progress: 45, unlocked: false, category: 'Fitness' },
  { id: '6', title: 'Bookworm', description: 'Read for 30 days', icon: 'book-open-variant', tier: 'silver', progress: 80, unlocked: false, category: 'Reading' },
  { id: '7', title: 'Deep Focus', description: '5 hours of focus time', icon: 'brain', tier: 'gold', progress: 60, unlocked: false, category: 'Focus' },
  { id: '8', title: 'Zen Master', description: 'Meditate 15 days', icon: 'meditation', tier: 'diamond', progress: 33, unlocked: false, category: 'Health' },
  { id: '9', title: 'Hydrated', description: 'Drink water 7 days', icon: 'water', tier: 'bronze', progress: 100, unlocked: true, category: 'Health' },
  { id: '10', title: 'Century Club', description: '100 habits completed', icon: 'trophy', tier: 'diamond', progress: 42, unlocked: false, category: 'Consistency' },
];

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A0A0B0',
  gold: '#FFD700',
  diamond: '#7DD3FC',
};

const TIER_BG: Record<string, string> = {
  bronze: '#FFF0E0',
  silver: '#F0F0F5',
  gold: '#FFF8E0',
  diamond: '#E0F7FF',
};

export default function AwardsScreen() {
  const [level, setLevel] = useState(7);
  const [xp, setXp] = useState(340);
  const xpNext = 500;

  const unlocked = ACHIEVEMENTS.filter(a => a.unlocked).length;
  const total = ACHIEVEMENTS.length;

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
              <View style={[styles.xpBarFill, { width: `${(xp / xpNext) * 100}%` }]} />
            </View>
            <Text style={styles.xpText}>{xp} / {xpNext} XP</Text>
          </View>
        </View>
        <View style={styles.levelRewards}>
          <Icon source="fire" size={16} color={Colors.peach} />
          <Text style={styles.levelRewardText}>12 day streak</Text>
          <View style={styles.dot} />
          <Icon source="calendar-check" size={16} color={Colors.mint} />
          <Text style={styles.levelRewardText}>89% completion</Text>
        </View>
      </Card>

      {/* Weekly Challenge */}
      <Card style={[styles.challengeCard, { backgroundColor: Colors.lavenderLight }]}>
        <View style={styles.challengeRow}>
          <View style={styles.challengeIcon}>
            <Icon source="trophy" size={28} color={Colors.primary} />
          </View>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>7-Day Streak Challenge</Text>
            <Text style={styles.challengeSub}>Complete 7 habits daily for a week</Text>
            <View style={styles.challengeBarBg}>
              <View style={[styles.challengeBarFill, { width: '57%' }]} />
            </View>
            <Text style={styles.challengeCount}>4/7 days complete</Text>
          </View>
          <View style={styles.challengeReward}>
            <Icon source="diamond" size={24} color={AchievementColors.diamond} />
            <Text style={styles.challengeRewardLabel}>Reward</Text>
          </View>
        </View>
      </Card>

      <SectionHeader title="Achievements" />

      {ACHIEVEMENTS.map(a => (
        <TouchableOpacity key={a.id} activeOpacity={0.7}>
          <Card style={[styles.achievementCard, !a.unlocked && styles.achievementLocked]}>
            <View style={[styles.achievementIconWrap, { backgroundColor: TIER_BG[a.tier] }]}>
              <Icon source={a.icon as any} size={22} color={a.unlocked ? TIER_COLORS[a.tier] : Colors.textTertiary} />
            </View>
            <View style={styles.achievementInfo}>
              <View style={styles.achievementHeader}>
                <Text style={[styles.achievementTitle, !a.unlocked && styles.textLocked]}>{a.title}</Text>
                <View style={[styles.tierBadge, { backgroundColor: TIER_BG[a.tier] }]}>
                  <Text style={[styles.tierText, { color: TIER_COLORS[a.tier] }]}>{a.tier}</Text>
                </View>
              </View>
              <Text style={styles.achievementDesc}>{a.description}</Text>
              <View style={styles.achievementBarBg}>
                <View style={[styles.achievementBarFill, { width: `${a.progress}%`, backgroundColor: a.unlocked ? TIER_COLORS[a.tier] : Colors.textTertiary }]} />
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
  challengeCard: { marginBottom: 16 },
  challengeRow: { flexDirection: 'row', alignItems: 'center' },
  challengeIcon: {
    width: 52, height: 52, borderRadius: 18,
    backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
    marginRight: 14, ...ShadowStyle.card,
  },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  challengeSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  challengeBarBg: { height: 6, backgroundColor: Colors.white, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  challengeBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  challengeCount: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  challengeReward: { alignItems: 'center', marginLeft: 12 },
  challengeRewardLabel: { fontSize: 9, color: Colors.textTertiary, marginTop: 2, fontWeight: '600' },
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
