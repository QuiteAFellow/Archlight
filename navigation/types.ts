import { NavigatorScreenParams, PrivateValueStore } from '@react-navigation/native';
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

export type ArtistBioScreenRouteParams = {
  artists: Artist[];
  initialIndex: number;
};

export type RootStackParamList = {
  Home: undefined;
  Calendar: undefined;
  Lineup: undefined;
  Map: undefined;
  ArtistBio: { artist: Artist };
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

export type ArtistCarouselParams = {
  artists: Artist[];
  initialIndex: number;
}

export type LineupStackParamList = {
  FestivalLineup: undefined;
  ArtistBio: ArtistBioScreenRouteParams;
  ArtistCarousel: { artists: Artist[]; initialIndex: number};
};

export type CalendarStackParamList = {
  FestivalSchedule: undefined;
  ArtistBio: { artist: Artist };
  ArtistCarousel: ArtistCarouselParams;
}

export interface FavoriteContextProps {
  favorites: { [key: string]: boolean };
  toggleFavorite: (artist: Artist) => void;
  setNotificationTimes: (times: number[]) => void;
  artists: Artist[];
}