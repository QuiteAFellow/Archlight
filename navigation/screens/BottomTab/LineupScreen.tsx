import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import artistsData from '../../../database/Artist Bios, Timesheet, Image Paths, Favorites.json';
import artistImages from '../../../assets/utils/artistImages';
import { LineupStackParamList } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFavorites } from '../../../context/FavoritesContext';

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
  favorited: boolean; // Add this property
}

const LineupScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<LineupStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, toggleFavorite } = useFavorites();

  const [artistList, setArtistList] = useState<Artist[]>(() => {
    const uniqueArtists = new Set<string>();
    const uniqueArtistList: Artist[] = [];

    artistsData.forEach((artist: Omit<Artist, 'Favorited' | 'favorited'>) => {
      if (!uniqueArtists.has(artist.Artist)) {
        uniqueArtists.add(artist.Artist);
        uniqueArtistList.push({ ...artist, Favorited: 0, favorited: false });
      }
    });

    return uniqueArtistList.sort((a, b) => a.Artist.toLowerCase().localeCompare(b.Artist.toLowerCase()));
  });

  const filteredArtistList = artistList.filter(artist =>
    artist.Artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleFavorite = (artist: Artist) => {
    //console.log('Favorite button clicked for:', artist.Artist);
    toggleFavorite(artist);
  };

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for artists"
        onChangeText={text => setSearchQuery(text)}
        value={searchQuery}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {filteredArtistList.map((artist, index) => {
          const isFavorited = favorites[artist.Artist] || false;
          return (
            <View key={artist.Artist}>
              <TouchableOpacity onPress={() => navigation.navigate('ArtistBio', { artist: { ...artist, favorited: isFavorited } })}>
                <View style={styles.artistContainer}>
                  <View style={styles.artistContent}>
                    <Image
                      source={artistImages[artist.Artist]}
                      style={styles.profileImage}
                      onError={(error) => console.log('Image loading error:', error)}
                    />
                    <Text style={styles.artistName}>{artist.Artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleToggleFavorite(artist)} style={styles.heartContainer}>
                    <Ionicons
                      name={isFavorited ? 'heart' : 'heart-outline'}
                      size={35}
                      color={isFavorited ? 'red' : 'black'}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              <View style={styles.line} />
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
    borderColor: '#ccc',
    marginTop: 45
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