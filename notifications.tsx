import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Artist } from './navigation/types';

const HYDRATION_PREF_KEY = 'hydrationReminderEnabled';
const SUNSCREEN_PREF_KEY = 'sunscreenReminderEnabled';
const SHOTGUNAROO_NOTIFICATION_KEY = 'shotgunarooNotificationIds';

// Store the notifications for each artist so we can cancel them when the artist is unfavorited
let artistNotifications: { [key: string]: string[] } = {}; // Holds notification IDs for each artist

const convertToLocalTimeFormat = (dateString: string, timeString: string): Date => {
  const [time, period] = timeString.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

export async function getMergedArtist(artist: Artist): Promise<Artist> {
  const json = await AsyncStorage.getItem('artistEdits');
  const edits = json ? JSON.parse(json) : {};
  const edit = edits[artist["AOTD #"]];
  return edit ? { ...artist, ...edit } : artist;
}

// Schedule a single notification
const scheduleNotification = async (message: string, date: Date): Promise<string> => {
  if (!message) {
    console.warn('Attempted to schedule a notification with an empty message');
    return '';
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
    const notificationId = await Notifications.scheduleNotificationAsync(notificationContent);
    console.log('Notification scheduled successfully:', notificationContent);
    return notificationId; // Return the notification ID for future reference
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return '';
  }
};

// Cancel a specific notification by ID
const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
};

// Cancel all scheduled notifications for a particular artist
const cancelNotificationsForArtist = async (artist: Artist) => {
  const notifications = artistNotifications[artist["AOTD #"]] || [];
  console.log(`Cancelling notifications for artist: ${artist.Artist}, AOTD #: ${artist["AOTD #"]}`);
  for (const notificationId of notifications) {
    await cancelNotification(notificationId);  // Cancel each notification
  }
  artistNotifications[artist["AOTD #"]] = []; // Clear stored notifications for this artist
  console.log(`All notifications for ${artist.Artist} have been cancelled.`);
};

// Cancel notifications for all artists when editing notification settings
const cancelAllArtistNotifications = async () => {
  console.log('Cancelling all artist notifications...');
  for (const artistId in artistNotifications) {
    const notifications = artistNotifications[artistId];
    for (const notificationId of notifications) {
      await cancelNotification(notificationId);  // Cancel each notification
    }
  }
  artistNotifications = {}; // Clear all stored notifications
  console.log('All artist notifications cancelled.');
};

// Schedule notifications for favorited artists
const scheduleNotificationsForArtist = async (artist: Artist, notificationTimes: number[]): Promise<void> => {
  if (typeof artist["AOTD #"] !== 'number') {
    console.error('Invalid artist data: AOTD # is not a number');
    return;
  }

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

  // Cancel any existing notifications for this artist
  await cancelNotificationsForArtist(artist);

  // Schedule new notifications
  const notificationIds: string[] = [];
  for (const time of notificationTimes) {
    const notificationTime = new Date(startTime.getTime() - time * 60000);
    const message =
      time === 0
        ? `${artist.Artist} is now live at ${artist.Stage}!`
        : `${artist.Artist} is performing at ${artist.Stage} in ${time} minutes!`;
    const notificationId = await scheduleNotification(message, notificationTime);
    if (notificationId) notificationIds.push(notificationId);
  }

  // Store the new notification IDs
  artistNotifications[artist["AOTD #"]] = notificationIds;
  console.log(`Scheduled notifications for ${artist.Artist}:`, notificationIds);
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
      for (let hour = 11; hour <= 23; hour += 2) {
        const time = createDateTime(day, hour);
        await scheduleNotification('Stay hydrated! Drink some water.', time);
      }
    }
  }
};

// Handle saving notification preferences
export const saveReminderPreferences = async (hydrate: boolean, sunscreen: boolean) => {
  try {
    await AsyncStorage.multiSet([
      [HYDRATION_PREF_KEY, JSON.stringify(hydrate)],
      [SUNSCREEN_PREF_KEY, JSON.stringify(sunscreen)]
    ]);
    console.log('Reminder preferences saved.');

    // Cancel all existing notifications and reschedule
    await cancelAllNotifications(); // Cancel all notifications for existing preferences
    await scheduleRecurringReminders(hydrate, sunscreen); // Reschedule based on new preferences
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

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled.');
  } catch (error) {
    console.error('Failed to cancel notifications:', error);
  }
};

export const getNotifications = async () => {
  // Mock function to get all scheduled notifications
  // Depending on the platform, you might want to access the Expo notifications module directly
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log('Scheduled notifications:', scheduledNotifications);
  return scheduledNotifications;
};

export const scheduleShotgunarooNotifications = async (notificationTimes: number[]) => {
  const eventDate = new Date(2025, 5, 12, 14, 0, 0, 0); // June 12, 2025, 2:00 PM
  const notificationIds: string[] = [];
  for (const time of notificationTimes) {
    const notifyDate = new Date(eventDate.getTime() - time * 60000);
    const body =
      time === 0
        ? "Bottoms up, it's time for Shotgunaroo at The Arch!"
        : `Shotgunaroo is happening at The Arch in ${time} minutes!`;
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Shotgunaroo!',
        body: body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { type: 'date', date: notifyDate } as any,
    });
    notificationIds.push(id);
  }
  await AsyncStorage.setItem(SHOTGUNAROO_NOTIFICATION_KEY, JSON.stringify(notificationIds));
};

export const cancelShotgunarooNotifications = async () => {
  const idsString = await AsyncStorage.getItem(SHOTGUNAROO_NOTIFICATION_KEY);
  if (idsString) {
    const ids: string[] = JSON.parse(idsString);
    for (const id of ids) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch (e) {
        console.warn('Failed to cancel Shotgunaroo notification:', id, e);
      }
    }
    await AsyncStorage.removeItem(SHOTGUNAROO_NOTIFICATION_KEY);
  }
};

export {
  scheduleNotification,
  scheduleNotificationsForArtist,
  scheduleRecurringReminders,
  cancelNotificationsForArtist,
  cancelAllArtistNotifications,
};