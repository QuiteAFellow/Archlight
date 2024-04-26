import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// CustomButton component
const CustomButton: React.FC<{ title: string; onPress: () => void }> = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bonnaroo 2024</Text>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="My Personal Lineup (Currently Calendar)"
          onPress={() => navigation.navigate('Calendar')}
        />
        <CustomButton
          title="Favorite Artists (Currently Lineup)"
          onPress={() => navigation.navigate('Lineup')}
        />
        <CustomButton
          title="My Map Markers (Currently Map)"
          onPress={() => navigation.navigate('Map')}
        />
        <CustomButton
          title="Food Vendor List (Currently Settings)"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </View>
  );
}

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
  },
});
