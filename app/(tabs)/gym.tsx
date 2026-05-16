import { useEffect, useState } from 'react';
import { View, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, Dialog, Portal, TextInput, Button, IconButton, Icon, Chip, Divider } from 'react-native-paper';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { PageHeader } from '../../src/components/ui/PageHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useGymStore } from '../../src/store/gymStore';
import { WorkoutSession, WorkoutSet, Exercise } from '../../src/types';
import { Colors } from '../../src/constants';
import { format } from 'date-fns';

export default function GymScreen() {
  const {
    sessions, currentSession, currentSets, exercises,
    loadSessions, loadExercises, startSession, endSession,
    loadSessionSets, addSet, toggleSet, removeSet, deleteSession,
  } = useGymStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [endDialogVisible, setEndDialogVisible] = useState(false);
  const [duration, setDuration] = useState('');
  const [endNotes, setEndNotes] = useState('');

  useEffect(() => {
    loadSessions();
    loadExercises();
  }, []);

  const handleStartSession = async () => {
    if (!sessionName.trim()) return;
    await startSession(sessionName);
    setDialogVisible(false);
    setSessionName('');
  };

  const handleEndSession = async () => {
    await endSession(duration ? parseInt(duration) : 0, endNotes || undefined);
    setEndDialogVisible(false);
    setDuration('');
    setEndNotes('');
  };

  const handleAddSet = async () => {
    if (!activeExercise || !reps || !weight) return;
    const ex = exercises.find(e => e.id === activeExercise);
    if (!ex) return;
    await addSet({ id: ex.id, name: ex.name }, parseInt(reps), parseFloat(weight));
    setReps('');
    setWeight('');
  };

  const renderSession = ({ item }: { item: WorkoutSession }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => { loadSessionSets(item.id); }}
      activeOpacity={0.7}
    >
      <View style={styles.sessionHeader}>
        <View>
          <Text style={styles.sessionName}>{item.name}</Text>
          <Text style={styles.sessionDate}>{format(new Date(item.date), 'MMM d, yyyy')}</Text>
        </View>
        <Text style={styles.sessionDuration}>{item.durationMinutes} min</Text>
      </View>
      {item.notes && <Text style={styles.sessionNotes}>{item.notes}</Text>}
    </TouchableOpacity>
  );

  if (currentSession) {
    const groupedSets: Record<string, WorkoutSet[]> = {};
    currentSets.forEach(s => {
      if (!groupedSets[s.exerciseId]) groupedSets[s.exerciseId] = [];
      groupedSets[s.exerciseId].push(s);
    });

    return (
      <ScreenWrapper>
        <View style={styles.activeHeader}>
          <View>
            <Text style={styles.activeTitle}>{currentSession.name}</Text>
            <Text style={styles.activeDate}>{format(new Date(), 'MMM d, yyyy')}</Text>
          </View>
          <Button mode="contained" onPress={() => setEndDialogVisible(true)} compact>
            End
          </Button>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          <View style={styles.exerciseGrid}>
            {exercises.map(ex => {
              const sets = currentSets.filter(s => s.exerciseId === ex.id);
              const doneSets = sets.filter(s => s.done).length;
              return (
                <Chip
                  key={ex.id}
                  selected={activeExercise === ex.id}
                  onPress={() => setActiveExercise(ex.id)}
                  style={styles.exerciseChip}
                  compact
                >
                  {ex.name} {sets.length > 0 ? `(${doneSets}/${sets.length})` : ''}
                </Chip>
              );
            })}
          </View>

          {activeExercise && (
            <View style={styles.addSetCard}>
              <Text style={styles.exerciseName}>
                {exercises.find(e => e.id === activeExercise)?.name}
              </Text>
              <View style={styles.setInputs}>
                <TextInput
                  label="Reps"
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                  mode="outlined"
                  dense
                  style={styles.setInput}
                />
                <TextInput
                  label="Weight (kg)"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  dense
                  style={styles.setInput}
                />
                <IconButton icon="plus-circle" size={36} iconColor={Colors.primary} onPress={handleAddSet} />
              </View>

              {groupedSets[activeExercise]?.map(s => (
                <View key={s.id} style={styles.setRow}>
                  <Text style={styles.setLabel}>Set {s.setNumber}</Text>
                  <Text style={styles.setDetail}>{s.reps} reps × {s.weightKg} kg</Text>
                  <IconButton
                    icon={s.done ? 'check-circle' : 'circle-outline'}
                    iconColor={s.done ? Colors.tertiary : Colors.textTertiary}
                    size={24}
                    onPress={() => toggleSet(s.id)}
                  />
                </View>
              ))}
            </View>
          )}

          {currentSets.length > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Text>Total sets: {currentSets.length}</Text>
              <Text>Completed: {currentSets.filter(s => s.done).length}</Text>
            </View>
          )}
        </ScrollView>

        <Portal>
          <Dialog visible={endDialogVisible} onDismiss={() => setEndDialogVisible(false)}>
            <Dialog.Title>End Workout</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Duration (minutes)"
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
                mode="outlined"
                style={styles.dialogInput}
              />
              <TextInput
                label="Notes (optional)"
                value={endNotes}
                onChangeText={setEndNotes}
                mode="outlined"
                multiline
                numberOfLines={2}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setEndDialogVisible(false)}>Cancel</Button>
              <Button onPress={handleEndSession}>Save & End</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <PageHeader
        title="Gym"
        subtitle={`${sessions.length} workouts`}
        onAdd={() => setDialogVisible(true)}
      />
      {sessions.length === 0 ? (
        <EmptyState
          icon="💪"
          title="No workouts yet"
          description="Track your gym sessions, sets, and reps"
          actionLabel="Start Workout"
          onAction={() => setDialogVisible(true)}
        />
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="dumbbell"
        label="Start Workout"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>New Workout</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Workout name"
              value={sessionName}
              onChangeText={setSessionName}
              mode="outlined"
              placeholder="e.g. Upper Body"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleStartSession}>Start</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 100 },
  scroll: { paddingBottom: 40 },
  fab: { position: 'absolute', right: 16, bottom: 80, borderRadius: 16 },
  sessionCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 8,
    elevation: 1, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2,
  },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  sessionDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sessionDuration: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  sessionNotes: { fontSize: 13, color: Colors.textSecondary, marginTop: 8 },
  activeHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, paddingBottom: 8,
  },
  activeTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  activeDate: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 12, marginTop: 8 },
  exerciseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  exerciseChip: {},
  addSetCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
  exerciseName: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  setInputs: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  setInput: { flex: 1 },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  setLabel: { width: 50, fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  setDetail: { flex: 1, fontSize: 14, color: Colors.text },
  summaryCard: { backgroundColor: Colors.surfaceVariant, borderRadius: 12, padding: 16 },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  dialogInput: { marginBottom: 12 },
});
