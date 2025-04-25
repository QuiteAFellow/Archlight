import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { scheduleNotificationsForArtist, cancelNotificationsForArtist } from '../notifications';
import { Artist } from '../navigation/types';
import { saveToStorage, loadFromStorage } from '../storageService';

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

  // Load favorites and notificationTimes when the component is mounted
  useEffect(() => {
    const loadData = async () => {
      const storedFavorites = await loadFromStorage('favorites');
      const storedNotificationTimes = await loadFromStorage('notificationTimes');

      if (storedFavorites) {
        setFavorites(storedFavorites);
      }

      if (storedNotificationTimes) {
        setNotificationTimes(storedNotificationTimes);
      }
    };

    loadData();
  }, []);

  // Save favorites and notificationTimes whenever they change
  useEffect(() => {
    saveToStorage('favorites', favorites);
  }, [favorites]);

  useEffect(() => {
    saveToStorage('notificationTimes', notificationTimes);
  }, [notificationTimes]);

  // Callback for toggling favorite status
  const toggleFavorite = useCallback(
    (artist: Artist) => {
      const artistKey = artist["AOTD #"].toString();

      setFavorites(prev => {
        const newFavorites = { ...prev, [artistKey]: !prev[artistKey] };

        // If the artist is now favorited, schedule notifications
        if (!prev[artistKey]) {
          scheduleNotificationsForArtist(artist, notificationTimes);
        } else {
          // If the artist is unfavorited, cancel notifications
          cancelNotificationsForArtist(artist);
        }

        return newFavorites;
      });
    },
    [notificationTimes] // Only rerun if notificationTimes change
  );

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