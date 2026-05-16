import { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, Dialog, Portal, TextInput, Button, IconButton, Icon, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { ScreenWrapper, Card } from '../../src/components/ui/ScreenWrapper';
import { PageHeader, StatCard, SectionHeader } from '../../src/components/ui/PageHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useRoutineStore } from '../../src/store/routineStore';
import { Routine } from '../../src/types';
import { Colors, ShadowStyle } from '../../src/constants';
import { format } from 'date-fns';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RoutinesScreen() {
  const { routines, steps, loadRoutines, loadSteps, addRoutine, addStep, removeStep, logRoutine, logs } = useRoutineStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stepInput, setStepInput] = useState('');

  useEffect(() => { loadRoutines(); }, []);

  const today = format(new Date(), 'yyyy-MM-dd');

  const handleAddRoutine = async () => {
    if (!name.trim()) return;
    await addRoutine({ name, userId: '', icon: 'repeat', color: Colors.primary, daysOfWeek: selectedDays, estimatedMinutes: 30, description: '' });
    setDialogVisible(false);
    setName('');
    setSelectedDays([]);
  };

  const handleAddStep = async () => {
    if (!stepInput.trim() || !expandedId) return;
    await addStep({ routineId: expandedId, title: stepInput, durationMinutes: 5, order: steps.length });
    setStepInput('');
  };

  const toggleDay = (d: number) => setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const toggleExpand = (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    loadSteps(id);
  };

  const renderRoutine = ({ item }: { item: Routine }) => {
    const isExpanded = expandedId === item.id;
    const done = logs.some(l => l.routineId === item.id && l.date === today && l.completed);
    return (
      <Card style={styles.routineCard}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.7}>
          <View style={styles.routineHeader}>
            <View style={[styles.routineIconWrap, { backgroundColor: done ? Colors.mintLight : Colors.lavenderLight }]}>
              <Icon source="repeat-variant" size={22} color={done ? Colors.mint : Colors.primary} />
            </View>
            <View style={styles.routineInfo}>
              <Text style={styles.routineName}>{item.name}</Text>
              <Text style={styles.routineMeta}>{item.estimatedMinutes} min</Text>
            </View>
            <TouchableOpacity
              style={[styles.routineCheck, done && { backgroundColor: Colors.mint, borderColor: Colors.mint }]}
              onPress={() => logRoutine(item.id, today, !done)}
            >
              {done && <Icon source="check" size={16} color={Colors.white} />}
            </TouchableOpacity>
          </View>
          <View style={styles.daysRow}>
            {DAYS.map((d, i) => (
              <View key={d} style={[styles.dayPill, item.daysOfWeek.includes(i) && styles.dayPillActive]}>
                <Text style={[styles.dayText, item.daysOfWeek.includes(i) && styles.dayTextActive]}>{d[0]}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.stepsWrap}>
            {steps.map(s => (
              <View key={s.id} style={styles.stepRow}>
                <View style={styles.stepDot} />
                <Text style={styles.stepText}>{s.title}</Text>
                <Text style={styles.stepDuration}>{s.durationMinutes}m</Text>
                <IconButton icon="close" size={16} iconColor={Colors.textTertiary} onPress={() => removeStep(s.id, item.id)} />
              </View>
            ))}
            <View style={styles.addStepRow}>
              <TextInput
                value={stepInput} onChangeText={setStepInput}
                placeholder="Add step..." mode="flat"
                style={styles.stepInput} dense
                underlineStyle={{ display: 'none' }}
              />
              <IconButton icon="plus-circle" size={28} iconColor={Colors.primary} onPress={handleAddStep} />
            </View>
          </View>
        )}
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Icon source="arrow-left" size={22} color={Colors.text} />
      </TouchableOpacity>
      <PageHeader title="Routines" subtitle={`${routines.length} routines`} icon="repeat-variant" />

      <View style={styles.statsRow}>
        <StatCard icon="repeat" label="Total" value={String(routines.length)} color={Colors.primary} />
        <StatCard icon="check-circle" label="Done Today" value={String(logs.filter(l => l.date === today && l.completed).length)} color={Colors.mint} />
      </View>

      {routines.length === 0 ? (
        <EmptyState icon="repeat" title="No routines yet" description="Create morning, evening, or workout routines" />
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
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>New Routine</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Routine name" value={name} onChangeText={setName} mode="outlined" style={styles.dialogInput} outlineStyle={{ borderRadius: 16, borderColor: Colors.cardBorder }} />
            <Text style={styles.label}>Repeat on</Text>
            <View style={styles.daysSelectRow}>
              {DAYS.map((d, i) => (
                <Chip key={d} selected={selectedDays.includes(i)} onPress={() => toggleDay(i)} compact
                  style={[styles.dayChip, selectedDays.includes(i) && styles.dayChipActive]}
                  textStyle={{ fontWeight: '600', fontSize: 12, color: selectedDays.includes(i) ? Colors.white : Colors.textSecondary }}
                  showSelectedOverlay={false}
                >{d}</Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor={Colors.textTertiary}>Cancel</Button>
            <Button onPress={handleAddRoutine} buttonColor={Colors.primary} textColor={Colors.white} style={{ borderRadius: 12 }}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB icon="plus" style={styles.fab} color={Colors.white} onPress={() => setDialogVisible(true)} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  routineCard: { marginBottom: 12 },
  routineHeader: { flexDirection: 'row', alignItems: 'center' },
  routineIconWrap: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  routineInfo: { flex: 1 },
  routineName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  routineMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  routineCheck: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 2, borderColor: Colors.lavender,
    justifyContent: 'center', alignItems: 'center',
  },
  daysRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  dayPill: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, backgroundColor: Colors.lavenderLight,
  },
  dayPillActive: { backgroundColor: Colors.primary },
  dayText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  dayTextActive: { color: Colors.white },
  stepsWrap: { marginTop: 14, borderTopWidth: 1, borderTopColor: Colors.lavenderLight, paddingTop: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.lavender, marginRight: 12 },
  stepText: { flex: 1, fontSize: 14, color: Colors.text },
  stepDuration: { fontSize: 12, color: Colors.textTertiary, fontWeight: '600', marginRight: 4 },
  addStepRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  stepInput: { flex: 1, backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 12 },
  backBtn: { marginBottom: 4, width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.lavenderLight, justifyContent: 'center', alignItems: 'center' },
  dialog: { borderRadius: 28, backgroundColor: Colors.card },
  dialogTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  dialogInput: { marginBottom: 16, backgroundColor: Colors.background },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 10 },
  daysSelectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: { backgroundColor: Colors.lavenderLight, borderRadius: 14, borderWidth: 0 },
  dayChipActive: { backgroundColor: Colors.primary },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: Colors.primary, borderRadius: 20,
    ...ShadowStyle.floating,
  },
});
