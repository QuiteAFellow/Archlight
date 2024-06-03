import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FestivalScheduleScreen from '../BottomTab/CalendarScreen'; // Adjust the path
import ArtistBioScreen from '../ArtistBioScreen'; // Adjust the path

const Stack = createNativeStackNavigator();

const CalendarStackNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="FestivalSchedule">
            <Stack.Screen name="FestivalSchedule" component={FestivalScheduleScreen} />
            <Stack.Screen name="ArtistBio" component={ArtistBioScreen} />
        </Stack.Navigator>
    );
};

export default CalendarStackNavigator;