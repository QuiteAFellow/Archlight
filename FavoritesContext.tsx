import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleNotificationsForArtist } from './notifications';
import artistsData from '../database/Artist Bios, Timesheet, Image Paths, Favorites.json';

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

interface FavoriteContextProps {
  favorites: { [key: string]: boolean };
  toggleFavorite: (artist: Artist) => void;
  setNotificationTimes: (times: number[]) => void;
}

const FavoritesContext = createContext<FavoriteContextProps | undefined>(undefined);

const FAVORITES_KEY = 'favorites';
const NOTIFICATION_TIMES_KEY = 'notificationTimes';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [notificationTimes, setNotificationTimesState] = useState<number[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Failed to load favorites', error);
      }
    };

    const loadNotificationTimes = async () => {
      try {
        const savedNotificationTimes = await AsyncStorage.getItem(NOTIFICATION_TIMES_KEY);
        if (savedNotificationTimes) {
          setNotificationTimesState(JSON.parse(savedNotificationTimes));
        }
      } catch (error) {
        console.error('Failed to load notification times', error);
      }
    };

    loadFavorites();
    loadNotificationTimes();
  }, []);

  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Failed to save favorites', error);
      }
    };

    saveFavorites();
  }, [favorites]);

  useEffect(() => {
    const saveNotificationTimes = async () => {
      try {
        await AsyncStorage.setItem(NOTIFICATION_TIMES_KEY, JSON.stringify(notificationTimes));
      } catch (error) {
        console.error('Failed to save notification times', error);
      }
    };

    saveNotificationTimes();
  }, [notificationTimes]);

  const toggleFavorite = (artist: Artist) => {
    setFavorites(prev => {
      const newFavorites = { ...prev, [artist.Artist]: !prev[artist.Artist] };
      if (newFavorites[artist.Artist]) {
        scheduleNotificationsForArtist(artist, notificationTimes);
      }
      return newFavorites;
    });
  };

  const setNotificationTimes = (times: number[]) => {
    setNotificationTimesState(times);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, setNotificationTimes }}>
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