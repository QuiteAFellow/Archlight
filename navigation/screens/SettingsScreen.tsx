import * as React from 'react';
import { Text, View } from 'react-native';
import { RootNavigationScreenProps } from '../types';

export default function SettingsScreen({ navigation }: RootNavigationScreenProps<'Settings'>) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text
        onPress={() => navigation.navigate('Home')}
        style={{ fontSize: 26, fontWeight: 'bold' }}
      >
        Settings Screen
      </Text>
    </View>
  );
}