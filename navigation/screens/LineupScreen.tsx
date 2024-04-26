import * as React from 'react';
import { Text, View, Button } from 'react-native';
import { RootNavigationScreenProps } from '../types';

export default function LineupScreen({ navigation }: RootNavigationScreenProps<'Lineup'>) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text
        onPress={() => navigation.navigate('Home')}
        style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 20 }}
      >
        Lineup Screen
      </Text>
      <Button title="Search for Artist" onPress={() => navigation.navigate('SearchScreen')} />
    </View>
  );
}