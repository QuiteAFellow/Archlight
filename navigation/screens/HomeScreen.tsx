import * as React from 'react';
import { Text, View } from 'react-native';
import { RootNavigationScreenProps } from '../types';

export default function HomeScreen({ navigation }: RootNavigationScreenProps<'Home'>) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text
        onPress={() => alert('This is the "Home" screen.')}
        style={{ fontSize: 26, fontWeight: 'bold' }}>Home Screen</Text>
    </View>
  );
}