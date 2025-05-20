import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FestivalScheduleScreen from '../BottomTab/CalendarScreen';
import ArtistBioCarouselScreen from '../ArtistBioCarouselScreen'; // Ensure correct import

const Stack = createNativeStackNavigator();

const CalendarStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="FestivalSchedule">
        <Stack.Screen name="FestivalSchedule" component={FestivalScheduleScreen} />
        <Stack.Screen name="ArtistCarousel" component={ArtistBioCarouselScreen} />
        </Stack.Navigator>
    );
};

export type CalendarStackParamList = {
    FestivalSchedule: { day?: string; artistId?: number; startTime?: string };
    ArtistCarousel: any;
};

export default CalendarStackNavigator;