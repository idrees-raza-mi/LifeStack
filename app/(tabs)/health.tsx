import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, IconButton, Icon } from 'react-native-paper';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { PageHeader } from '../../src/components/ui/PageHeader';
import { StatCard } from '../../src/components/ui/StatCard';
import { useHealthStore } from '../../src/store/healthStore';
import { Colors } from '../../src/constants';
import { format } from 'date-fns';

export default function HealthScreen() {
  const { entries, loadEntries, getEntry, saveEntry } = useHealthStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [steps, setSteps] = useState('');
  const [water, setWater] = useState('');
  const [calories, setCalories] = useState('');
  const [sleep, setSleep] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const start = format(new Date().setDate(new Date().getDate() - 7), 'yyyy-MM-dd');
    loadEntries(start, today);
  }, []);

  useEffect(() => {
    const entry = getEntry(today);
    if (entry) {
      setSteps(entry.steps?.toString() || '');
      setWater(entry.waterMl?.toString() || '');
      setCalories(entry.calories?.toString() || '');
      setSleep(entry.sleepHours?.toString() || '');
      setWeight(entry.weightKg?.toString() || '');
      setNotes(entry.notes || '');
    }
  }, [entries]);

  const handleSave = async () => {
    await saveEntry(today, {
      steps: steps ? parseInt(steps) : undefined,
      waterMl: water ? parseInt(water) : undefined,
      calories: calories ? parseInt(calories) : undefined,
      sleepHours: sleep ? parseFloat(sleep) : undefined,
      weightKg: weight ? parseFloat(weight) : undefined,
      notes: notes || undefined,
    });
  };

  const current = getEntry(today);

  return (
    <ScreenWrapper>
      <PageHeader title="Health" subtitle={format(new Date(), 'MMM d, yyyy')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <StatCard icon="walk" label="Steps" value={current?.steps ?? 0} color={Colors.primary} />
            <StatCard icon="fire" label="Calories" value={current?.calories ?? 0} unit="kcal" color={Colors.error} />
          </View>
          <View style={styles.statCol}>
            <StatCard icon="water" label="Water" value={current?.waterMl ?? 0} unit="ml" color={Colors.tertiary} />
            <StatCard icon="bed" label="Sleep" value={current?.sleepHours ?? 0} unit="hrs" color={Colors.secondary} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's Entry</Text>

        <View style={styles.inputGrid}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Steps</Text>
            <TextInput
              value={steps}
              onChangeText={setSteps}
              keyboardType="number-pad"
              mode="outlined"
              dense
              placeholder="0"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Water (ml)</Text>
            <TextInput
              value={water}
              onChangeText={setWater}
              keyboardType="number-pad"
              mode="outlined"
              dense
              placeholder="0"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Calories</Text>
            <TextInput
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
              mode="outlined"
              dense
              placeholder="0"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sleep (hrs)</Text>
            <TextInput
              value={sleep}
              onChangeText={setSleep}
              keyboardType="decimal-pad"
              mode="outlined"
              dense
              placeholder="0"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              mode="outlined"
              dense
              placeholder="0"
            />
          </View>
        </View>

        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.notesInput}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          Save Entry
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 80 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCol: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 16 },
  inputGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  inputGroup: { width: '47%' },
  inputLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4, fontWeight: '500' },
  notesInput: { marginBottom: 16 },
  saveButton: { borderRadius: 8 },
  saveButtonContent: { paddingVertical: 6 },
});
