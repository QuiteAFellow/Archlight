import * as Notifications from 'expo-notifications';
import { Artist } from './navigation/types';

// Schedule a notification
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
      date: date,
    },
  };

  try {
    await Notifications.scheduleNotificationAsync(notificationContent);
    console.log('Notification scheduled successfully:', notificationContent);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Schedule notifications for favorited artists
const scheduleNotificationsForArtist = async (artist: Artist, notificationTimes: number[]): Promise<void> => {
  const dayToExactDate: { [key: string]: string } = {
    Tuesday: '2024-06-11',
    Wednesday: '2024-06-12',
    Thursday: '2024-06-13',
    Friday: '2024-06-14',
    Saturday: '2024-06-15',
    Sunday: '2024-06-16',
  };

  // Convert the start time to local time format
  const convertToLocalTimeFormat = (dateString: string, timeString: string): Date => {
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const [year, month, day] = dateString.split('-').map(Number);

    const date = new Date(year, month - 1, day, hours, minutes);
    return date;
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

export { scheduleNotification, scheduleNotificationsForArtist };
