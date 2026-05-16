import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Colors } from '../../constants';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button mode="contained" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '600', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  description: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  button: { marginTop: 8 },
});
