import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, ShadowStyle } from '../../constants';

interface ScreenWrapperProps {
  children: React.ReactNode;
  padding?: boolean;
  scroll?: boolean;
  noTab?: boolean;
}

export function ScreenWrapper({ children, padding = true, scroll = false, noTab = false }: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = noTab ? 0 : 72;

  const content = (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top + (padding ? 8 : 0),
        paddingBottom: tabBarHeight + insets.bottom + (padding ? 8 : 0),
        paddingLeft: insets.left + (padding ? 20 : 0),
        paddingRight: insets.right + (padding ? 20 : 0),
      },
    ]}>
      {children}
    </View>
  );

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
      </View>
    );
  }

  return <View style={styles.wrapper}>{content}</View>;
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
    borderRadius: 24,
    padding: 20,
    ...ShadowStyle.card,
  },
  gradientCard: {
    borderRadius: 24,
    padding: 20,
    ...ShadowStyle.card,
  },
});
