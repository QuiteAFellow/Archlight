import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../../types';
import { useFavorites } from '../../../context/FavoritesContext';

type HomeScreenNavigationProp = BottomTabNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  openSettings: () => void;
}

// CustomButton component
const CustomButton: React.FC<{ title: string; onPress: () => void }> = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, openSettings }) => {
  const { favorites } = useFavorites();
  const hasFavoritedArtists = Object.keys(favorites).length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bonnaroo 2024</Text>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Calendar"
          onPress={() => navigation.navigate('Calendar')}
        />
        <CustomButton
          title="Lineup"
          onPress={() => navigation.navigate('FestivalLineup')}
        />
        <CustomButton
          title="Centeroo/Outeroo Maps"
          onPress={() => navigation.navigate('Map')}
        />
        <CustomButton
          title="Notification Settings"
          onPress={openSettings}
        />
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 30,
    marginHorizontal: 15,
    width: '40%', // Adjust width as needed
    height: 150,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;