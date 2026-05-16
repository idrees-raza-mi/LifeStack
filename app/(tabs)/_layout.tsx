import { Tabs } from 'expo-router';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, ShadowStyle } from '../../src/constants';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.1,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom + 12,
          left: 16,
          right: 16,
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderRadius: 28,
          height: 64,
          paddingBottom: 4,
          paddingTop: 8,
          borderTopWidth: 0,
          ...ShadowStyle.floating,
        },
      }}
    >
      <Tabs.Screen name="habits" options={{ tabBarLabel: 'Habits', tabBarIcon: ({ color, size }) => <Icon source="checkbox-marked-circle-outline" size={24} color={color} /> }} />
      <Tabs.Screen name="tasks" options={{ tabBarLabel: 'Tasks', tabBarIcon: ({ color, size }) => <Icon source="format-list-checks" size={24} color={color} /> }} />
      <Tabs.Screen name="health" options={{ tabBarLabel: 'Health', tabBarIcon: ({ color, size }) => <Icon source="heart-pulse" size={24} color={color} /> }} />
      <Tabs.Screen name="awards" options={{ tabBarLabel: 'Awards', tabBarIcon: ({ color, size }) => <Icon source="trophy" size={24} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <Icon source="account-circle" size={24} color={color} /> }} />
    </Tabs>
  );
}
