import { Tabs } from 'expo-router';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.outline,
          borderTopWidth: 1,
          paddingBottom: 4 + insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="habits"
        options={{
          tabBarLabel: 'Habits',
          tabBarIcon: ({ color, size }) => <Icon source="checkbox-marked-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color, size }) => <Icon source="format-list-checks" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          tabBarLabel: 'Goals',
          tabBarIcon: ({ color, size }) => <Icon source="target" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          tabBarLabel: 'Routines',
          tabBarIcon: ({ color, size }) => <Icon source="repeat" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          tabBarLabel: 'Health',
          tabBarIcon: ({ color, size }) => <Icon source="heart-pulse" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gym"
        options={{
          tabBarLabel: 'Gym',
          tabBarIcon: ({ color, size }) => <Icon source="dumbbell" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
