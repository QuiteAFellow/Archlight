import * as React from 'react';
import { Text, View } from 'react-native';
import { RootNavigationScreenProps } from '../types';

export default function CalendarScreen({ navigation }: RootNavigationScreenProps<'Calendar'>) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text
        onPress={() => navigation.navigate('Home')}
        style={{ fontSize: 26, fontWeight: 'bold' }}
      >
        Calendar Screen
      </Text>
    </View>
  );
}