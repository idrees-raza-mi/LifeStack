import { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, Dialog, Portal, TextInput, Button, IconButton, Icon, ProgressBar } from 'react-native-paper';
import { ScreenWrapper, Card } from '../../src/components/ui/ScreenWrapper';
import { PageHeader, SectionHeader, StatCard } from '../../src/components/ui/PageHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useGoalStore } from '../../src/store/goalStore';
import { Goal } from '../../src/types';
import { Colors, ShadowStyle } from '../../src/constants';

export default function GoalsScreen() {
  const { goals, milestones, loadGoals, loadMilestones, addGoal, addMilestone, toggleMilestone, deleteGoal } = useGoalStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [milestoneInput, setMilestoneInput] = useState('');

  useEffect(() => { loadGoals(); }, []);

  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;

  const handleAddGoal = async () => {
    if (!title.trim()) return;
    await addGoal({ title, userId: '', status: 'active', description: description || undefined });
    setDialogVisible(false);
    setTitle('');
    setDescription('');
  };

  const handleAddMilestone = async () => {
    if (!milestoneInput.trim() || !expandedId) return;
    await addMilestone({ goalId: expandedId, title: milestoneInput, order: milestones.length });
    setMilestoneInput('');
  };

  const toggleExpand = (goalId: string) => {
    if (expandedId === goalId) { setExpandedId(null); return; }
    setExpandedId(goalId);
    loadMilestones(goalId);
  };

  const renderGoal = ({ item }: { item: Goal }) => {
    const isExpanded = expandedId === item.id;
    return (
      <Card style={styles.goalCard}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.7}>
          <View style={styles.goalHeader}>
            <View style={[styles.goalIconWrap, { backgroundColor: item.status === 'completed' ? Colors.mintLight : Colors.lavenderLight }]}>
              <Icon source="target" size={22} color={item.status === 'completed' ? Colors.mint : Colors.primary} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>{item.title}</Text>
              {item.description && <Text style={styles.goalDesc}>{item.description}</Text>}
            </View>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.progress === 100 ? Colors.mint : Colors.primary }]} />
            </View>
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.milestonesWrap}>
            {milestones.map(ms => (
              <TouchableOpacity key={ms.id} style={styles.milestoneRow} onPress={() => toggleMilestone(ms.id, item.id)}>
                <View style={[styles.milestoneCheck, ms.completed && { backgroundColor: Colors.mint, borderColor: Colors.mint }]}>
                  {ms.completed && <Icon source="check" size={12} color={Colors.white} />}
                </View>
                <Text style={[styles.milestoneText, ms.completed && styles.milestoneDone]}>{ms.title}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.addMilestoneRow}>
              <TextInput
                value={milestoneInput}
                onChangeText={setMilestoneInput}
                placeholder="Add milestone..."
                mode="flat"
                style={styles.milestoneInput}
                dense
                underlineStyle={{ display: 'none' }}
              />
              <IconButton icon="plus-circle" size={28} iconColor={Colors.primary} onPress={handleAddMilestone} />
            </View>
          </View>
        )}
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <PageHeader
        title="Goals"
        subtitle={`${activeGoals} active · ${completedGoals} done`}
        icon="target"
      />

      <View style={styles.statsRow}>
        <StatCard icon="flag" label="Active" value={String(activeGoals)} color={Colors.primary} />
        <StatCard icon="trophy" label="Completed" value={String(completedGoals)} color={Colors.mint} />
      </View>

      {goals.length === 0 ? (
        <EmptyState icon="trophy" title="No goals yet" description="Set goals and track your progress with milestones" />
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>New Goal</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Goal title" value={title} onChangeText={setTitle} mode="outlined" style={styles.dialogInput} outlineStyle={{ borderRadius: 16, borderColor: Colors.cardBorder }} />
            <TextInput label="Description (optional)" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={3} style={styles.dialogInput} outlineStyle={{ borderRadius: 16, borderColor: Colors.cardBorder }} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor={Colors.textTertiary}>Cancel</Button>
            <Button onPress={handleAddGoal} buttonColor={Colors.primary} textColor={Colors.white} style={{ borderRadius: 12 }}>Create</Button>
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
  goalCard: { marginBottom: 12 },
  goalHeader: { flexDirection: 'row', alignItems: 'center' },
  goalIconWrap: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  goalDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: Colors.lavenderLight, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginLeft: 10, minWidth: 40, textAlign: 'right' },
  milestonesWrap: { marginTop: 16, borderTopWidth: 1, borderTopColor: Colors.lavenderLight, paddingTop: 12 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  milestoneCheck: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.lavender,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  milestoneText: { fontSize: 14, color: Colors.text, flex: 1 },
  milestoneDone: { textDecorationLine: 'line-through', color: Colors.textTertiary },
  addMilestoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  milestoneInput: { flex: 1, backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 12 },
  dialog: { borderRadius: 28, backgroundColor: Colors.card },
  dialogTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  dialogInput: { marginBottom: 12, backgroundColor: Colors.background },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: Colors.primary, borderRadius: 20,
    ...ShadowStyle.floating,
  },
});
