import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import artistImages from '../../assets/utils/artistImages';
import { Artist } from '../types';
import { useFavorites } from '../../context/FavoritesContext';

type ArtistBioRouteProp = RouteProp<{ ArtistBio: { artist: Artist & { favorited: boolean } } }, 'ArtistBio'>;

const ArtistBioScreen: React.FC = () => {
  const route = useRoute<ArtistBioRouteProp>();
  const { artist } = route.params;
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorited = favorites[artist.Artist] || false;

  // Split the description by [PAGE_BREAK]
  const descriptionSegments = artist.Description.split('[PAGE_BREAK]');

  return (
    <ScrollView style={styles.container}>
      <Image source={artistImages[artist.Artist]} style={styles.imageHeader} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{artist.Artist}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(artist)} style={styles.heartContainer}>
            <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={35} color={isFavorited ? 'red' : 'black'} />
          </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          <Ionicons name="calendar" size={20} color="darkgrey" />
          <Text style={styles.infoText}>{artist.Scheduled}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Ionicons name="time" size={20} color="darkgrey" />
          <Text style={styles.infoText}>{artist.StartTime} - {artist.EndTime}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Ionicons name="location" size={20} color="darkgrey" />
          <Text style={styles.infoText}>{artist.Stage}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Ionicons name="disc-outline" size={20} color="darkgrey" />
          <Text style={styles.infoText}>{artist.Genres}</Text>
        </View>
        <Text style={styles.description}>
          {descriptionSegments.map((segment, index) => (
            <Text key={index}>
              {segment}
              {index < descriptionSegments.length - 1 && '\n\n'} {/* Add a new line between segments */}
            </Text>
          ))}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageHeader: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  heartContainer: {
    marginLeft: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: 'black',
    marginLeft: 10,
  },
  description: {
    fontSize: 16,
    color: 'black',
    marginTop: 10,
    marginBottom: 10, // Add margin between description segments
  },
});

export default ArtistBioScreen;