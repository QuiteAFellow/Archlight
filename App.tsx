import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { FavoritesProvider } from './context/FavoritesContext';
import MainContainer from './navigation/MainContainer';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from './navigation/screens/ThemeContext';
import { useTheme } from './navigation/screens/ThemeContext';

const App = () => {
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('You need to enable notifications in the settings to use this feature.');
        return;
      }
    };

    requestPermissions();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);
  const { theme, themeData } = useTheme();

  return (
    <>
      <StatusBar
      translucent = {false}
      barStyle={theme === 'Light' ? 'dark-content' : 'light-content'}
      backgroundColor={themeData.statusBarColor || themeData.backgroundColor}
      />
        <ThemeProvider>
          <FavoritesProvider>
            <NavigationContainer>
              <MainContainer />
              <Toast />
            </NavigationContainer>
          </FavoritesProvider>
        </ThemeProvider>
    </>
  );
};

export default App;