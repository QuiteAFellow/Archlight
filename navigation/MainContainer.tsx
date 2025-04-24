import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CalendarStackNavigator from './screens/Stack/CalendarStackNavigator';
import LineupStackNavigator from './screens/Stack/LineupStackNavigator';
import { HomeScreen, MapScreen, FoodVendorScreen } from './screens/BottomTab';
import SettingsModal from './screens/SettingsModal';
import { BottomTabParamList } from './types';
import { useTheme } from './screens/ThemeContext'; // Import useTheme to get the current theme

const Tab = createBottomTabNavigator<BottomTabParamList>();

const MainContainer: React.FC = () => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notificationTimes, setNotificationTimes] = useState<number[]>([]);

  const { themeData } = useTheme();  // Extract theme data to dynamically set the colors

  const openSettings = () => setSettingsVisible(true);
  const closeSettings = () => setSettingsVisible(false);
  const saveNotificationTimes = (times: number[]) => setNotificationTimes(times);

  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Calendar':
                iconName = focused ? 'calendar' : 'calendar-outline';
                break;
              case 'Lineup':
                iconName = focused ? 'list' : 'list-outline';
                break;
              case 'Map':
                iconName = focused ? 'map' : 'map-outline';
                break;
              case 'Food Vendors':
                iconName = focused ? 'fast-food' : 'fast-food-outline';
                break;
              default:
                iconName = 'ellipse-outline';
                break;
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: themeData.highlightColor, // Use highlightColor for active tint
          tabBarInactiveTintColor: themeData.textColor, // Use textColor for inactive tint
          tabBarStyle: { backgroundColor: themeData.backgroundColor } // Set the background color for the entire screen
        })}
      >

        <Tab.Screen name="Home">
          {props => <HomeScreen {...props} openSettings={openSettings} />}
        </Tab.Screen>
        <Tab.Screen name="Calendar" component={CalendarStackNavigator} />
        <Tab.Screen name="Lineup" component={LineupStackNavigator} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Food Vendors" component={FoodVendorScreen} />
      </Tab.Navigator>
      <SettingsModal
        visible={settingsVisible}
        onClose={closeSettings}
        onSave={saveNotificationTimes}
      />
    </>
  );
};

export default MainContainer;