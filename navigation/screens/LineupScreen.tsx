import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput } from 'react-native';
import  Ionicons from 'react-native-vector-icons/Ionicons';
import artistsData from '../../database/Artist Bios, Timesheet, Image Paths, Favorites.json';

// Define types/interfaces for the data structure
interface Artist {
  Artist: string;
  Favorited: number;
}

const LineupScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [artistList, setArtistList] = useState<(Artist & { favorited: boolean })[]>(() => {
    const uniqueArtists = new Set<string>();
    const uniqueArtistList: (Artist & { favorited: boolean })[] = [];

    artistsData.forEach(artist => {
      if (!uniqueArtists.has(artist.Artist)) {
        uniqueArtists.add(artist.Artist);
        uniqueArtistList.push({ ...artist, favorited: false });
      }
    });

    return uniqueArtistList.sort((a, b) => a.Artist.toLowerCase().localeCompare(b.Artist.toLowerCase()));
  });

  // Function to toggle favorite status
  const toggleFavorite = (index: number) => {
    setArtistList(prevList => {
      const newList = [...prevList];
      newList[index].favorited = !newList[index].favorited;
      return newList;
    });
  };

  const filteredArtistList = artistList.filter(artist =>
    artist.Artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for artists"
        onChangeText={text => setSearchQuery(text)}
        value={searchQuery}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {filteredArtistList.map((artist, index) => (
          <View key={artist.Artist}>
            <View style={styles.artistContainer}>
              <View style={styles.artistContent}>
                <Image
                  source={{ uri: `assets/artist-images/${artist.Artist}.jpg` }}
                  style={styles.profileImage}
                  onError={(error) => console.log('Image loading error:', error)}
                />
                <Text style={styles.artistName}>{artist.Artist}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(index)} style={styles.heartContainer}>
                <Ionicons
                  name={artist.favorited ? 'heart' : 'heart-outline'}
                  size={35}
                  color={artist.favorited ? 'red' : 'black'}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.line} />
          </View>
        ))}
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
  },
  artistContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
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
    marginBottom: 10, // Add margin to separate the line from the next artist container
  },
});

export default LineupScreen;