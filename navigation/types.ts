import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootNavigationList = {
  Home: undefined;
  Calendar: undefined;
  Lineup: undefined;
  Map: undefined;
  Settings: undefined;
};

export type RootNavigationScreenProps<T extends keyof RootNavigationList> =
BottomTabScreenProps<RootNavigationList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootNavigationList {}
  }
}
