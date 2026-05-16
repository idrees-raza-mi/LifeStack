import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { Colors } from '../../constants';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
}

export function PageHeader({ title, subtitle, onAdd }: PageHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onAdd && (
        <IconButton icon="plus" mode="contained" size={24} onPress={onAdd} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16,
  },
  textContainer: { flex: 1 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
});
