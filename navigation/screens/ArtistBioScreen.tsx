import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Artist, ArtistBioScreenRouteParams } from '../types';
import artistImages from '../../assets/utils/artistImages';
import { useFavorites } from '../../context/FavoritesContext';

type ArtistBioRouteProp = RouteProp<{ ArtistBio: ArtistBioScreenRouteParams }, 'ArtistBio'>;

type ArtistBioContentProps = {
  artist: Artist;
};

export const ArtistBioContent: React.FC<ArtistBioContentProps> = ({ artist }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorited = favorites[artist["AOTD #"]] || false;
  const descriptionSegments = artist.Description.split('[PAGE_BREAK]');
  const navigation = useNavigation();

  const handleToggleFavorite = () => {
    console.log('Favorite button clicked for:', artist["AOTD #"]);
    toggleFavorite(artist);
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <Image source={artistImages[artist.Artist]} style={styles.imageHeader} resizeMode="cover" />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{artist.Artist}</Text>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.heartContainer}>
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={35}
              color={isFavorited ? 'red' : 'black'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          <Ionicons name="calendar" size={20} color="darkgrey" />
          <Text style={styles.infoText}>{artist.Scheduled}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Ionicons name="time" size={20} color="darkgrey" />
          <Text style={styles.infoText}>
            {artist.StartTime} - {artist.EndTime}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <Ionicons name="location" size={20} color="darkgrey" />
          <Text style={styles.infoText}>{artist.Stage}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Ionicons name="disc-outline" size={20} color="darkgrey" />
          <Text style={styles.infoText}>{artist.Genres}</Text>
        </View>
        <View style={styles.description}>
          {descriptionSegments.map((segment, index) => (
            <Text key={index} style={styles.descriptionText}>
              {segment}
              {index < descriptionSegments.length - 1 ? '\n\n' : ''}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// Fallback route-based screen version
const ArtistBioScreen: React.FC = () => {
  const route = useRoute<ArtistBioRouteProp>();
  const { artists, initialIndex } = route.params;

  return <ArtistBioContent artist={artists[initialIndex]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageHeader: {
    width: '100%',
    height: 400,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
    flexWrap: 'wrap',
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
    marginTop: 10,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: 'black',
  },
});

export default ArtistBioScreen;