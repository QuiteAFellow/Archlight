import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LineupScreen } from '../BottomTab';  // Adjust this import if needed
import ArtistBioCarouselScreen from '../ArtistBioCarouselScreen';  // Ensure correct path
import { LineupStackParamList } from '../../types';

const Stack = createNativeStackNavigator<LineupStackParamList>();

const LineupStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FestivalLineup" component={LineupScreen} />
      <Stack.Screen name="ArtistCarousel" component={ArtistBioCarouselScreen} />
    </Stack.Navigator>
  );
};

export default LineupStackNavigator;
