import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Icon, Switch, Button } from 'react-native-paper';
import { ScreenWrapper, Card } from '../../src/components/ui/ScreenWrapper';
import { PageHeader, StatCard, SectionHeader } from '../../src/components/ui/PageHeader';
import { ProgressCard } from '../../src/components/ui/StatCard';
import { Colors, ShadowStyle } from '../../src/constants';
import { useAuthStore } from '../../src/store/authStore';
import { router } from 'expo-router';

const QUOTES = [
  '"Small daily improvements lead to stunning results."',
  '"The secret of getting ahead is getting started."',
  '"Success is the sum of small efforts repeated day in and day out."',
  '"Your habits shape your future."',
  '"Be stronger than your excuses."',
];

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));
  }, []);

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
        <StatCard icon="fire" label="Streak" value="12 days" color={Colors.peach} />
        <StatCard icon="checkbox-marked" label="Completed" value="89" color={Colors.mint} />
      </View>

      {/* Level Card */}
      <Card style={styles.levelCard}>
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNum}>7</Text>
            <Text style={styles.levelLbl}>Level</Text>
          </View>
          <View style={styles.xpArea}>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: '68%' }]} />
            </View>
            <Text style={styles.xpText}>340 / 500 XP</Text>
          </View>
        </View>
        <View style={styles.levelRewards}>
          <Icon source="trophy" size={14} color={Colors.primary} />
          <Text style={styles.levelRewardText}>12 achievements</Text>
          <View style={styles.dot} />
          <Icon source="star" size={14} color={Colors.peach} />
          <Text style={styles.levelRewardText}>Top 15%</Text>
        </View>
      </Card>

      {/* More Features — Quick Access */}
      <SectionHeader title="All Features" />
      <View style={styles.featureGrid}>
        <TouchableOpacity style={[styles.featureCard, { backgroundColor: Colors.lavenderLight }]} onPress={() => router.push('/(features)/goals')} activeOpacity={0.7}>
          <View style={styles.featureIcon}>
            <Icon source="target" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.featureName}>Goals</Text>
          <Text style={styles.featureCount}>3 active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.featureCard, { backgroundColor: Colors.skyBlueLight }]} onPress={() => router.push('/(features)/routines')} activeOpacity={0.7}>
          <View style={styles.featureIcon}>
            <Icon source="repeat-variant" size={24} color={Colors.secondary} />
          </View>
          <Text style={styles.featureName}>Routines</Text>
          <Text style={styles.featureCount}>5 total</Text>
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
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
            const done = [true, true, true, true, true, false, false][i];
            return (
              <View key={i} style={styles.weekDay}>
                <Text style={styles.weekDayLabel}>{d}</Text>
                <View style={[styles.weekDayDot, done && styles.weekDayDotDone]} />
              </View>
            );
          })}
        </View>
        <View style={styles.weekStats}>
          <Text style={styles.weekStatText}>5/7 days active</Text>
          <Text style={styles.weekStatText}>71% this week</Text>
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
  levelCard: { marginBottom: 16 },
  levelRow: { flexDirection: 'row', alignItems: 'center' },
  levelBadge: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  levelNum: { fontSize: 22, fontWeight: '800', color: Colors.white },
  levelLbl: { fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: -2 },
  xpArea: { flex: 1 },
  xpBarBg: { height: 8, backgroundColor: Colors.lavenderLight, borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  xpText: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  levelRewards: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textTertiary, marginHorizontal: 6 },
  levelRewardText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
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
