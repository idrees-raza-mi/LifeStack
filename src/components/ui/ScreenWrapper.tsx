import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants';

interface ScreenWrapperProps {
  children: React.ReactNode;
  padding?: boolean;
}

export function ScreenWrapper({ children, padding = true }: ScreenWrapperProps) {
  return (
    <View style={[styles.container, padding && styles.padding]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  padding: { padding: 16 },
});
