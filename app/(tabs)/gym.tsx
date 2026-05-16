import { useEffect, useState } from 'react';
import { View, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, Dialog, Portal, TextInput, Button, IconButton, Icon, Chip } from 'react-native-paper';
import { ScreenWrapper, Card } from '../../src/components/ui/ScreenWrapper';
import { PageHeader, StatCard, SectionHeader } from '../../src/components/ui/PageHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useGymStore } from '../../src/store/gymStore';
import { WorkoutSession, WorkoutSet, Exercise } from '../../src/types';
import { Colors, ShadowStyle } from '../../src/constants';
import { format } from 'date-fns';

export default function GymScreen() {
  const { sessions, currentSession, currentSets, exercises, loadSessions, loadExercises, startSession, endSession, loadSessionSets, addSet, toggleSet, deleteSession } = useGymStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [endDialogVisible, setEndDialogVisible] = useState(false);
  const [duration, setDuration] = useState('');

  useEffect(() => { loadSessions(); loadExercises(); }, []);

  const handleStart = async () => {
    if (!sessionName.trim()) return;
    await startSession(sessionName);
    setDialogVisible(false);
    setSessionName('');
  };

  const handleEnd = async () => {
    await endSession(duration ? parseInt(duration) : 0);
    setEndDialogVisible(false);
    setDuration('');
  };

  const handleAddSet = async () => {
    if (!activeExercise || !reps || !weight) return;
    const ex = exercises.find(e => e.id === activeExercise);
    if (!ex) return;
    await addSet({ id: ex.id, name: ex.name }, parseInt(reps), parseFloat(weight));
    setReps('');
    setWeight('');
  };

  if (currentSession) {
    const groupedSets: Record<string, WorkoutSet[]> = {};
    currentSets.forEach(s => { if (!groupedSets[s.exerciseId]) groupedSets[s.exerciseId] = []; groupedSets[s.exerciseId].push(s); });

    return (
      <ScreenWrapper>
        <View style={styles.activeHeader}>
          <View>
            <Text style={styles.activeTitle}>{currentSession.name}</Text>
            <Text style={styles.activeDate}>{format(new Date(), 'MMM d, yyyy')}</Text>
          </View>
          <Button mode="contained" onPress={() => setEndDialogVisible(true)} buttonColor={Colors.accent} textColor={Colors.white} style={{ borderRadius: 16 }} compact>End</Button>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <SectionHeader title="Exercises" />
          <View style={styles.exerciseGrid}>
            {exercises.map(ex => {
              const sets = currentSets.filter(s => s.exerciseId === ex.id);
              const done = sets.filter(s => s.done).length;
              return (
                <Chip key={ex.id} selected={activeExercise === ex.id} onPress={() => setActiveExercise(ex.id)}
                  style={[styles.exChip, activeExercise === ex.id && styles.exChipActive]}
                  textStyle={{ fontWeight: '600', fontSize: 11, color: activeExercise === ex.id ? Colors.white : Colors.textSecondary }}
                  showSelectedOverlay={false}
                  compact
                >{ex.name} {sets.length > 0 ? `(${done}/${sets.length})` : ''}</Chip>
              );
            })}
          </View>

          {activeExercise && (
            <Card style={styles.addSetCard}>
              <Text style={styles.exName}>{exercises.find(e => e.id === activeExercise)?.name}</Text>
              <View style={styles.setInputs}>
                <TextInput label="Reps" value={reps} onChangeText={setReps} keyboardType="number-pad" mode="outlined" dense
                  outlineStyle={{ borderRadius: 14, borderColor: Colors.cardBorder }} style={styles.setInput} />
                <TextInput label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" mode="outlined" dense
                  outlineStyle={{ borderRadius: 14, borderColor: Colors.cardBorder }} style={styles.setInput} />
                <IconButton icon="plus-circle" size={36} iconColor={Colors.primary} onPress={handleAddSet} />
              </View>
              {groupedSets[activeExercise]?.map(s => (
                <View key={s.id} style={styles.setRow}>
                  <Text style={styles.setLabel}>Set {s.setNumber}</Text>
                  <Text style={styles.setDetail}>{s.reps} reps × {s.weightKg}kg</Text>
                  <IconButton icon={s.done ? 'check-circle' : 'circle-outline'} iconColor={s.done ? Colors.mint : Colors.textTertiary} size={24} onPress={() => toggleSet(s.id)} />
                </View>
              ))}
            </Card>
          )}

          {currentSets.length > 0 && (
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <StatCard icon="dumbbell" label="Total Sets" value={String(currentSets.length)} color={Colors.primary} />
              <StatCard icon="check-circle" label="Completed" value={String(currentSets.filter(s => s.done).length)} color={Colors.mint} />
            </Card>
          )}
        </ScrollView>

        <Portal>
          <Dialog visible={endDialogVisible} onDismiss={() => setEndDialogVisible(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>End Workout</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Duration (minutes)" value={duration} onChangeText={setDuration} keyboardType="number-pad" mode="outlined" outlineStyle={{ borderRadius: 16, borderColor: Colors.cardBorder }} />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setEndDialogVisible(false)} textColor={Colors.textTertiary}>Cancel</Button>
              <Button onPress={handleEnd} buttonColor={Colors.primary} textColor={Colors.white} style={{ borderRadius: 12 }}>Save & End</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <PageHeader title="Gym" subtitle={`${sessions.length} workouts`} icon="dumbbell" />
      <View style={styles.statsRow}>
        <StatCard icon="dumbbell" label="Workouts" value={String(sessions.length)} color={Colors.primary} />
        <StatCard icon="fire" label="This Week" value="3" color={Colors.accent} />
      </View>
      {sessions.length === 0 ? (
        <EmptyState icon="dumbbell" title="No workouts yet" description="Start tracking your gym sessions" />
      ) : (
        <FlatList data={sessions} renderItem={({ item }) => (
          <Card style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View>
                <Text style={styles.sessionName}>{item.name}</Text>
                <Text style={styles.sessionDate}>{format(new Date(item.date), 'MMM d, yyyy')}</Text>
              </View>
              <Text style={styles.sessionDuration}>{item.durationMinutes} min</Text>
            </View>
            {item.notes && <Text style={styles.sessionNotes}>{item.notes}</Text>}
          </Card>
        )} keyExtractor={item => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={styles.list} />
      )}
      <FAB icon="dumbbell" label="Start" style={styles.fab} color={Colors.white} onPress={() => setDialogVisible(true)} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 100 },
  scroll: { paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: Colors.primary, borderRadius: 20, ...ShadowStyle.floating },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  activeTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  activeDate: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  exerciseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  exChip: { backgroundColor: Colors.lavenderLight, borderRadius: 14, borderWidth: 0 },
  exChipActive: { backgroundColor: Colors.primary },
  addSetCard: { marginBottom: 16 },
  exName: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  setInputs: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  setInput: { flex: 1, backgroundColor: Colors.background },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  setLabel: { width: 50, fontSize: 14, color: Colors.textTertiary, fontWeight: '600' },
  setDetail: { flex: 1, fontSize: 14, color: Colors.text },
  summaryCard: { marginTop: 8 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  sessionCard: { marginBottom: 8 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  sessionDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sessionDuration: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  sessionNotes: { fontSize: 13, color: Colors.textSecondary, marginTop: 8 },
  dialog: { borderRadius: 28, backgroundColor: Colors.card },
  dialogTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
});
