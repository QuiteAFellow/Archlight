import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

const LineupScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArtists, setFilteredArtists] = useState<string[]>([]);
  const [allArtists, setAllArtists] = useState<string[]>([]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const db: SQLiteDatabase = await SQLite.openDatabase({ name: '../database/ArtistDatabase.db', location: 'default' });
        db.transaction(tx => {
          tx.executeSql(
            'SELECT Artist FROM ArtistDatabase',
            [],
            (tx, results) => {
              const len = results.rows.length;
              const artists: string[] = [];
              for (let i = 0; i < len; i++) {
                artists.push(results.rows.item(i).Artist);
              }
              setAllArtists(artists);
              setFilteredArtists(artists); // Set filtered artists initially
            },
            error => {
              console.error('Error fetching artists:', error);
            }
          );
        });
      } catch (error) {
        console.error('Error opening database:', error);
      }
    };

    fetchArtists();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = allArtists.filter(artist =>
      artist.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredArtists(filtered);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search artists..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredArtists}
        renderItem={({ item }) => (
          <View style={styles.artistItem}>
            <Text>{item}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  artistItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default LineupScreen;