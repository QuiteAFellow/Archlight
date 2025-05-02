import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import rawArtistsData from '../../../database/Artist Bios, Timesheet, Image Paths, Favorites.json';
import artistImages from '../../../assets/utils/artistImages';
import { LineupStackParamList, Artist } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFavorites } from '../../../context/FavoritesContext';
import { useTheme } from '../ThemeContext'; // Import the theme context
import FastImage from 'react-native-fast-image';

const artistsData: Artist[] = rawArtistsData.map((artist: any) => ({
  "AOTD #": parseInt(artist["AOTD #"], 10),
  Artist: artist.Artist,
  Description: artist.Description,
  Genres: artist.Genres,
  Scheduled: artist.Scheduled,
  Stage: artist.Stage,
  StartTime: artist.StartTime || artist["Start Time"],
  EndTime: artist.EndTime || artist["End Time"],
  Favorited: artist.Favorited === 'true' || artist.Favorited === true,
}));

const LineupScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<LineupStackParamList>>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { favorites, toggleFavorite } = useFavorites();
  const { themeData, theme } = useTheme();  // Get themeData from context

  const initializeArtistList = (): Artist[] => {
    const uniqueArtists = new Set<string>();
    const uniqueArtistList: Artist[] = [];

    artistsData.forEach((artist: Artist) => {
      if (!uniqueArtists.has(artist.Artist)) {
        uniqueArtists.add(artist.Artist);
        uniqueArtistList.push({
          ...artist,
          Favorited: favorites[artist["AOTD #"]] || false
        });
      }
    });

    return uniqueArtistList.sort((a, b) => a.Artist.localeCompare(b.Artist));
  };

  const [artistList, setArtistList] = useState<Artist[]>(initializeArtistList);

  useEffect(() => {
    setArtistList(prevArtistList =>
      prevArtistList.map(artist => ({
        ...artist,
        Favorited: favorites[artist["AOTD #"]] || false,
      }))
    );
  }, [favorites]);

  const filteredArtistList = artistList.filter((artist: Artist) =>
    artist.Artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleFavorite = (artist: Artist) => {
    console.log('Favorite button clicked for:', artist.Artist);
    toggleFavorite(artist);
  };

  const handleNavigateToArtist = (selectedArtist: Artist) => {
    const sortedArtists = [...artistList].sort((a, b) => a.Artist.localeCompare(b.Artist));
    const initialIndex = sortedArtists.findIndex((a) => a.Artist === selectedArtist.Artist);

    navigation.navigate('ArtistCarousel', {
      artists: sortedArtists,
      initialIndex: initialIndex,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeData.backgroundColor }}>
      <TextInput
        style={[styles.searchBar, { color: themeData.textColor, borderColor: themeData.textColor }]}
        placeholder="Search for artists"
        onChangeText={text => setSearchQuery(text)}
        value={searchQuery}
        placeholderTextColor={themeData.textColor}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {filteredArtistList.map((artist: Artist) => {
          const isFavorited = artist.Favorited;
          const heartColor = isFavorited ? (theme === 'Light' ? 'red' : themeData.highlightColor) : themeData.textColor;  // Black heart for unfavorited
          const heartIcon = isFavorited ? 'heart' : 'heart-outline';  // Heart outline for unfavorited artists
          return (
            <View key={artist["AOTD #"]}>
              <TouchableOpacity onPress={() => handleNavigateToArtist(artist)}>
                <View style={styles.artistContainer}>
                  <View style={styles.artistContent}>
                    <FastImage
                      source={artistImages[artist.Artist]}
                      style={styles.profileImage}
                      resizeMode={FastImage.resizeMode.cover}
                      onError={() => console.log('Image loading error')}
                    />
                    <Text style={[styles.artistName, { color: themeData.textColor }]}>{artist.Artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleToggleFavorite(artist)} style={styles.heartContainer}>
                    <Ionicons
                      name={heartIcon}
                      size={35}
                      color={heartColor}  // Set heart color based on whether the artist is favorited or not
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              <View style={[styles.line, { borderColor: themeData.textColor }]} />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  searchBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginTop: 5,
  },
  artistContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10
  },
  artistContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  artistName: {
    fontWeight: 'bold',
    fontSize: 18,
    flex: 1,
  },
  heartContainer: {
    marginLeft: -70,
  },
  line: {
    borderBottomWidth: 1,
    width: '100%',
    marginBottom: 10,
  },
});

export default LineupScreen;