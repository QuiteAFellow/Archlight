import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { FavoritesProvider } from './context/FavoritesContext';
import MainContainer from './navigation/MainContainer';
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