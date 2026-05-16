import { View, StyleSheet } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { Colors } from '../../constants';

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
      <Icon source={icon} size={24} color={color} />
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>
          {value}{unit ? <Text style={styles.unit}> {unit}</Text> : null}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    padding: 16, borderRadius: 12, borderLeftWidth: 3,
    marginBottom: 8, elevation: 1, shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  textContainer: { marginLeft: 12, flex: 1 },
  label: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 22, fontWeight: '700', marginTop: 2 },
  unit: { fontSize: 14, fontWeight: '400', color: Colors.textSecondary },
});
