import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, Dialog, Portal, TextInput, Button, IconButton, ProgressBar, Chip } from 'react-native-paper';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { PageHeader } from '../../src/components/ui/PageHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useGoalStore } from '../../src/store/goalStore';
import { Goal } from '../../src/types';
import { Colors } from '../../src/constants';

export default function GoalsScreen() {
  const { goals, milestones, loadGoals, loadMilestones, addGoal, updateGoal, deleteGoal, addMilestone, toggleMilestone } = useGoalStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [milestoneInput, setMilestoneInput] = useState('');

  useEffect(() => { loadGoals(); }, []);

  const handleAddGoal = async () => {
    if (!title.trim()) return;
    await addGoal({ title, userId: '', status: 'active', description: description || undefined });
    setDialogVisible(false);
    setTitle('');
    setDescription('');
  };

  const handleAddMilestone = async () => {
    if (!milestoneInput.trim() || !expandedGoal) return;
    const order = milestones.length;
    await addMilestone({ goalId: expandedGoal, title: milestoneInput, order });
    setMilestoneInput('');
  };

  const toggleExpand = (goalId: string) => {
    if (expandedGoal === goalId) {
      setExpandedGoal(null);
    } else {
      setExpandedGoal(goalId);
      loadMilestones(goalId);
    }
  };

  const renderGoal = ({ item }: { item: Goal }) => {
    const isExpanded = expandedGoal === item.id;
    return (
      <View style={styles.goalCard}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.7}>
          <View style={styles.goalHeader}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>{item.title}</Text>
              {item.description && <Text style={styles.goalDesc}>{item.description}</Text>}
            </View>
            <Chip
              mode="flat"
              compact
              style={[styles.statusChip, item.status === 'completed' && styles.completedChip]}
            >
              {item.status}
            </Chip>
          </View>
          <View style={styles.progressRow}>
            <ProgressBar
              progress={item.progress / 100}
              color={Colors.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.milestonesContainer}>
            {milestones.map(ms => (
              <TouchableOpacity
                key={ms.id}
                style={styles.milestone}
                onPress={() => toggleMilestone(ms.id, item.id)}
              >
                <IconButton
                  icon={ms.completed ? 'check-circle' : 'circle-outline'}
                  iconColor={ms.completed ? Colors.tertiary : Colors.textTertiary}
                  size={20}
                />
                <Text style={[styles.milestoneText, ms.completed && styles.milestoneDone]}>
                  {ms.title}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.addMilestoneRow}>
              <TextInput
                value={milestoneInput}
                onChangeText={setMilestoneInput}
                placeholder="New milestone..."
                mode="flat"
                style={styles.milestoneInput}
                dense
              />
              <IconButton icon="plus" size={20} onPress={handleAddMilestone} />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <PageHeader
        title="Goals"
        subtitle={`${goals.filter(g => g.status === 'active').length} active`}
        onAdd={() => setDialogVisible(true)}
      />
      {goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No goals yet"
          description="Set long-term goals with milestones"
          actionLabel="Create a Goal"
          onAction={() => setDialogVisible(true)}
        />
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
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>New Goal</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Goal title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddGoal}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 80 },
  goalCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12,
    elevation: 1, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  goalInfo: { flex: 1, marginRight: 12 },
  goalTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  goalDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  statusChip: { backgroundColor: Colors.surfaceVariant },
  completedChip: { backgroundColor: Colors.tertiaryContainer },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  progressBar: { flex: 1, height: 8, borderRadius: 4 },
  progressText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 8, minWidth: 36, textAlign: 'right' },
  milestonesContainer: { marginTop: 16, borderTopWidth: 1, borderTopColor: Colors.outline, paddingTop: 12 },
  milestone: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  milestoneText: { fontSize: 14, color: Colors.text, marginLeft: 4 },
  milestoneDone: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  addMilestoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  milestoneInput: { flex: 1, backgroundColor: 'transparent' },
  dialogInput: { marginBottom: 16 },
});
