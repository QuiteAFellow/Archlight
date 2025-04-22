import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Button, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useFavorites } from '../../context/FavoritesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';  // Import Toast

const notificationOptions = [5, 10, 15, 30, 45, 60, 90];

const SettingsModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { notificationTimes, setNotificationTimes } = useFavorites();
  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);
  const [isHydrationEnabled, setIsHydrationEnabled] = useState(false);
  const [isSunscreenEnabled, setIsSunscreenEnabled] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const storedHydration = await AsyncStorage.getItem('hydrationReminder');
      const storedSunscreen = await AsyncStorage.getItem('sunscreenReminder');
      const storedNotificationTimes = await AsyncStorage.getItem('notificationTimes');

      if (storedHydration !== null) setIsHydrationEnabled(JSON.parse(storedHydration));
      if (storedSunscreen !== null) setIsSunscreenEnabled(JSON.parse(storedSunscreen));
      if (storedNotificationTimes) setSelectedTimes(JSON.parse(storedNotificationTimes));
    };
    loadSettings();
  }, [notificationTimes]);

  const handleSave = async () => {
    setNotificationTimes(selectedTimes);
    await AsyncStorage.setItem('notificationTimes', JSON.stringify(selectedTimes));
    await AsyncStorage.setItem('hydrationReminder', JSON.stringify(isHydrationEnabled));
    await AsyncStorage.setItem('sunscreenReminder', JSON.stringify(isSunscreenEnabled));
    Toast.show({
      type: 'success',
      text1: 'Notification settings updated successfully',
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.closeContainer}>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.title}>Notification Settings</Text>
              <Text>Set notification times (in minutes) before the artist's start time:</Text>
              <View style={styles.optionsContainer}>
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
                      styles.option,
                      selectedTimes.includes(time) && styles.selectedOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedTimes.includes(time) && styles.selectedOptionText,
                      ]}
                    >
                      {time} minutes
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Hydration Reminder */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.toggleLabel}>Hydration Reminder</Text>
                  <TouchableOpacity
                    onPress={() => setIsHydrationEnabled((prev) => !prev)}
                    style={[styles.inlineToggle, isHydrationEnabled && styles.inlineToggleActive]}
                  >
                    <Text
                      style={[styles.inlineToggleText, isHydrationEnabled && styles.inlineToggleTextActive]}
                    >
                      {isHydrationEnabled ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.toggleSubText}>
                  <Text style={{ fontStyle: 'italic' }}>
                    Reminds you to hydrate every 2 hours from 11am to 9pm.
                  </Text>
                </Text>
              </View>

              {/* Sunscreen Reminder */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.toggleLabel}>Sunscreen Reminder</Text>
                  <TouchableOpacity
                    onPress={() => setIsSunscreenEnabled((prev) => !prev)}
                    style={[styles.inlineToggle, isSunscreenEnabled && styles.inlineToggleActive]}
                  >
                    <Text
                      style={[styles.inlineToggleText, isSunscreenEnabled && styles.inlineToggleTextActive]}
                    >
                      {isSunscreenEnabled ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.toggleSubText}>
                  <Text style={{ fontStyle: 'italic' }}>
                    Reminds you to reapply sunscreen every 2 hours from 10am to 6pm. Alternates with the Hydration reminder.
                  </Text>
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <Button title="Save" onPress={handleSave} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  closeContainer: {
    alignItems: 'flex-end',
  },
  closeText: {
    fontSize: 20,
    color: 'grey',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  themeHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
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
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#007bff',
  },
  selectedOptionText: {
    color: 'white',
  },
  optionText: {
    color: 'black',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
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
});

export default SettingsModal;