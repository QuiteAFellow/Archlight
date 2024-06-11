import { NavigatorScreenParams } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

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

export interface Artist {
  "AOTD #": number;
  Artist: string;
  Scheduled: string;
  Description: string;
  Genres: string;
  Stage: string;
  StartTime: string;
  EndTime: string;
  Favorited: number;
}

export type LineupStackParamList = {
  Lineup: undefined;
  ArtistBio: { artist: Artist & { favorited: boolean } };
};

export type ArtistBioScreenRouteParams = {
  artist: Artist;
};

export interface FavoriteContextProps {
  favorites: { [key: string]: boolean };
  toggleFavorite: (artist: Artist) => void;
  artists: Artist[]; // Ensure this is included
}