import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LineupScreen } from '../BottomTab';
import ArtistBioScreen from '../ArtistBioScreen';
import { LineupStackParamList } from '../../types';

const Stack = createNativeStackNavigator<LineupStackParamList>();

const LineupStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FestivalLineup" component={LineupScreen} /> // Keep this as FestivalLineup for the nested screen
      <Stack.Screen name="ArtistBio" component={ArtistBioScreen} />
    </Stack.Navigator>
  );
};

export default LineupStackNavigator;