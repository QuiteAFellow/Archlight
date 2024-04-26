import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList, RootNavigationScreenProps } from './types';
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import LineupScreen from './screens/LineupScreen';
import MapScreen from './screens/MapScreen';
import SettingsScreen from './screens/SettingsScreen';
import SearchScreen from './screens/SearchScreen'; // Import the SearchScreen component

const Stack = createStackNavigator();

function MainContainer() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Lineup" component={LineupScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} /> {/* Add SearchScreen as a screen */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MainContainer;