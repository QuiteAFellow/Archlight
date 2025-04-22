import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Artist } from './navigation/types';

const HYDRATION_PREF_KEY = 'hydrationReminderEnabled';
const SUNSCREEN_PREF_KEY = 'sunscreenReminderEnabled';

// Schedule a single notification
const scheduleNotification = async (message: string, date: Date): Promise<void> => {
  if (!message) {
    console.warn('Attempted to schedule a notification with an empty message');
    return;
  }

  console.log('Scheduling notification:', { message, date });

  const notificationContent = {
    content: {
      title: 'Performance Reminder',
      body: message,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: 'date',
      date,
    } as Notifications.DateTriggerInput,
  };

  try {
    await Notifications.scheduleNotificationAsync(notificationContent);
    console.log('Notification scheduled successfully:', notificationContent);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Cancel all scheduled notifications
const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled.');
  } catch (error) {
    console.error('Failed to cancel notifications:', error);
  }
};

// Convert artist start time to Date object
const convertToLocalTimeFormat = (dateString: string, timeString: string): Date => {
  const [time, period] = timeString.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

// Schedule notifications for favorited artists
const scheduleNotificationsForArtist = async (artist: Artist, notificationTimes: number[]): Promise<void> => {
  const dayToExactDate: { [key: string]: string } = {
    Tuesday: '2025-06-10',
    Wednesday: '2025-06-11',
    Thursday: '2025-06-12',
    Friday: '2025-06-13',
    Saturday: '2025-06-14',
    Sunday: '2025-06-15',
  };

  const startDateString = dayToExactDate[artist.Scheduled];
  const startTime = convertToLocalTimeFormat(startDateString, artist.StartTime);

  console.log('Artist:', artist.Artist);
  console.log('Start time:', startTime);

  for (const time of notificationTimes) {
    const notificationTime = new Date(startTime.getTime() - time * 60000);
    console.log(`Scheduling notification for ${artist.Artist} at ${notificationTime}`);
    await scheduleNotification(`${artist.Artist} is performing at ${artist.Stage} in ${time} minutes!`, notificationTime);
  }
};

// Schedule recurring hydration/sunscreen reminders
const scheduleRecurringReminders = async (hydrate: boolean, sunscreen: boolean) => {
  const dayRange = ['2025-06-12', '2025-06-13', '2025-06-14', '2025-06-15']; // Thur-Sun
  const timezoneOffset = new Date().getTimezoneOffset(); // minutes

  const createDateTime = (date: string, hour: number) => {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d, hour, 0, 0);
  };

  for (const day of dayRange) {
    if (sunscreen) {
      for (let hour = 10; hour <= 18; hour += 2) {
        const time = createDateTime(day, hour);
        await scheduleNotification('Time to reapply sunscreen!', time);
      }
    }

    if (hydrate) {
      for (let hour = 11; hour <= 21; hour += 2) {
        const time = createDateTime(day, hour);
        await scheduleNotification('Stay hydrated! Drink some water.', time);
      }
    }
  }
};

export const saveReminderPreferences = async (hydrate: boolean, sunscreen: boolean) => {
  try {
    await AsyncStorage.multiSet([
      [HYDRATION_PREF_KEY, JSON.stringify(hydrate)],
      [SUNSCREEN_PREF_KEY, JSON.stringify(sunscreen)]
    ]);
    console.log('Reminder preferences saved.');
  } catch (error) {
    console.error('Failed to save reminder preferences:', error);
  }
};

export const loadReminderPreferences = async (): Promise<{ hydrate: boolean; sunscreen: boolean }> => {
  try {
    const [hydrateValue, sunscreenValue] = await AsyncStorage.multiGet([
      HYDRATION_PREF_KEY,
      SUNSCREEN_PREF_KEY
    ]);

    return {
      hydrate: JSON.parse(hydrateValue[1] ?? 'false'),
      sunscreen: JSON.parse(sunscreenValue[1] ?? 'false')
    };
  } catch (error) {
    console.error('Failed to load reminder preferences:', error);
    return { hydrate: false, sunscreen: false };
  }
};


export {
  scheduleNotification,
  scheduleNotificationsForArtist,
  scheduleRecurringReminders,
  cancelAllNotifications,
};