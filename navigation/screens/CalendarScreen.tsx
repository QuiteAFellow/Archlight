import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import { Text, View } from 'react-native';
import { RootNavigationList } from '../MainContainer';

type Props = BottomTabScreenProps<RootNavigationList, 'Calendar'>;

export default function CalendarScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text
        onPress={() => navigation.navigate('Home')}
        style={{ fontSize: 26, fontWeight: 'bold' }}>Calendar Screen</Text>
    </View>
  );
}