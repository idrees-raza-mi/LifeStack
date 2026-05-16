import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
  return pushToken.data;
}

export async function scheduleHabitReminder(
  habitId: string,
  habitName: string,
  time: string,
  repeatDaily: boolean = true
): Promise<string | null> {
  const [hours, minutes] = time.split(':').map(Number);

  const trigger: Notifications.TimeIntervalTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: calculateSecondsUntil(hours, minutes),
    repeats: repeatDaily,
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Habit Reminder',
      body: `Time to do: ${habitName}`,
      data: { type: 'habit', id: habitId },
    },
    trigger,
  });

  return id;
}

export async function scheduleRoutineReminder(
  routineId: string,
  routineName: string,
  time: string,
  daysOfWeek: number[]
): Promise<string | null> {
  const [hours, minutes] = time.split(':').map(Number);

  const trigger: Notifications.WeeklyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    weekday: getNextDay(daysOfWeek),
    hour: hours,
    minute: minutes,
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Routine Reminder',
      body: `Time for your routine: ${routineName}`,
      data: { type: 'routine', id: routineId },
    },
    trigger,
  });

  return id;
}

export async function scheduleTaskReminder(
  taskId: string,
  taskTitle: string,
  dueDate: Date
): Promise<string | null> {
  if (dueDate <= new Date()) return null;

  const trigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: dueDate,
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Due',
      body: `Task due: ${taskTitle}`,
      data: { type: 'task', id: taskId },
    },
    trigger,
  });

  return id;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function calculateSecondsUntil(hours: number, minutes: number): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return Math.floor((target.getTime() - now.getTime()) / 1000);
}

function getNextDay(daysOfWeek: number[]): number {
  const today = new Date().getDay();
  for (let i = 0; i < 7; i++) {
    const day = (today + i) % 7;
    if (daysOfWeek.includes(day)) {
      return day === 0 ? 7 : day;
    }
  }
  return today === 0 ? 7 : today;
}

export async function checkNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}
