import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, ShadowStyle, TAB_BAR_HEIGHT } from '../../constants';

interface ScreenWrapperProps {
  children: React.ReactNode;
  padding?: boolean;
  scroll?: boolean;
  noTab?: boolean;
  onFabPress?: () => void;
  fabIcon?: string;
}

export function ScreenWrapper({ children, padding = true, scroll = false, noTab = false, onFabPress, fabIcon = 'plus' }: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const tabH = noTab ? 0 : TAB_BAR_HEIGHT;
  const fabBottom = noTab ? 24 : TAB_BAR_HEIGHT + insets.bottom + 16;

  const content = (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top + (padding ? 8 : 0),
        paddingBottom: tabH + insets.bottom + (padding ? 8 : 0),
        paddingLeft: insets.left + (padding ? 16 : 0),
        paddingRight: insets.right + (padding ? 16 : 0),
      },
    ]}>
      {children}
    </View>
  );

  const fabEl = onFabPress ? (
    <TouchableOpacity
      style={[styles.fab, { bottom: fabBottom }]}
      onPress={onFabPress}
      activeOpacity={0.8}
    >
      <Icon source={fabIcon as any} size={28} color={Colors.white} />
    </TouchableOpacity>
  ) : null;

  if (scroll) {
    return (
      <View style={styles.wrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={true}
        >
          {content}
        </ScrollView>
        {fabEl}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {content}
      {fabEl}
    </View>
  );
}

export function Card({ children, style, elevated = false }: { children: React.ReactNode; style?: any; elevated?: boolean }) {
  return (
    <View style={[styles.card, elevated && ShadowStyle.elevated, style]}>
      {children}
    </View>
  );
}

export function GradientCard({ children, colors, style }: { children: React.ReactNode; colors: string[]; style?: any }) {
  return (
    <View style={[styles.gradientCard, { backgroundColor: colors[0] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    ...ShadowStyle.card,
  },
  gradientCard: {
    borderRadius: 24,
    padding: 20,
    ...ShadowStyle.card,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C6FCD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C6FCD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
});
