import React from 'react';
import { FavoritesProvider } from './context/FavoritesContext'; // Adjust the path if necessary
import { NavigationContainer } from '@react-navigation/native';
import MainContainer from './navigation/MainContainer'; // Adjust the path if necessary
import Toast from 'react-native-toast-message';

const App = () => {
  return (
    <FavoritesProvider>
      <NavigationContainer>
        <MainContainer />
        <Toast />
      </NavigationContainer>
    </FavoritesProvider>
  );
};

export default App;