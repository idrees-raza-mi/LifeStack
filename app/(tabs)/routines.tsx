import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, Dialog, Portal, TextInput, Button, IconButton, Icon, Chip, Switch } from 'react-native-paper';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { PageHeader } from '../../src/components/ui/PageHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useRoutineStore } from '../../src/store/routineStore';
import { Routine } from '../../src/types';
import { Colors, HabitColors } from '../../src/constants';
import { format } from 'date-fns';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RoutinesScreen() {
  const { routines, steps, loadRoutines, loadSteps, addRoutine, deleteRoutine, addStep, removeStep, logRoutine, logs } = useRoutineStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);
  const [stepInput, setStepInput] = useState('');

  useEffect(() => { loadRoutines(); }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = logs.filter(l => l.date === today);

  const handleAddRoutine = async () => {
    if (!name.trim()) return;
    await addRoutine({
      name, userId: '', icon: 'repeat', color: HabitColors[0],
      daysOfWeek: selectedDays, estimatedMinutes: 30, description: '',
    });
    setDialogVisible(false);
    setName('');
    setSelectedDays([]);
  };

  const handleAddStep = async () => {
    if (!stepInput.trim() || !expandedRoutine) return;
    await addStep({ routineId: expandedRoutine, title: stepInput, durationMinutes: 5, order: steps.length });
    setStepInput('');
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleExpand = (routineId: string) => {
    if (expandedRoutine === routineId) {
      setExpandedRoutine(null);
    } else {
      setExpandedRoutine(routineId);
      loadSteps(routineId);
    }
  };

  const handleLog = async (routineId: string) => {
    const existing = todayLogs.find(l => l.routineId === routineId);
    await logRoutine(routineId, today, !existing?.completed);
  };

  const renderRoutine = ({ item }: { item: Routine }) => {
    const isExpanded = expandedRoutine === item.id;
    const done = todayLogs.some(l => l.routineId === item.id && l.completed);
    return (
      <View style={styles.routineCard}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.7}>
          <View style={styles.routineHeader}>
            <Icon source={item.icon} size={24} color={item.color} />
            <View style={styles.routineInfo}>
              <Text style={styles.routineName}>{item.name}</Text>
              <Text style={styles.routineMeta}>{item.estimatedMinutes} min</Text>
            </View>
            <IconButton
              icon={done ? 'check-circle' : 'circle-outline'}
              iconColor={done ? Colors.tertiary : Colors.textTertiary}
              size={28}
              onPress={() => handleLog(item.id)}
            />
          </View>
          <View style={styles.daysRow}>
            {DAYS.map((d, i) => (
              <View key={d} style={[styles.dayPill, item.daysOfWeek.includes(i) && styles.dayActive]}>
                <Text style={[styles.dayText, item.daysOfWeek.includes(i) && styles.dayTextActive]}>
                  {d[0]}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.stepsContainer}>
            {steps.map(s => (
              <View key={s.id} style={styles.step}>
                <Icon source="circle-small" size={20} color={Colors.textSecondary} />
                <Text style={styles.stepText}>{s.title}</Text>
                <Text style={styles.stepDuration}>{s.durationMinutes}m</Text>
                <IconButton icon="close" size={16} onPress={() => removeStep(s.id, item.id)} />
              </View>
            ))}
            <View style={styles.addStepRow}>
              <TextInput
                value={stepInput}
                onChangeText={setStepInput}
                placeholder="Add step..."
                mode="flat"
                style={styles.stepInput}
                dense
              />
              <IconButton icon="plus" size={20} onPress={handleAddStep} />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <PageHeader
        title="Routines"
        subtitle={`${routines.length} routines`}
        onAdd={() => setDialogVisible(true)}
      />
      {routines.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="No routines yet"
          description="Build morning, evening, or workout routines"
          actionLabel="Create a Routine"
          onAction={() => setDialogVisible(true)}
        />
      ) : (
        <FlatList
          data={routines}
          renderItem={renderRoutine}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>New Routine</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Routine name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.dialogInput}
            />
            <Text style={styles.label}>Repeat on</Text>
            <View style={styles.daysSelectRow}>
              {DAYS.map((d, i) => (
                <Chip
                  key={d}
                  selected={selectedDays.includes(i)}
                  onPress={() => toggleDay(i)}
                  compact
                  style={styles.dayChip}
                >
                  {d}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddRoutine}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 80 },
  routineCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12,
    elevation: 1, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2,
  },
  routineHeader: { flexDirection: 'row', alignItems: 'center' },
  routineInfo: { flex: 1, marginLeft: 12 },
  routineName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  routineMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  daysRow: { flexDirection: 'row', gap: 4, marginTop: 12 },
  dayPill: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    backgroundColor: Colors.surfaceVariant,
  },
  dayActive: { backgroundColor: Colors.primaryContainer },
  dayText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  dayTextActive: { color: Colors.onPrimaryContainer },
  stepsContainer: { marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.outline, paddingTop: 12 },
  step: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  stepText: { flex: 1, fontSize: 14, color: Colors.text },
  stepDuration: { fontSize: 12, color: Colors.textSecondary, marginRight: 8 },
  addStepRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  stepInput: { flex: 1, backgroundColor: 'transparent' },
  dialogInput: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  daysSelectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayChip: {},
});
