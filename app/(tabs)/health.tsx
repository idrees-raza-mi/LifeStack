import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Icon, Dialog, Portal } from 'react-native-paper';
import { ScreenWrapper, Card } from '../../src/components/ui/ScreenWrapper';
import { PageHeader, StatCard, SectionHeader } from '../../src/components/ui/PageHeader';
import { ProgressCard } from '../../src/components/ui/StatCard';
import { Colors, ShadowStyle, MoodEmojis, WaterIntakeGoal, StepGoal, SleepGoal } from '../../src/constants';
import { useHealthStore } from '../../src/store/healthStore';
import { format } from 'date-fns';

export default function HealthScreen() {
  const { entries, loadEntries, getEntry, saveEntry } = useHealthStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [steps, setSteps] = useState('');
  const [water, setWater] = useState('');
  const [sleep, setSleep] = useState('');
  const [weight, setWeight] = useState('');
  const [mood, setMood] = useState(2);
  const [calories, setCalories] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    const start = format(new Date().setDate(new Date().getDate() - 7), 'yyyy-MM-dd');
    loadEntries(start, today);
  }, []);

  useEffect(() => {
    const entry = getEntry(today);
    if (entry) {
      setSteps(entry.steps?.toString() || '');
      setWater(entry.waterMl?.toString() || '');
      setSleep(entry.sleepHours?.toString() || '');
      setWeight(entry.weightKg?.toString() || '');
      setCalories(entry.calories?.toString() || '');
    }
  }, [entries]);

  const current = getEntry(today);
  const stepsProgress = current?.steps ? Math.min((current.steps / StepGoal) * 100, 100) : 0;
  const waterProgress = current?.waterMl ? Math.min((current.waterMl / WaterIntakeGoal) * 100, 100) : 0;
  const sleepProgress = current?.sleepHours ? Math.min((current.sleepHours / SleepGoal) * 100, 100) : 0;

  const handleSave = async () => {
    await saveEntry(today, {
      steps: steps ? parseInt(steps) : undefined,
      waterMl: water ? parseInt(water) : undefined,
      sleepHours: sleep ? parseFloat(sleep) : undefined,
      weightKg: weight ? parseFloat(weight) : undefined,
      calories: calories ? parseInt(calories) : undefined,
    });
    setDialogVisible(false);
  };

  return (
    <ScreenWrapper
      scroll
      onFabPress={() => setDialogVisible(true)}
    >
      <PageHeader title="Health" subtitle={format(new Date(), 'EEEE, MMM d')} icon="heart-pulse" />

      <View style={styles.moodRow}>
        {MoodEmojis.map((emoji, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.moodBtn, mood === i && styles.moodBtnActive]}
            onPress={() => setMood(i)}
          >
            <Text style={styles.moodEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ProgressCard icon="walk" label="Steps" progress={stepsProgress} color={Colors.primary} current={current?.steps || 0} goal={StepGoal} />
      <ProgressCard icon="water" label="Water" progress={waterProgress} color={Colors.skyBlue} current={current?.waterMl || 0} goal={WaterIntakeGoal} unit="ml" />
      <ProgressCard icon="fire" label="Calories" progress={current?.calories ? Math.min((current.calories / 2000) * 100, 100) : 0} color={Colors.accent} current={current?.calories || 0} goal={2000} unit="kcal" />
      <ProgressCard icon="bed" label="Sleep" progress={sleepProgress} color={Colors.lavender} current={current?.sleepHours || 0} goal={SleepGoal} unit="hrs" />

      <SectionHeader title="Today's Entry" />
      <Card style={styles.entryCard}>
        <View style={styles.inputGrid}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Steps</Text>
            <TextInput value={steps} onChangeText={setSteps} keyboardType="number-pad" mode="outlined" dense
              outlineStyle={{ borderRadius: 14, borderColor: Colors.cardBorder }}
              style={styles.input} placeholder="0" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Water (ml)</Text>
            <TextInput value={water} onChangeText={setWater} keyboardType="number-pad" mode="outlined" dense
              outlineStyle={{ borderRadius: 14, borderColor: Colors.cardBorder }}
              style={styles.input} placeholder="0" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Calories</Text>
            <TextInput value={calories} onChangeText={setCalories} keyboardType="number-pad" mode="outlined" dense
              outlineStyle={{ borderRadius: 14, borderColor: Colors.cardBorder }}
              style={styles.input} placeholder="0" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sleep (hrs)</Text>
            <TextInput value={sleep} onChangeText={setSleep} keyboardType="decimal-pad" mode="outlined" dense
              outlineStyle={{ borderRadius: 14, borderColor: Colors.cardBorder }}
              style={styles.input} placeholder="0" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput value={weight} onChangeText={setWeight} keyboardType="decimal-pad" mode="outlined" dense
              outlineStyle={{ borderRadius: 14, borderColor: Colors.cardBorder }}
              style={styles.input} placeholder="0" />
          </View>
        </View>
        <Button mode="contained" onPress={handleSave}
          buttonColor={Colors.primary} textColor={Colors.white}
          style={{ borderRadius: 16, marginTop: 8 }}
          contentStyle={{ paddingVertical: 6 }}
        >Save Entry</Button>
      </Card>
      <View style={{ height: 80 }} />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>New Health Entry</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Steps" value={steps} onChangeText={setSteps} keyboardType="number-pad" mode="outlined" style={styles.dialogInput} outlineStyle={{ borderRadius: 16, borderColor: Colors.cardBorder }} />
            <TextInput label="Water (ml)" value={water} onChangeText={setWater} keyboardType="number-pad" mode="outlined" style={styles.dialogInput} outlineStyle={{ borderRadius: 16, borderColor: Colors.cardBorder }} />
            <TextInput label="Calories" value={calories} onChangeText={setCalories} keyboardType="number-pad" mode="outlined" style={styles.dialogInput} outlineStyle={{ borderRadius: 16, borderColor: Colors.cardBorder }} />
            <TextInput label="Sleep (hrs)" value={sleep} onChangeText={setSleep} keyboardType="decimal-pad" mode="outlined" style={styles.dialogInput} outlineStyle={{ borderRadius: 16, borderColor: Colors.cardBorder }} />
            <TextInput label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" mode="outlined" style={styles.dialogInput} outlineStyle={{ borderRadius: 16, borderColor: Colors.cardBorder }} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor={Colors.textTertiary}>Cancel</Button>
            <Button onPress={handleSave} buttonColor={Colors.primary} textColor={Colors.white} style={{ borderRadius: 12 }}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  moodRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 },
  moodBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center',
    ...ShadowStyle.card,
  },
  moodBtnActive: { backgroundColor: Colors.lavenderLight, ...ShadowStyle.elevated },
  moodEmoji: { fontSize: 24 },
  entryCard: { marginBottom: 16 },
  inputGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  inputGroup: { width: '46%' },
  inputLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4, fontWeight: '600' },
  input: { backgroundColor: Colors.background },
  dialog: { borderRadius: 28, backgroundColor: Colors.card },
  dialogTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  dialogInput: { marginBottom: 12, backgroundColor: Colors.background },
});
