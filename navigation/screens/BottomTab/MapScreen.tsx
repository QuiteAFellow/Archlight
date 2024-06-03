import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { GestureHandlerRootView, TapGestureHandler, GestureHandlerStateChangeEvent, TapGestureHandlerEventPayload } from 'react-native-gesture-handler';

const centerooImage = require('../../../assets/Maps/Roo24_Centeroo.jpg');
const outerooImage = require('../../../assets/Maps/Roo24_Outeroo.jpg');

const MapScreen: React.FC = () => {
  const [currentMap, setCurrentMap] = useState('centeroo');
  const [markers, setMarkers] = useState<{ id: number; x: number; y: number; color: string; title: string; map: string }[]>([]);
  const [addingPin, setAddingPin] = useState(false);
  const [markerCount, setMarkerCount] = useState(0);

  const switchMap = () => {
    setCurrentMap(currentMap === 'centeroo' ? 'outeroo' : 'centeroo');
  };

  const currentImage = currentMap === 'centeroo' ? centerooImage : outerooImage;

  const handleTap = (event: GestureHandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
    console.log('handleTap called', { addingPin, eventState: event.nativeEvent.state });
    if (addingPin && event.nativeEvent.state === 4) {
      const { x, y } = event.nativeEvent;
      console.log('Tap detected', { x, y });

      Alert.prompt(
        'New Marker',
        'Enter marker title:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: (title) => {
              if (title && title.trim() !== '') {
                const newMarker = {
                  id: markerCount,
                  x,
                  y,
                  color: 'red', // Default color for simplicity
                  title: title.trim(),
                  map: currentMap,
                };
                console.log('Adding marker:', newMarker);
                setMarkers((prevMarkers) => {
                  const updatedMarkers = [...prevMarkers, newMarker];
                  console.log('Updated markers:', updatedMarkers);
                  return updatedMarkers;
                });
                setMarkerCount(markerCount + 1);
                setAddingPin(false);
              } else {
                Alert.alert('Error', 'Title cannot be empty.');
              }
            },
          },
        ],
        'plain-text'
      );
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <TapGestureHandler onHandlerStateChange={handleTap}>
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
              minScale={0.09}
              maxScale={3}
              style={{ flex: 1 }}
            >
              <Image source={currentImage} style={styles.mapImage} resizeMode="contain" />
              {markers
                .filter((marker) => marker.map === currentMap)
                .map((marker) => (
                  <View
                    key={marker.id}
                    style={[
                      styles.marker,
                      {
                        position: 'absolute',
                        left: marker.x,
                        top: marker.y,
                        backgroundColor: marker.color,
                      },
                    ]}
                  >
                    <Text style={styles.markerText}>{marker.title}</Text>
                  </View>
                ))}
            </ImageZoom>
          </View>
        </TapGestureHandler>
      </View>
    </GestureHandlerRootView>
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
  mapImage: {
    width: '100%',
    height: '100%',
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    color: 'white',
    fontSize: 10,
  },
});

export default MapScreen;