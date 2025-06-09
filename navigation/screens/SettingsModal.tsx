import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Button, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Switch, ScrollView } from 'react-native';
import { useFavorites } from '../../context/FavoritesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useTheme } from './ThemeContext';
import { themes } from '../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scheduleNotificationsForArtist, cancelAllNotifications, loadReminderPreferences, cancelNotificationsForArtist } from '../../notifications';
import rawArtistsData from '../../database/Artist Bios, Timesheet, Image Paths, Favorites.json';
import { Artist } from '../types';
import { scheduleNotificationAsync } from 'expo-notifications';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const artistsData: Artist[] = rawArtistsData.map((artist: any) => ({
  "AOTD #": parseInt(artist["AOTD #"], 10),  // Convert "AOTD #" to a number
  Artist: artist.Artist,
  Description: artist.Description,
  Genres: artist.Genres,
  Scheduled: artist.Scheduled,
  Stage: artist.Stage,
  StartTime: artist.StartTime || artist["Start Time"], // fallback
  EndTime: artist.EndTime || artist["End Time"],       // fallback
  Favorited: artist.Favorited === 'true' || artist.Favorited === true,
}));

const notificationOptions = [0, 5, 10, 15, 30, 45, 60, 90];

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (times: number[]) => void;  // Accept onSave as a prop
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, onSave }) => {
  const { theme, setTheme, themeData } = useTheme();
  const [tapCount, setTapCount] = useState(0);
  const [showTestButton, setShowTestButton] = useState(false);
  const { favorites, notificationTimes, setNotificationTimes } = useFavorites();
  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);
  const [isHydrationEnabled, setIsHydrationEnabled] = useState(false);
  const [isSunscreenEnabled, setIsSunscreenEnabled] = useState(false);
  const currentTheme = theme;
  const [isCountdownEnabled, setIsCountdownEnabled] = useState(false);
  const [allowArtistEdit, setAllowArtistEdit] = useState(false);

  const Container = Platform.OS === 'ios' ? SafeAreaView : View;

  useEffect(() => {
    const loadSettings = async () => {
      const storedHydration = await AsyncStorage.getItem('hydrationReminder');
      const storedSunscreen = await AsyncStorage.getItem('sunscreenReminder');
      const storedNotificationTimes = await AsyncStorage.getItem('notificationTimes');
      const storedTheme = await AsyncStorage.getItem('theme');
      const storedCountdown = await AsyncStorage.getItem('countdownEnabled');

      if (storedHydration !== null) setIsHydrationEnabled(JSON.parse(storedHydration));
      if (storedSunscreen !== null) setIsSunscreenEnabled(JSON.parse(storedSunscreen));
      if (storedNotificationTimes) setSelectedTimes(JSON.parse(storedNotificationTimes));
      if (storedTheme) setTheme(storedTheme as 'Light' | 'Bonnaroo' | 'OLED' );
      if (storedCountdown !== null) setIsCountdownEnabled(JSON.parse(storedCountdown));
    };
    loadSettings();
  },[setTheme]);

  useEffect(() => {
    const loadDevSettings = async () => {
      const devMode = await AsyncStorage.getItem('devMode');
      const artistEdit = await AsyncStorage.getItem('allowArtistEdit');
      if (devMode === 'true') setShowTestButton(true);
      if (artistEdit === 'true') setAllowArtistEdit(true);
    };
    loadDevSettings();
  }, []);

  useEffect(() => {
    if (!visible) {
      // Reset the selected times when the modal is closed
      setTapCount(0);
      setShowTestButton(false);
    }
  }, [visible]);

  // When dev mode is unlocked
  const handleTap = () => {
    setTapCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount === 10) {
        setShowTestButton(true);
        AsyncStorage.setItem('devMode', 'true');
        Toast.show({ type: 'info', text1: 'Developer mode Unlocked!' });
      }
      return newCount;
    });
  };

  const sendTestNotification = async () => {
    await scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is what your notifications will look like!",
      },
      trigger: null // Trigger immediately for testing
    });
  };

  // Save artist edit toggle
  const handleArtistEditToggle = async (val: boolean) => {
    setAllowArtistEdit(val);
    await AsyncStorage.setItem('allowArtistEdit', val ? 'true' : 'false');
  };

  // Revert all changes
  const handleRevertAll = async () => {
    await AsyncStorage.removeItem('artistEdits');
    Toast.show({ type: 'success', text1: 'All artist changes reverted.' });
  };

  const handleSave = async () => {
    // Cancel all previous notifications
    await cancelAllNotifications(); // Cancel all notifications before rescheduling

    // Save new notification settings
    setNotificationTimes(selectedTimes);

    await AsyncStorage.setItem('notificationTimes', JSON.stringify(selectedTimes));
    await AsyncStorage.setItem('hydrationReminder', JSON.stringify(isHydrationEnabled));
    await AsyncStorage.setItem('sunscreenReminder', JSON.stringify(isSunscreenEnabled));
    await AsyncStorage.setItem('theme', theme);
    await AsyncStorage.setItem('countdownEnabled', JSON.stringify(isCountdownEnabled));

    // Schedule new notifications based on the updated settings for each favorited artist
    for (const artistKey of Object.keys(favorites)) {
      if (favorites[artistKey]) {
        // Find the artist object from the artistsData array using the artistId (AOTD #)
        const artist = artistsData.find((artist: Artist) => artist["AOTD #"] === parseInt(artistKey, 10));
        if (artist) {
          // Schedule new notifications for this artist
          await scheduleNotificationsForArtist(artist, selectedTimes);
        }
      }
    }

    Toast.show({
      type: 'success',
      text1: 'Settings updated successfully',
    });

    onSave(selectedTimes);
    onClose();
  };

  const highlightColor = themes[theme].highlightColor;
  const highlightTextColor = themes[theme].highlightTextColor;

  return (
    <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <Container
          {...(Platform.OS === 'ios'
              ? { edges: ['top', 'bottom'] }
              : {})}
            style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeData.backgroundColor }]}>
              <TouchableOpacity onPress={handleTap}>
                <Text style={[styles.title, { color: themeData.textColor }]}>Settings</Text>
              </TouchableOpacity>

              {/* Close Button (X) */}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={30} color={themeData.textColor} />
              </TouchableOpacity>

              {/* Developer Test Button */}
              {showTestButton && (
                <>
                  <View style={styles.testButtonContainer}>
                    <Button title="Send Test Notification" onPress={sendTestNotification} color={themeData.highlightColor} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ color: themeData.textColor, flex: 1 }}>Allow editing of artist information</Text>
                    <Switch
                      value={allowArtistEdit}
                      onValueChange={handleArtistEditToggle}
                      trackColor={{ false: '#767577', true: themeData.highlightColor }}
                      thumbColor={allowArtistEdit ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                  {allowArtistEdit && (
                    <TouchableOpacity
                      style={{ backgroundColor: 'red', padding: 10, borderRadius: 5, marginBottom: 10 }}
                      onPress={handleRevertAll}
                    >
                      <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Revert all changes</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* Theme Selector */}
              <Text style={[styles.subHeader, { color: themeData.textColor }]}>App Theme</Text>
              <View style={styles.optionsContainer}>
                {['Light', 'Bonnaroo', 'OLED'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setTheme(option as 'Light' | 'Bonnaroo' | 'OLED')}
                    style={[
                      styles.option,
                      theme === option && {
                        backgroundColor: highlightColor,
                        borderColor: 'transparent'
                      },
                      theme !== option && { borderColor: themeData.unselectedborder },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        theme === option
                          ? { color: theme === 'Light' ? 'white' : highlightTextColor }  // Set text to white for Light theme, or use highlight text color for others
                          : { color: themeData.textColor }  // Default text color
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Countdown Toggle */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.toggleLabel, { color: themeData.textColor }]}>Countdown Timer</Text>
                  <Switch
                    value={isCountdownEnabled}
                    onValueChange={setIsCountdownEnabled}
                    style={styles.switch}
                    trackColor={{ false: '#767577', true: themeData.highlightColor }}  // Track color when ON
                    thumbColor={isCountdownEnabled ? '#ffffff' : '#f4f3f4'}  // Thumb color when ON
                  />
                </View>
                <Text style={[styles.toggleSubText, { color: themeData.textColor }]}>
                  <Text style={{ fontStyle: 'italic' }}>
                    Enables a countdown on the homescreen, counting down the days, hours, minutes, and seconds until Centeroo opens at noon on Thursday.
                  </Text>
                </Text>
              </View>

              {/* Notification Selector */}
              <Text style={[styles.subHeader, { color: themeData.textColor }]}>Notification Settings</Text>
              <Text style={{ color: themeData.textColor }}>Set notification times (in minutes) on or before a favorited artist's start time:</Text>
              <View style={styles.notificationOptionsContainer}>
                {notificationOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => {
                      setSelectedTimes((prevTimes) =>
                        prevTimes.includes(time)
                          ? prevTimes.filter((t) => t !== time)
                          : [...prevTimes, time]
                      );
                    }}
                    style={[
                      styles.notificationOption,
                      selectedTimes.includes(time)
                        ? { backgroundColor: highlightColor, borderColor: 'transparent' }
                        : { borderColor: themeData.unselectedborder },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedTimes.includes(time)
                          ? { color: theme === 'Light' ? 'white' : highlightTextColor }
                          : { color: themeData.textColor },
                      ]}
                    >
                      {time} minutes
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sunscreen Reminder */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.toggleLabel, { color: themeData.textColor }]}>Sunscreen Reminder</Text>
                  <Switch
                    value={isSunscreenEnabled}
                    onValueChange={setIsSunscreenEnabled}
                    style={styles.switch}
                    trackColor={{ false: '#767577', true: themeData.highlightColor }}  // Track color when ON
                    thumbColor={isSunscreenEnabled ? '#ffffff' : '#f4f3f4'}  // Thumb color when ON
                  />
                </View>
                <Text style={[styles.toggleSubText, { color: themeData.textColor }]}>
                  <Text style={{ fontStyle: 'italic' }}>
                    Reminds you to reapply sunscreen every 2 hours from 10am to 6pm. Assumes maximum sunlight throughout the entire day, actual weather may vary.
                  </Text>
                </Text>
              </View>

              {/* Hydration Reminder */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.toggleLabel, { color: themeData.textColor }]}>Hydration Reminder</Text>
                  <Switch
                    value={isHydrationEnabled}
                    onValueChange={setIsHydrationEnabled}
                    style={styles.switch}
                    trackColor={{ false: '#767577', true: themeData.highlightColor }}  // Track color when ON
                    thumbColor={isHydrationEnabled ? '#ffffff' : '#f4f3f4'}  // Thumb color when ON
                  />
                </View>
                <Text style={[styles.toggleSubText, { color: themeData.textColor }]}>
                  <Text style={{ fontStyle: 'italic' }}>
                    Reminds you to hydrate every 2 hours from 11am to 11pm. Alternates with the Sunscreen reminder.
                  </Text>
                </Text>
              </View>
              <View style={styles.buttonContainer}>
                <Button title="Save" onPress={handleSave} color={highlightColor}/>
              </View>
            </ScrollView>
          </Container>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  themeHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  optionsContainer: {
    flexDirection: 'row', // Align buttons horizontally
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Spread buttons evenly
    marginBottom: 20,
    marginTop: 20,
  },
  option: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    margin: 5,
    width: '30%',
    minWidth: 90,  // Make sure buttons have consistent size
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Keep button background transparent
  },
  selectedOption: {
    backgroundColor: '#007bff',
  },
  selectedOptionText: {
    color: 'white', // Set text color to white when selected
  },
  optionText: {
    color: 'black',
    textAlign: 'center',
    fontSize: Platform.OS === 'ios' ? 11 : 12, // smaller font
  },
  buttonContainer: {
    marginTop: 10,
  },
  sectionContainer: {
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inlineToggle: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'gray',
  },
  inlineToggleActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  inlineToggleText: {
    color: 'black',
  },
  inlineToggleTextActive: {
    color: 'white',
  },
  toggleSubText: {
    marginTop: 5,
    marginBottom: 10,
    fontSize: 14,
    color: 'gray',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  switch: {
    marginRight: 10,
    color: '#007bff'
  },
  closeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  testButtonContainer: {
    marginVertical: 10,
  },
  notificationOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // <-- changed from 'space-between'
    marginBottom: 10,
    marginTop: 10,
  },
  notificationOption: {
    width: '22%',
    minWidth: 0,
    marginVertical: 2,      // reduced vertical margin
    marginHorizontal: 3,    // reduced horizontal margin
    paddingVertical: 6,     // reduced vertical padding
    paddingHorizontal: 0,   // no horizontal padding
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default SettingsModal;