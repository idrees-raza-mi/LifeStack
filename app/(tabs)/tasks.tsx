import { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, Dialog, Portal, TextInput, Button, IconButton, Icon, Chip } from 'react-native-paper';
import { ScreenWrapper, Card } from '../../src/components/ui/ScreenWrapper';
import { PageHeader, SectionHeader, StatCard } from '../../src/components/ui/PageHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useTaskStore } from '../../src/store/taskStore';
import { Task } from '../../src/types';
import { Colors, PriorityColors, ShadowStyle } from '../../src/constants';
import { format, isToday, parseISO } from 'date-fns';

export default function TasksScreen() {
  const { tasks, filter, loadTasks, addTask, toggleTask, setFilter } = useTaskStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => { loadTasks(); }, []);

  const pendingTasks = tasks.filter(t => !t.completed).length;
  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'today') return t.dueDate && isToday(parseISO(t.dueDate));
    return true;
  });

  const handleAddTask = async () => {
    if (!title.trim()) return;
    await addTask({ title, userId: '', priority, description: '' });
    setDialogVisible(false);
    setTitle('');
    setPriority('medium');
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskCard, item.completed && styles.taskDone]}
      onPress={() => toggleTask(item.id)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[styles.taskCheck, item.completed && { backgroundColor: Colors.mint, borderColor: Colors.mint }]}
        onPress={() => toggleTask(item.id)}
      >
        {item.completed && <Icon source="check" size={14} color={Colors.white} />}
      </TouchableOpacity>
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, item.completed && styles.taskTitleDone]}>{item.title}</Text>
        <View style={styles.taskMeta}>
          <View style={[styles.priorityBadge, { backgroundColor: PriorityColors[item.priority] + '20' }]}>
            <Text style={[styles.priorityText, { color: PriorityColors[item.priority] }]}>{item.priority}</Text>
          </View>
          {item.category && <Text style={styles.taskCategory}>{item.category}</Text>}
        </View>
      </View>
      {item.dueDate && (
        <Text style={styles.taskDate}>{format(parseISO(item.dueDate), 'd MMM')}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <PageHeader
        title="Tasks"
        subtitle={`${pendingTasks} pending`}
        icon="format-list-checks"
      />

      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <StatCard icon="checkbox-marked" label="Done Today" value="5" color={Colors.mint} />
          <StatCard icon="clock-outline" label="Pending" value={String(pendingTasks)} color={Colors.peach} />
        </View>
      </Card>

      <View style={styles.filterRow}>
        {(['all', 'today', 'completed'] as const).map(f => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            textStyle={{ fontWeight: '600', fontSize: 12, color: filter === f ? Colors.white : Colors.textSecondary }}
            showSelectedOverlay={false}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </View>

      {filteredTasks.length === 0 ? (
        <EmptyState icon="clipboard-text" title="No tasks" description="Add a task to get started" compact />
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>New Task</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Task title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.dialogInput}
              outlineStyle={{ borderRadius: 16, borderColor: Colors.cardBorder }}
            />
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityBtn, priority === p && { backgroundColor: PriorityColors[p] + '20', borderColor: PriorityColors[p] }]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.priorityBtnText, { color: PriorityColors[p] }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor={Colors.textTertiary}>Cancel</Button>
            <Button onPress={handleAddTask} buttonColor={Colors.primary} textColor={Colors.white} style={{ borderRadius: 12 }}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB icon="plus" style={styles.fab} color={Colors.white} onPress={() => setDialogVisible(true)} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 100 },
  summaryCard: { marginBottom: 16 },
  summaryRow: { gap: 8 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: {
    backgroundColor: Colors.lavenderLight,
    borderRadius: 14,
    borderWidth: 0,
  },
  filterChipActive: { backgroundColor: Colors.primary },
  taskCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    padding: 16, marginBottom: 8, borderRadius: 20,
    ...ShadowStyle.card,
  },
  taskDone: { opacity: 0.6 },
  taskCheck: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: Colors.lavender,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.textTertiary },
  taskMeta: { flexDirection: 'row', gap: 6, marginTop: 4 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  priorityText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  taskCategory: { fontSize: 11, color: Colors.textTertiary },
  taskDate: { fontSize: 12, color: Colors.textTertiary, fontWeight: '600' },
  dialog: { borderRadius: 28, backgroundColor: Colors.card },
  dialogTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  dialogInput: { marginBottom: 16, backgroundColor: Colors.background },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 10 },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.cardBorder,
  },
  priorityBtnText: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: Colors.primary, borderRadius: 20,
    ...ShadowStyle.floating,
  },
});
