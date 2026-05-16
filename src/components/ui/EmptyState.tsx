import { View, StyleSheet } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { Colors, ShadowStyle } from '../../constants';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, compact = false }: EmptyStateProps) {
  if (compact) {
    return (
      <View style={styles.compact}>
        <Icon source={icon as any} size={32} color={Colors.textTertiary} />
        <Text style={styles.compactTitle}>{title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon source={icon as any} size={48} color={Colors.lavender} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.lavenderLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    ...ShadowStyle.card,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  description: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  compact: { alignItems: 'center', padding: 24 },
  compactTitle: { fontSize: 14, color: Colors.textTertiary, marginTop: 8 },
});
