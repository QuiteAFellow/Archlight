import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import { Text, View } from 'react-native';
import { RootNavigationList } from '../MainContainer';

type Props = BottomTabScreenProps<RootNavigationList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text
        onPress={() => alert('This is the "Home" screen.')}
        style={{ fontSize: 26, fontWeight: 'bold' }}>Home Screen</Text>
    </View>
  );
}