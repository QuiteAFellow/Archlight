import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CalendarStackNavigator from './screens/Stack/CalendarStackNavigator';
import LineupStackNavigator from './screens/Stack/LineupStackNavigator';
import { HomeScreen, MapScreen, FoodVendorScreen } from './screens/BottomTab';
import SettingsModal from './screens/SettingsModal';
import { BottomTabParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const MainContainer: React.FC = () => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notificationTimes, setNotificationTimes] = useState<number[]>([]);

  const openSettings = () => setSettingsVisible(true);
  const closeSettings = () => setSettingsVisible(false);
  const saveNotificationTimes = (times: number[]) => setNotificationTimes(times);

  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
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
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: '#000000',
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