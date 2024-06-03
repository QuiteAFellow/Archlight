import { StackNavigationProp } from '@react-navigation/stack';

// Define the type for the navigation stack parameter list
export type RootStackParamList = {
  Home: undefined;
  Calendar: undefined;
  Lineup: undefined;
  Map: undefined;
  Settings: undefined;
  ArtistBio: undefined;
};

// Define the type for navigation prop of stack navigator
export type RootNavigationScreenProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<any, T>;
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

