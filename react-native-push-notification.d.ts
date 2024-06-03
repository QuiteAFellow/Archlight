declare module 'react-native-push-notification' {
  interface PushNotificationObject {
    message: string;
    date: Date;
    // Add other properties as needed
  }

  interface PushNotification {
    localNotificationSchedule(notification: PushNotificationObject): void;
  }

  const PushNotification: PushNotification;
  export default PushNotification;
}
