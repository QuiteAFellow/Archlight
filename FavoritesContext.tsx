import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import artistsData from '../../../database/Artist Bios, Timesheet, Image Paths, Favorites.json'; // Adjust the path as needed

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
  artists: Artist[];
}

const FavoritesContext = createContext<FavoriteContextProps | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [artists, setArtists] = useState<Artist[]>(artistsData);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
          console.log('Loaded favorites:', JSON.parse(savedFavorites));
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

  const toggleFavorite = (artist: Artist) => {
    console.log('Toggling favorite for:', artist.Artist);
    setFavorites(prevFavorites => {
      const updatedFavorites = { ...prevFavorites, [artist.Artist]: !prevFavorites[artist.Artist] };
      console.log('Updated favorites:', updatedFavorites);
      return updatedFavorites;
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, artists }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};