import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [notificationTimes, setNotificationTimesState] = useState<number[]>([]);

  useEffect(() => {
    // Optional: Load initial favorites from local storage or API
  }, []);

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
    // Reschedule notifications for all favorited artists with the new times
    Object.keys(favorites).forEach(artistName => {
      const artist = artistsData.find((a: Artist) => a.Artist === artistName);
      if (artist && favorites[artist.Artist]) {
        scheduleNotificationsForArtist(artist, times);
      }
    });
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