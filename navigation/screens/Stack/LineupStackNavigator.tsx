import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LineupScreen } from '../BottomTab';
//import ArtistBioScreen from '../ArtistBioScreen';
import ArtistBioCarouselScreen from '../ArtistBioCarouselScreen';
import { LineupStackParamList } from '../../types';

const Stack = createNativeStackNavigator<LineupStackParamList>();

const LineupStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false}}>
      <Stack.Screen name="FestivalLineup" component={LineupScreen} />
      <Stack.Screen name="ArtistCarousel" component={ArtistBioCarouselScreen} />
    </Stack.Navigator>
  );
};

export default LineupStackNavigator;