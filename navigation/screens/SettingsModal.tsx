import React, { useState } from 'react';
import { Modal, View, Text, Button, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback } from 'react-native';
import Toast from 'react-native-toast-message';
import { useFavorites } from '../../context/FavoritesContext';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (times: number[]) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, onSave }) => {
  const [notificationTimes, setNotificationTimes] = useState<string[]>(['']);
  const { setNotificationTimes: saveNotificationTimes } = useFavorites();

  const addNotificationTime = () => {
    if (notificationTimes.length < 5) {
      setNotificationTimes([...notificationTimes, '']);
    }
  };

  const removeNotificationTime = (index: number) => {
    const newTimes = notificationTimes.filter((_, i) => i !== index);
    setNotificationTimes(newTimes);
  };

  const handleTimeChange = (text: string, index: number) => {
    const newTimes = [...notificationTimes];
    newTimes[index] = text;
    setNotificationTimes(newTimes);
  };

  const handleSave = () => {
    const times = notificationTimes.filter(time => time !== '').map(time => parseInt(time, 10));
    saveNotificationTimes(times);
    onSave(times);
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
              <Text style={styles.title}>Notification Settings</Text>
              <Text>Set up to 5 notification times (in minutes) before the artist's start time:</Text>
              {notificationTimes.map((time, index) => (
                <View key={index} style={styles.timeContainer}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={time}
                    onChangeText={(text) => handleTimeChange(text, index)}
                    placeholder="Minutes before start time"
                  />
                  <TouchableOpacity onPress={() => removeNotificationTime(index)} style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.buttonContainer}>
                <Button title="Add Notification Time" onPress={addNotificationTime} disabled={notificationTimes.length >= 5} />
                <View style={styles.buttonSpacing} />
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  removeButton: {
    marginLeft: 10,
  },
  removeButtonText: {
    color: 'red',
  },
  buttonContainer: {
    marginTop: 10,
  },
  buttonSpacing: {
    height: 10, // Add padding between buttons
  },
});

export default SettingsModal;