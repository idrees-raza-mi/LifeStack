import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, Dialog, Portal, TextInput, Button, IconButton, Icon, Chip } from 'react-native-paper';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { PageHeader } from '../../src/components/ui/PageHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useHabitStore } from '../../src/store/habitStore';
import { Habit, HabitLog } from '../../src/types';
import { Colors, HabitColors, HabitIcons } from '../../src/constants';
import { format, isToday } from 'date-fns';

export default function HabitsScreen() {
  const { habits, loadHabits, addHabit, toggleLog, loadLogs, logs } = useHabitStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(HabitIcons[0]);
  const [color, setColor] = useState(HabitColors[0]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    loadHabits();
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = logs.filter(l => l.date === today);

  const isCompletedToday = (habitId: string) => todayLogs.some(l => l.habitId === habitId && l.completed);

  const handleToggle = useCallback(async (habitId: string) => {
    await toggleLog(habitId, today);
  }, [today]);

  const handleAddHabit = async () => {
    if (!name.trim()) return;
    await addHabit({ name, userId: '', icon, color, frequency, reminderEnabled: false, description: '' });
    setDialogVisible(false);
    setName('');
  };

  const renderHabit = ({ item }: { item: Habit }) => {
    const done = isCompletedToday(item.id);
    return (
      <TouchableOpacity
        style={[styles.habitCard, { borderLeftColor: item.color }]}
        onPress={() => handleToggle(item.id)}
        activeOpacity={0.7}
      >
        <Icon source={item.icon} size={28} color={item.color} />
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{item.name}</Text>
          <Text style={styles.habitMeta}>{item.frequency}</Text>
        </View>
        <IconButton
          icon={done ? 'check-circle' : 'circle-outline'}
          iconColor={done ? item.color : Colors.textTertiary}
          size={28}
          onPress={() => handleToggle(item.id)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <PageHeader
        title="Habits"
        subtitle={habits.length > 0 ? `${habits.filter(h => isCompletedToday(h.id)).length}/${habits.length} today` : undefined}
        onAdd={() => setDialogVisible(true)}
      />
      {habits.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No habits yet"
          description="Track your daily habits and build streaks"
          actionLabel="Add Your First Habit"
          onAction={() => setDialogVisible(true)}
        />
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabit}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>New Habit</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Habit name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.dialogInput}
            />
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconRow}>
              {HabitIcons.map(i => (
                <IconButton
                  key={i}
                  icon={i}
                  size={24}
                  selected={icon === i}
                  mode={icon === i ? 'contained' : 'outlined'}
                  onPress={() => setIcon(i)}
                />
              ))}
            </View>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
              {HabitColors.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorSelected]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>
            <View style={styles.freqRow}>
              <Chip
                selected={frequency === 'daily'}
                onPress={() => setFrequency('daily')}
                style={styles.chip}
              >
                Daily
              </Chip>
              <Chip
                selected={frequency === 'weekly'}
                onPress={() => setFrequency('weekly')}
                style={styles.chip}
              >
                Weekly
              </Chip>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddHabit}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 80 },
  habitCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    padding: 16, marginBottom: 8, borderRadius: 12, borderLeftWidth: 3,
    elevation: 1, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2,
  },
  habitInfo: { flex: 1, marginLeft: 12 },
  habitName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  habitMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  dialogInput: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 12 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorSelected: { borderWidth: 3, borderColor: Colors.text },
  freqRow: { flexDirection: 'row', gap: 8 },
  chip: {},
});
