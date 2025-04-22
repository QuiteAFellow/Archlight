import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FestivalScheduleScreen from '../BottomTab/CalendarScreen';
//import ArtistBioScreen from '../ArtistBioScreen';
import ArtistBioCarouselScreen from '../ArtistBioCarouselScreen';

const Stack = createNativeStackNavigator();

const CalendarStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false}}
            initialRouteName="FestivalSchedule">
                <Stack.Screen name="FestivalSchedule" component={FestivalScheduleScreen} />
                <Stack.Screen name="ArtistCarousel" component={ArtistBioCarouselScreen} />
        </Stack.Navigator>
    );
};

export default CalendarStackNavigator;