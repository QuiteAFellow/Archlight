import React, { useState, useContext, useEffect } from 'react';
import { Modal, View, Text, Button, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Toast from 'react-native-toast-message';
import { useFavorites } from '../../context/FavoritesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const notificationOptions = [5, 10, 15, 30, 45, 60, 90];

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { notificationTimes, setNotificationTimes } = useFavorites();
  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);

  useEffect(() => {
    setSelectedTimes(notificationTimes);
  }, [notificationTimes]);

  const handleSave = async () => {
    setNotificationTimes(selectedTimes);
    await AsyncStorage.setItem('notificationTimes', JSON.stringify(selectedTimes));
    Toast.show({
      type: 'success',
      text1: 'Notification settings updated successfully',
    });
    onClose();
  };

  const toggleTime = (time: number) => {
    setSelectedTimes((prevTimes) =>
      prevTimes.includes(time)
        ? prevTimes.filter((t) => t !== time)
        : [...prevTimes, time]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <Text style={styles.title}>Notification Settings</Text>
              <Text>Set notification times (in minutes) before the artist's start time:</Text>
              <View style={styles.optionsContainer}>
                {notificationOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => toggleTime(time)}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 30
  },
  option: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    margin: 5,
  },
  selectedOption: {
    backgroundColor: '#007bff',
    borderColor: '#007bff'
  },
  optionText: {
    color: 'black',
  },
  selectedOptionText: {
    color: 'white',
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default SettingsModal;