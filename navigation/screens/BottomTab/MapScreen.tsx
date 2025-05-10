import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Dimensions, Image, TouchableWithoutFeedback } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';  // Import the theme context
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

const centerooImage = require('../../../assets/Maps/Roo24_Centeroo.jpg');
const outerooImage = require('../../../assets/Maps/Roo24_Outeroo.jpg');

interface Pin {
  id: number;
  x: number;
  y: number;
  color: string;
  label: string;
  description: string;
  map: string;
}

const colors = ['white', 'red', 'orange', 'yellow', 'green', 'lightgreen', 'blue', 'purple'];

const X_ADJUSTMENT = -15;
const Y_ADJUSTMENT = -20;

const MapScreen: React.FC = () => {
  const { themeData } = useTheme();  // Extract theme data to dynamically set the colors
  const [currentMap, setCurrentMap] = useState('centeroo');
  const [pins, setPins] = useState<Pin[]>([]);
  const [addingPin, setAddingPin] = useState(false);
  const [pinDetails, setPinDetails] = useState({ label: '', description: '', color: 'red' });
  const [showModal, setShowModal] = useState(false);
  const [editingPinId, setEditingPinId] = useState<number | null>(null);
  const [newPinCoords, setNewPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);

  useEffect(() => {
    const loadPins = async () => {
      try {
        const savedPins = await AsyncStorage.getItem('pins');
        if (savedPins) {
          setPins(JSON.parse(savedPins));
        }
      } catch (error) {
        console.error('Failed to load pins', error);
      }
    };

    loadPins();
  }, []);

  useEffect(() => {
    const savePins = async () => {
      try {
        await AsyncStorage.setItem('pins', JSON.stringify(pins));
      } catch (error) {
        console.error('Failed to save pins', error);
      }
    };

    savePins();
  }, [pins]);

  const switchMap = () => {
    setCurrentMap(currentMap === 'centeroo' ? 'outeroo' : 'centeroo');
  };

  const currentImage = currentMap === 'centeroo' ? centerooImage : outerooImage;

  const handleMapPress = (event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (addingPin) {
      const { locationX, locationY } = event.nativeEvent;
      setNewPinCoords({ x: locationX + X_ADJUSTMENT, y: locationY + Y_ADJUSTMENT });
      setShowModal(true);
      setAddingPin(false);  // Reset adding pin state
    }
  };

  const handlePinPress = (pinId: number) => {
    const pin = pins.find(p => p.id === pinId);
    if (pin) {
      setPinDetails({ label: pin.label, description: pin.description, color: pin.color });
      setEditingPinId(pinId);
      setShowModal(true);
    }
  };

  const savePin = () => {
    if (newPinCoords || editingPinId !== null) {
      const newPin = {
        id: editingPinId !== null ? editingPinId : pins.length,
        x: newPinCoords ? newPinCoords.x : pins.find(pin => pin.id === editingPinId)!.x,
        y: newPinCoords ? newPinCoords.y : pins.find(pin => pin.id === editingPinId)!.y,
        color: pinDetails.color,
        label: pinDetails.label,
        description: pinDetails.description,
        map: currentMap,
      };

      const updatedPins = editingPinId !== null
        ? pins.map(pin => pin.id === editingPinId ? newPin : pin)
        : [...pins, newPin];

      setPins(updatedPins);
      setPinDetails({ label: '', description: '', color: 'red' });
      setShowModal(false);
      setEditingPinId(null);
      setNewPinCoords(null);
    }
  };

  const removePin = () => {
    if (editingPinId !== null) {
      setPins(pins.filter(pin => pin.id !== editingPinId));
      setShowModal(false);
      setEditingPinId(null);
      setNewPinCoords(null);
    }
  };

  const cancelAddPin = () => {
    setAddingPin(false);
    setNewPinCoords(null);
    setShowModal(false);
  };

  const Container = Platform.OS === 'ios' ? SafeAreaView : View;

  return (
    <TouchableWithoutFeedback onPress={addingPin ? handleMapPress : undefined}>
      <Container style={[styles.container, { backgroundColor: themeData.backgroundColor }]}>
        <TouchableOpacity onPress={switchMap} style={[styles.switchButton, { backgroundColor: themeData.highlightColor }]}>
          <Text style={[styles.switchButtonText, { color: themeData.buttonText }]}>Switch Map</Text>
        </TouchableOpacity>
        {addingPin ? (
          <TouchableOpacity onPress={cancelAddPin} style={[styles.cancelAddButton, { backgroundColor: 'red' }]}>
            <Text style={styles.cancelAddButtonText}>Cancel Add Pin</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setAddingPin(true)} style={[styles.addButton, { backgroundColor: themeData.highlightColor }]}>
            <Text style={[styles.addButtonText, { color: themeData.buttonText }]}>Add Pin</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setIsImageViewVisible(true)} style={styles.mapContainer}>
          <Image source={currentImage} style={styles.mapImage} resizeMode="contain" />
          {pins
            .filter((pin) => pin.map === currentMap)
            .map((pin) => (
              <TouchableOpacity
                key={pin.id}
                onPress={() => handlePinPress(pin.id)}
                style={[
                  styles.pin,
                  { left: pin.x, top: pin.y, backgroundColor: pin.color },
                ]}
              >
                <Text style={[styles.pinLabel, { color: pin.color === 'yellow' ? 'black' : 'white' }]}>{pin.label}</Text>
              </TouchableOpacity>
            ))}
        </TouchableOpacity>
        <ImageViewing
          images={[{ uri: Image.resolveAssetSource(currentImage).uri }]}
          imageIndex={0}
          visible={isImageViewVisible}
          onRequestClose={() => setIsImageViewVisible(false)}
        />
        {addingPin && (
          <View style={styles.overlay}>
            <Text style={[styles.overlayText, { color: themeData.textColor }]}>Tap on the map to add a pin</Text>
          </View>
        )}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: themeData.backgroundColor }]}>
              <Text style={[styles.modalTitle, { color: themeData.textColor }]}>
                {editingPinId !== null ? 'Edit Pin' : 'New Pin Details'}
              </Text>
              <TextInput
                placeholder="Label"
                value={pinDetails.label}
                onChangeText={(text) => setPinDetails({ ...pinDetails, label: text })}
                style={[styles.input, { borderColor: themeData.textColor, color: themeData.textColor }]}
                placeholderTextColor={themeData.textColor} // Set placeholder text color
              />
              <TextInput
                placeholder="Description"
                value={pinDetails.description}
                onChangeText={(text) => setPinDetails({ ...pinDetails, description: text })}
                style={[styles.input, { borderColor: themeData.textColor, color: themeData.textColor }]}
                placeholderTextColor={themeData.textColor} // Set placeholder text color
              />
              <View style={styles.colorContainer}>
                <Text style={[styles.colorLabel, { color: themeData.textColor }]}>Color</Text>
                <View style={styles.colors}>
                  {colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setPinDetails({ ...pinDetails, color })}
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: color,
                          borderColor:
                            pinDetails.color === color
                              ? themeData.name === 'Light'
                                ? 'black'
                                : 'white'
                              : 'transparent',
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={savePin} style={[styles.button, styles.saveButton, { backgroundColor: themeData.highlightColor }]}>
                  <Text style={[styles.buttonText, { backgroundColor: themeData.highlightColor }]}>{editingPinId !== null ? 'Save Changes' : 'Add Pin'}</Text>
                </TouchableOpacity>
                {editingPinId !== null && (
                  <TouchableOpacity onPress={removePin} style={[styles.button, styles.removeButton]}>
                    <Text style={styles.buttonText}>Remove Pin</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowModal(false)} style={[styles.button, styles.cancelButton]}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  switchButton: {
    position: 'absolute',
    top: 5,
    left: 10,
    padding: 10,
    zIndex: 10,
    borderRadius: 5,
  },
  switchButtonText: {
    color: 'white',
  },
  addButton: {
    position: 'absolute',
    top: 5,
    right: 10,
    padding: 10,
    zIndex: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
  },
  cancelAddButton: {
    position: 'absolute',
    top: 5,
    right: 10,
    padding: 10,
    zIndex: 10,
    borderRadius: 5,
  },
  cancelAddButtonText: {
    color: 'white',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  pin: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinLabel: {
    fontSize: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 325,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  colorContainer: {
    marginBottom: 20,
  },
  colorLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  colors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorSwatch: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  removeButton: {
    backgroundColor: 'red',
  },
  cancelButton: {
    backgroundColor: 'gray',
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  overlayText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default MapScreen;