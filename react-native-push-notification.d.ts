declare module 'react-native-push-notification' {
  interface PushNotificationObject {
    message: string;
    date: Date;
    channelId?: string;
    allowWhileIdle?: boolean;
    [key: string]: any;
  }

  export default class PushNotification {
    static configure(options: {
      onNotification: (notification: any) => void;
      popInitialNotification?: boolean;
      requestPermissions?: boolean;
    }): void;

    static localNotificationSchedule(notification: PushNotificationObject): void;
    static createChannel(
      channel: {
        channelId: string;
        channelName: string;
        channelDescription?: string;
        importance?: number;
        vibrate?: boolean;
      },
      callback: (created: boolean) => void
    ): void;
  }
}