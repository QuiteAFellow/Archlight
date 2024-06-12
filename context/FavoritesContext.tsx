import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleNotificationsForArtist } from '../notifications';
import { Artist } from '../navigation/types';

interface FavoriteContextProps {
  favorites: { [key: string]: boolean };
  toggleFavorite: (artist: Artist) => void;
  notificationTimes: number[];
  setNotificationTimes: (times: number[]) => void;
}

interface FavoritesProviderProps {
  children: ReactNode;
}

const FavoritesContext = createContext<FavoriteContextProps | undefined>(undefined);

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [notificationTimes, setNotificationTimes] = useState<number[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    };

    const loadNotificationTimes = async () => {
      const storedTimes = await AsyncStorage.getItem('notificationTimes');
      if (storedTimes) {
        setNotificationTimes(JSON.parse(storedTimes));
      }
    };

    loadFavorites();
    loadNotificationTimes();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    AsyncStorage.setItem('notificationTimes', JSON.stringify(notificationTimes))
      .then(() => console.log('Notification settings saved to AsyncStorage:', notificationTimes))
      .catch(error => console.error('Failed to save notification settings to AsyncStorage:', error));
  }, [notificationTimes]);

  const toggleFavorite = (artist: Artist) => {
    setFavorites(prev => {
      const newFavorites = { ...prev, [artist.Artist]: !prev[artist.Artist] };
      if (!prev[artist.Artist]) {
        scheduleNotificationsForArtist(artist, notificationTimes);
      }
      return newFavorites;
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, notificationTimes, setNotificationTimes }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoriteContextProps => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};