import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { Colors, ShadowStyle } from '../../constants';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  right?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon, right }: PageHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {icon && (
          <View style={styles.iconWrap}>
            <Icon source={icon as any} size={20} color={Colors.primary} />
          </View>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {right}
    </View>
  );
}

export function StatCard({ icon, label, value, unit, color = Colors.primary }: { icon: string; label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '20' }]}>
        <Icon source={icon as any} size={20} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>
          {value}<Text style={styles.statUnit}>{unit ? ` ${unit}` : ''}</Text>
        </Text>
      </View>
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function ProgressRing({ progress, size = 80, strokeWidth = 6, color = Colors.primary }: { progress: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={[styles.ringBg, {
        width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: color + '20',
      }]} />
      <View style={[styles.ringFill, {
        width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: color,
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
      }]} />
      <Text style={[styles.ringText, { fontSize: size * 0.22, color }]}>
        {Math.round(progress)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, marginBottom: 8,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: Colors.lavenderLight,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    padding: 16, borderRadius: 20, borderLeftWidth: 3, marginBottom: 8,
    ...ShadowStyle.card,
  },
  statIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  statInfo: { flex: 1 },
  statLabel: { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600' },
  statValue: { fontSize: 20, fontWeight: '700', marginTop: 2 },
  statUnit: { fontSize: 13, fontWeight: '500', color: Colors.textTertiary },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  ringBg: { position: 'absolute' },
  ringFill: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  ringText: { fontWeight: '700' },
});
