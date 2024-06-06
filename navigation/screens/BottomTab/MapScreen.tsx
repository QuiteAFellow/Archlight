import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Dimensions, Image } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { IOnClick } from 'react-native-image-pan-zoom';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const MapScreen: React.FC = () => {
  const [currentMap, setCurrentMap] = useState('centeroo');
  const [pins, setPins] = useState<Pin[]>([]);
  const [addingPin, setAddingPin] = useState(false);
  const [pinDetails, setPinDetails] = useState({ label: '', description: '', color: 'red' });
  const [showModal, setShowModal] = useState(false);
  const [editingPinId, setEditingPinId] = useState<number | null>(null);
  const [newPinCoords, setNewPinCoords] = useState<{ x: number; y: number } | null>(null);

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

  const handleMapPress = (eventParams: IOnClick) => {
    if (addingPin) {
      const { locationX, locationY } = eventParams;
      setNewPinCoords({ x: locationX, y: locationY });
      setShowModal(true);
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
      setAddingPin(false);
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

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={switchMap} style={styles.switchButton}>
        <Text style={styles.switchButtonText}>Switch Map</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setAddingPin(true)} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Pin</Text>
      </TouchableOpacity>
      <ImageZoom
        cropWidth={Dimensions.get('window').width}
        cropHeight={Dimensions.get('window').height}
        imageWidth={Dimensions.get('window').width}
        imageHeight={Dimensions.get('window').height}
        onClick={handleMapPress}
        minScale={1}
        maxScale={3}
        style={styles.mapContainer}
      >
        <Image source={currentImage} style={styles.mapImage} resizeMode="contain" />
        {pins
          .filter((pin) => pin.map === currentMap)
          .map((pin) => (
            <TouchableOpacity
              key={pin.id}
              onPress={() => handlePinPress(pin.id)}
              style={[
                styles.pin,
                { left: pin.x - 15, top: pin.y - 15, backgroundColor: pin.color },
              ]}
            >
              <Text style={[styles.pinLabel, { color: pin.color === 'yellow' ? 'black' : 'white' }]}>{pin.label}</Text>
            </TouchableOpacity>
          ))}
      </ImageZoom>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingPinId !== null ? 'Edit Pin' : 'New Pin Details'}</Text>
            <TextInput
              placeholder="Label"
              value={pinDetails.label}
              onChangeText={(text) => setPinDetails({ ...pinDetails, label: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={pinDetails.description}
              onChangeText={(text) => setPinDetails({ ...pinDetails, description: text })}
              style={styles.input}
            />
            <View style={styles.colorContainer}>
              <Text style={styles.colorLabel}>Color</Text>
              <View style={styles.colors}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setPinDetails({ ...pinDetails, color })}
                    style={[styles.colorSwatch, { backgroundColor: color, borderColor: pinDetails.color === color ? 'black' : 'transparent' }]}
                  />
                ))}
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={savePin} style={[styles.button, styles.saveButton]}>
                <Text style={styles.buttonText}>{editingPinId !== null ? 'Save Changes' : 'Add Pin'}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  switchButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: 'gray',
    zIndex: 10,
  },
  switchButtonText: {
    color: 'white',
  },
  addButton: {
    position: 'absolute',
    top: 50,
    right: 10,
    padding: 10,
    backgroundColor: 'gray',
    zIndex: 10,
  },
  addButtonText: {
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
    width: 300,
    padding: 20,
    backgroundColor: 'white',
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
    backgroundColor: 'blue',
  },
  removeButton: {
    backgroundColor: 'red',
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default MapScreen;