import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FestivalScheduleScreen from '../BottomTab/CalendarScreen';
import ArtistBioScreen from '../ArtistBioScreen';

const Stack = createNativeStackNavigator();

const CalendarStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false}}
            initialRouteName="FestivalSchedule">
                <Stack.Screen name="FestivalSchedule" component={FestivalScheduleScreen} />
                <Stack.Screen name="ArtistBio" component={ArtistBioScreen} />
        </Stack.Navigator>
    );
};

export default CalendarStackNavigator;