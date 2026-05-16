import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, Dialog, Portal, TextInput, Button, IconButton, Icon, Chip, Menu } from 'react-native-paper';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { PageHeader } from '../../src/components/ui/PageHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useTaskStore } from '../../src/store/taskStore';
import { Task } from '../../src/types';
import { Colors, PriorityColors } from '../../src/constants';
import { format, isToday, isFuture, parseISO } from 'date-fns';

export default function TasksScreen() {
  const { tasks, filter, loadTasks, addTask, toggleTask, deleteTask, setFilter } = useTaskStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  useEffect(() => { loadTasks(); }, []);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'today') return t.dueDate && isToday(parseISO(t.dueDate));
    if (filter === 'upcoming') return t.dueDate && isFuture(parseISO(t.dueDate)) && !t.completed;
    return true;
  });

  const handleAddTask = async () => {
    if (!title.trim()) return;
    await addTask({ title, userId: '', priority, category: category || undefined, description: '' });
    setDialogVisible(false);
    setTitle('');
    setPriority('medium');
    setCategory('');
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskCard, item.completed && styles.taskCompleted]}
      onPress={() => toggleTask(item.id)}
      activeOpacity={0.7}
    >
      <IconButton
        icon={item.completed ? 'check-circle' : 'circle-outline'}
        iconColor={item.completed ? Colors.tertiary : Colors.textTertiary}
        size={24}
        onPress={() => toggleTask(item.id)}
      />
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, item.completed && styles.textStrikethrough]}>
          {item.title}
        </Text>
        {item.dueDate && (
          <Text style={styles.taskDate}>{format(parseISO(item.dueDate), 'MMM d, yyyy')}</Text>
        )}
      </View>
      <View style={styles.taskMeta}>
        {item.category && <Text style={styles.taskCategory}>{item.category}</Text>}
        <View style={[styles.priorityDot, { backgroundColor: PriorityColors[item.priority] }]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <PageHeader
        title="Tasks"
        subtitle={`${tasks.filter(t => !t.completed).length} pending`}
        onAdd={() => setDialogVisible(true)}
      />
      <View style={styles.filterRow}>
        {(['all', 'today', 'upcoming', 'completed'] as const).map(f => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={styles.filterChip}
            compact
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </View>
      {filteredTasks.length === 0 ? (
        <EmptyState icon="📝" title="No tasks" description="Add a task to get started" />
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
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>New Task</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Task title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.dialogInput}
            />
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high'] as const).map(p => (
                <Chip
                  key={p}
                  selected={priority === p}
                  onPress={() => setPriority(p)}
                  style={[styles.chip, { borderColor: PriorityColors[p] }]}
                  textStyle={{ color: PriorityColors[p] }}
                >
                  {p}
                </Chip>
              ))}
            </View>
            <TextInput
              label="Category (optional)"
              value={category}
              onChangeText={setCategory}
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddTask}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 80 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: {},
  taskCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    padding: 12, marginBottom: 6, borderRadius: 10,
    elevation: 1, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2,
  },
  taskCompleted: { opacity: 0.6 },
  taskInfo: { flex: 1, marginLeft: 4 },
  taskTitle: { fontSize: 15, fontWeight: '500', color: Colors.text },
  textStrikethrough: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  taskDate: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskCategory: { fontSize: 11, color: Colors.textSecondary, backgroundColor: Colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  dialogInput: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: {},
});
