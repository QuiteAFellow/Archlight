import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import artistsData from '../database/Artist Bios, Timesheet, Image Paths, Favorites.json';
import { Artist, FavoriteContextProps } from '../navigation/types';
import { scheduleNotificationsForArtist } from '../notifications';

const FavoritesContext = createContext<FavoriteContextProps | undefined>(undefined);

const defaultNotificationTimes = [60, 30, 15]; // Notification times in minutes before the event

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [notificationTimes, setNotificationTimesState] = useState<number[]>(defaultNotificationTimes);
  const [artists, setArtists] = useState<Artist[]>(artistsData);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favorites');
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
          setFavorites(parsedFavorites);
          console.log('Loaded favorites:', parsedFavorites);

          const updatedArtists = artistsData.map((artist: Artist) => ({
            ...artist,
            Favorited: parsedFavorites[artist.Artist] || false,
          }));
          setArtists(updatedArtists);
        }
      } catch (error) {
        console.error('Failed to load favorites', error);
      }
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
        console.log('Saved favorites:', favorites);
      } catch (error) {
        console.error('Failed to save favorites', error);
      }
    };
    saveFavorites();
  }, [favorites]);

  const toggleFavorite = async (artist: Artist) => {
    console.log('Toggling favorite for:', artist.Artist);
    const updatedFavorites = { ...favorites, [artist.Artist]: !favorites[artist.Artist] };
    setFavorites(updatedFavorites);

    const artistIndex = artistsData.findIndex((a: Artist) => a.Artist === artist.Artist);
    if (artistIndex !== -1) {
      artistsData[artistIndex].Favorited = updatedFavorites[artist.Artist];
      console.log(`Updated ${artist.Artist} favorited status to ${updatedFavorites[artist.Artist]}`);
    }

    if (updatedFavorites[artist.Artist]) {
      // Schedule notifications if favorited
      scheduleNotificationsForArtist(artist, notificationTimes);
    } else {
      // Cancel notifications if unfavorited (if needed, this requires additional implementation)
      // cancelNotificationsForArtist(artist); // Implement this function if needed
    }

    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      console.log('Favorite status saved to AsyncStorage for', artist.Artist);
    } catch (error) {
      console.error('Failed to save favorite status to AsyncStorage', error);
    }
  };

  const setNotificationTimes = (times: number[]) => {
    setNotificationTimesState(times);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, setNotificationTimes, artists }}>
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