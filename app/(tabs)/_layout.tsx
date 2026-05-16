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
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 0.1,
          marginTop: 1,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom + 12,
          left: 12,
          right: 12,
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderRadius: 28,
          height: 64,
          paddingBottom: 4,
          paddingTop: 6,
          paddingHorizontal: 4,
          borderTopWidth: 0,
          ...ShadowStyle.floating,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        tabBarItemStyle: {
          paddingHorizontal: 2,
        },
      }}
    >
      <Tabs.Screen name="habits" options={{ tabBarLabel: 'Habits', tabBarIcon: ({ color, size }) => <Icon source="checkbox-marked-circle-outline" size={20} color={color} /> }} />
      <Tabs.Screen name="tasks" options={{ tabBarLabel: 'Tasks', tabBarIcon: ({ color, size }) => <Icon source="format-list-checks" size={20} color={color} /> }} />
      <Tabs.Screen name="goals" options={{ tabBarLabel: 'Goals', tabBarIcon: ({ color, size }) => <Icon source="target" size={20} color={color} /> }} />
      <Tabs.Screen name="routines" options={{ tabBarLabel: 'Routines', tabBarIcon: ({ color, size }) => <Icon source="repeat-variant" size={20} color={color} /> }} />
      <Tabs.Screen name="health" options={{ tabBarLabel: 'Health', tabBarIcon: ({ color, size }) => <Icon source="heart-pulse" size={20} color={color} /> }} />
      <Tabs.Screen name="gym" options={{ tabBarLabel: 'Gym', tabBarIcon: ({ color, size }) => <Icon source="dumbbell" size={20} color={color} /> }} />
      <Tabs.Screen name="awards" options={{ tabBarLabel: 'Awards', tabBarIcon: ({ color, size }) => <Icon source="trophy" size={20} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <Icon source="account-circle" size={20} color={color} /> }} />
    </Tabs>
  );
}
