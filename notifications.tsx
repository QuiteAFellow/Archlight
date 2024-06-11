// notifications.tsx
import PushNotification from 'react-native-push-notification';
import { Artist } from './navigation/types';

// Schedule a notification
const scheduleNotification = (message: string, date: Date): void => {
  console.log('Scheduling notification:', { message, date });
  PushNotification.localNotificationSchedule({
    message,
    date,
    channelId: 'default-channel-id',
  });
};

// Schedule notifications for favorited artists
const scheduleNotificationsForArtist = (artist: Artist, notificationTimes: number[]): void => {
  const startTime = new Date(artist.StartTime); // Assuming StartTime is a Date object or a string that can be parsed into a Date
  notificationTimes.forEach((time) => {
    const notificationTime = new Date(startTime.getTime() - time * 60000);
    scheduleNotification(`Upcoming performance: ${artist.Artist}`, notificationTime);
  });
};

export { scheduleNotification, scheduleNotificationsForArtist };