import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import LineupScreen from './screens/LineupScreen';
import MapScreen from './screens/MapScreen';
import SettingsScreen from './screens/SettingsScreen';

//Screen names
const homeName = "Home";
const CalendarName = "Calendar";
const LineupName = "Lineup";
const MapName = "Map";
const settingsName = "Settings";

const Tab = createBottomTabNavigator();

function MainContainer() {
    return (
    <NavigationContainer>
        <Tab.Navigator
        initialRouteName={homeName}
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let rn = route.name;

            if (rn === homeName) {
                iconName = focused ? 'home' : 'home-outline';

            } else if (rn === CalendarName) {
                iconName = focused ? 'calendar' : 'calendar-outline';

            } else if (rn === LineupName) {
                iconName = focused ? 'musical-notes' : 'musical-notes-outline';

            } else if (rn === MapName) {
                iconName = focused ? 'map' : 'map-outline';

            } else if (rn === settingsName) {
                iconName = focused ? 'settings' : 'settings-outline';
            }
            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
            },
        tabBaractiveTintColor: '#eee2ad',
        tabBarinactiveTintColor: '#000000',
        tabBarlabelStyle: { paddingBottom: 15, fontSize: 10 },
        tabBarstyle: { padding: 10, height: 100}
        })}>

        <Tab.Screen name={homeName} component={HomeScreen} />
        <Tab.Screen name={CalendarName} component={CalendarScreen} />
        <Tab.Screen name={LineupName} component={LineupScreen} />
        <Tab.Screen name={MapName} component={MapScreen} />
        <Tab.Screen name={settingsName} component={SettingsScreen} />

        </Tab.Navigator>
    </NavigationContainer>
    );
}

export default MainContainer;