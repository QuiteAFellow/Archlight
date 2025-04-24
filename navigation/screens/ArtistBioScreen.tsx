import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { LineupStackParamList } from '../types';  // Correct import for types
import ArtistBioContent from './ArtistBioContent';  // Ensure this component is correctly imported

// Define the route params for ArtistBio screen
type ArtistBioRouteProp = RouteProp<LineupStackParamList, 'ArtistBio'>;

const ArtistBioScreen: React.FC = () => {
  const route = useRoute<ArtistBioRouteProp>();  // Use the correct RouteProp type
  const { artists, initialIndex } = route.params;  // Access 'artists' and 'initialIndex' from route.params

  return <ArtistBioContent artist={artists[initialIndex]} />;  // Pass artist to ArtistBioContent
};

export default ArtistBioScreen;