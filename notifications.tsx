import PushNotification from 'react-native-push-notification';

// Define the type for an artist
interface Artist {
    "AOTD #": number;
    Artist: string;
    Scheduled: string;
    Description: string;
    Genres: string;
    Stage: string;
    StartTime: string;
    EndTime: string;
    Favorited: number;
}

    // Schedule a notification
const scheduleNotification = (message: string, date: Date): void => {
    PushNotification.localNotificationSchedule({
        message,
        date,
    });
};

    // Schedule notifications for favorited artists
const scheduleNotificationsForArtist = (artist: Artist, notificationTimes: number[]): void => {
const startTime = new Date(artist.StartTime); // Assuming StartTime is a Date object or a string that can be parsed into a Date
    notificationTimes.forEach(time => {
        const notificationTime = new Date(startTime.getTime() - time * 60000);
        scheduleNotification(`Upcoming performance: ${artist.Artist}`, notificationTime);
    });
};

export { scheduleNotification, scheduleNotificationsForArtist };
