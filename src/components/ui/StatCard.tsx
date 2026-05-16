import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { Colors, ShadowStyle } from '../../constants';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

export function StatCard({ icon, label, value, unit, color = Colors.primary }: StatCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Icon source={icon as any} size={22} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>
          {value}<Text style={styles.unit}>{unit ? ` ${unit}` : ''}</Text>
        </Text>
      </View>
    </View>
  );
}

interface ProgressCardProps {
  label: string;
  progress: number;
  color?: string;
  icon: string;
  current: number;
  goal: number;
  unit?: string;
}

export function ProgressCard({ label, progress, color = Colors.primary, icon, current, goal, unit = '' }: ProgressCardProps) {
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <View style={[styles.progressIcon, { backgroundColor: color + '18' }]}>
          <Icon source={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={[styles.progressPercent, { color }]}>{Math.round(progress)}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.progressDetail}>{current}{unit} / {goal}{unit}</Text>
    </View>
  );
}

interface HabitCardProps {
  name: string;
  icon: string;
  color: string;
  progress: number;
  streak: number;
  time?: string;
  completed: boolean;
  onToggle: () => void;
}

export function HabitCard({ name, icon, color, progress, streak, time, completed, onToggle }: HabitCardProps) {
  return (
    <TouchableOpacity
      style={[styles.habitCard, completed && styles.habitDone]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.habitIconWrap, { backgroundColor: color + '18' }]}>
        <Icon source={icon as any} size={24} color={color} />
      </View>
      <View style={styles.habitInfo}>
        <Text style={[styles.habitName, completed && styles.habitNameDone]}>{name}</Text>
        <View style={styles.habitMeta}>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Icon source="fire" size={12} color={Colors.peach} />
              <Text style={styles.streakText}>{streak} day{streak > 1 ? 's' : ''}</Text>
            </View>
          )}
          {time && <Text style={styles.habitTime}>{time}</Text>}
        </View>
      </View>
      <View style={styles.habitRight}>
        <View style={[styles.miniRing, { borderColor: color + '30' }]}>
          <Text style={[styles.miniRingText, { color }]}>{Math.round(progress)}%</Text>
        </View>
        <View style={[styles.checkCircle, completed && { backgroundColor: color }]}>
          <Icon source="check" size={16} color={completed ? Colors.white : Colors.textTertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    padding: 16, borderRadius: 20, borderLeftWidth: 3, marginBottom: 8,
    ...ShadowStyle.card,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  textContainer: { flex: 1 },
  label: { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600' },
  value: { fontSize: 22, fontWeight: '700', marginTop: 2 },
  unit: { fontSize: 13, fontWeight: '500', color: Colors.textTertiary },
  progressCard: {
    backgroundColor: Colors.card, borderRadius: 20, padding: 16,
    marginBottom: 8, ...ShadowStyle.card,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  progressIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  progressLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.text },
  progressPercent: { fontSize: 14, fontWeight: '700' },
  progressBarBg: { height: 8, backgroundColor: Colors.lavenderLight, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressDetail: { fontSize: 12, color: Colors.textTertiary, marginTop: 6 },
  habitCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    padding: 16, marginBottom: 10, borderRadius: 20,
    ...ShadowStyle.card,
  },
  habitDone: { opacity: 0.75 },
  habitIconWrap: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  habitNameDone: { textDecorationLine: 'line-through', color: Colors.textTertiary },
  habitMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.peachLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  streakText: { fontSize: 11, fontWeight: '600', color: Colors.peach, marginLeft: 2 },
  habitTime: { fontSize: 11, color: Colors.textTertiary },
  habitRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniRing: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  miniRingText: { fontSize: 10, fontWeight: '700' },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.lavenderLight,
    justifyContent: 'center', alignItems: 'center',
  },
});
