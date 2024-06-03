import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen, MapScreen, SettingsScreen } from './navigation/screens/BottomTab';
import CalendarStackNavigator from './navigation/screens/Stack/CalendarStackNavigator';
import LineupStackNavigator from './navigation/screens/Stack/LineupStackNavigator';

const Tab = createBottomTabNavigator();

const MainContainer = () => (
    <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Calendar" component={CalendarStackNavigator} />
        <Tab.Screen name="Lineup" component={LineupStackNavigator} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
);

export default MainContainer;