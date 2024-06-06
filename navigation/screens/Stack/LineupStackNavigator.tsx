import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LineupScreen } from '../BottomTab'; // Adjust the path
import ArtistBioScreen from '../ArtistBioScreen'; // Adjust the path

const Stack = createNativeStackNavigator();

const LineupStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false}}
            initialRouteName="Lineup">
                <Stack.Screen name="FestivalLineup" component={LineupScreen} />
                <Stack.Screen name="ArtistBio" component={ArtistBioScreen} />
        </Stack.Navigator>
    );
};

export default LineupStackNavigator;