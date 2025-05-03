import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../../types';
import { useFavorites } from '../../../context/FavoritesContext';
import { useTheme } from '../ThemeContext'; // Ensure correct import for the theme

type HomeScreenNavigationProp = BottomTabNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  openSettings: () => void;
}

// CustomButton component
const CustomButton: React.FC<{ title: string; onPress: () => void; buttonColor: string }> = ({ title, onPress, buttonColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, { backgroundColor: buttonColor }]}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, openSettings }) => {
  const { favorites } = useFavorites();
  const { theme, themeData } = useTheme(); // Use theme context
  const hasFavoritedArtists = Object.keys(favorites).length > 0;

  const [logo, setLogo] = useState<any>(null); // Use 'any' initially for logo state

  // Set the correct logo based on the selected theme
  useEffect(() => {
    switch (theme) {
      case 'Light':
        setLogo(require('../../../assets/Icons/Bonnaroo Logo 2025 - White.png')); // Correct the path to the logo
        break;
      case 'Bonnaroo':
        setLogo(require('../../../assets/Icons/Bonnaroo Logo 2025 - Bonnaroo.png')); // Correct path for Bonnaroo theme
        break;
      case 'OLED':
        setLogo(require('../../../assets/Icons/Bonnaroo Logo 2025 - OLED.png')); // Correct path for OLED theme
        break;
      default:
        setLogo(require('../../../assets/Icons/Bonnaroo Logo 2025 - White.png')); // Fallback logo
    }
  }, [theme]);

  return (
    <View style={[styles.container, { backgroundColor: themeData.backgroundColor }]}>
      {logo && <Image source={logo} style={styles.logo} resizeMode="contain" />}
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Calendar"
          onPress={() => navigation.navigate('Calendar')}
          buttonColor={themeData.buttonColors.calendar} // Pass color from theme
        />
        <CustomButton
          title="Lineup"
          onPress={() => navigation.navigate('Lineup')}
          buttonColor={themeData.buttonColors.lineup} // Pass color from theme
        />
        <CustomButton
          title="Centeroo/Outeroo Maps"
          onPress={() => navigation.navigate('Map')}
          buttonColor={themeData.buttonColors.map} // Pass color from theme
        />
        <CustomButton
          title="Theme/Notification Settings"
          onPress={openSettings}
          buttonColor={themeData.buttonColors.settings} // Pass color from theme
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
    justifyContent: 'flex-start',
    paddingTop: 40,  // Add some space at the top for the logo
  },
  logo: {
    width: 250,  // Adjust the width of the logo
    height: 250,  // Adjust the height of the logo
    marginBottom: 30,  // Space between logo and buttons
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 30,
    marginHorizontal: 15,
    width: '40%', // Adjust width as needed
    height: 150,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  yearText: {
    fontSize: 32,
    fontWeight: '900', // Set a higher font weight to make the text thicker
    textAlign: 'center',
    marginTop: -50,
    marginBottom: 20,
    letterSpacing: 2,
  }
});

export default HomeScreen;