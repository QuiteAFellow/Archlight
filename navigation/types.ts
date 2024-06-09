import { NavigatorScreenParams } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Home: undefined;
  Calendar: undefined;
  Lineup: undefined; // Keep this as Lineup for the top-level screen
  Map: undefined;
  ArtistBio: { artist: Artist & { favorited: boolean } };
  'Food Vendors': undefined;
};

export type BottomTabParamList = {
  Home: NavigatorScreenParams<RootStackParamList>;
  Calendar: NavigatorScreenParams<RootStackParamList>;
  Lineup: NavigatorScreenParams<RootStackParamList>; // Keep this as Lineup for the top-level screen
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
  FestivalLineup: undefined; // Use this for the nested screen
  ArtistBio: { artist: Artist & { favorited: boolean } };
};

export type ArtistBioScreenRouteParams = {
  artist: Artist;
};