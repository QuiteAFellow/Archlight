import { NavigatorScreenParams } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export interface Artist {
  "AOTD #": number;
  Artist: string;
  Scheduled: string;
  Description: string;
  Genres: string;
  Stage: string;
  StartTime: string;
  EndTime: string;
  Favorited: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  Calendar: undefined;
  Lineup: undefined;
  Map: undefined;
  ArtistBio: { artist: Artist & { favorited: boolean } };
  'Food Vendors': undefined;
};

export type BottomTabParamList = {
  Home: NavigatorScreenParams<RootStackParamList>;
  Calendar: NavigatorScreenParams<RootStackParamList>;
  Lineup: NavigatorScreenParams<RootStackParamList>;
  Map: NavigatorScreenParams<RootStackParamList>;
  'Food Vendors': NavigatorScreenParams<RootStackParamList>;
};

export type HomeScreenNavigationProp = BottomTabNavigationProp<BottomTabParamList, 'Home'>;

export type RootNavigationScreenProps<T extends keyof RootStackParamList> = {
  navigation: BottomTabNavigationProp<RootStackParamList, T>;
};

export type LineupStackParamList = {
  Lineup: undefined;
  ArtistBio: { artist: Artist & { favorited: boolean } };
};

export type ArtistBioScreenRouteParams = {
  artist: Artist & { favorited: boolean };
};

export interface FavoriteContextProps {
  favorites: { [key: string]: boolean };
  toggleFavorite: (artist: Artist) => void;
  setNotificationTimes: (times: number[]) => void;
  artists: Artist[];
}