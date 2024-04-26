import { StackNavigationProp } from '@react-navigation/stack';

// Define the type for the navigation stack parameter list
export type RootStackParamList = {
  Home: undefined;
  Calendar: undefined;
  Lineup: undefined;
  Map: undefined;
  Settings: undefined;
  SearchScreen: undefined;
};

// Define the type for navigation prop of stack navigator
export type RootNavigationScreenProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<any, T>;
};
