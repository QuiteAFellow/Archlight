import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect, CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFavorites } from '../../../context/FavoritesContext';
import rawArtistsData from '../../../database/Artist Bios, Timesheet, Image Paths, Favorites.json';
import { Artist } from '../../types';
import { LineupStackParamList } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import type { CalendarStackParamList } from '../Stack/CalendarStackNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { scheduleShotgunarooNotifications, cancelShotgunarooNotifications } from '../../../notifications';

const artistsData: Artist[] = rawArtistsData.map((artist: any) => ({
  "AOTD #": parseInt(artist["AOTD #"], 10),
  Artist: artist.Artist,
  Description: artist.Description,
  Genres: artist.Genres,
  Scheduled: artist.Scheduled,
  Stage: artist.Stage,
  StartTime: artist.StartTime || artist["Start Time"], // fallback
  EndTime: artist.EndTime || artist["End Time"],       // fallback
  Favorited: artist.Favorited === 'true' || artist.Favorited === true,
}));

const timeSlots = [
  '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM',
  '10 PM', '11 PM', '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM'
];

const scale = 1;
const STAGE_NAMES = ['What Stage', 'Which Stage', 'The Other', 'Infinity Stage', 'This Tent', 'That Tent'];

const extraMinutes = 17 * 60;
const scrollableHeight = extraMinutes * scale;

function timeToMinutes(time: string): number {
  const [hours, minutesPart] = time.split(':');
  const [minutes, period] = minutesPart.split(' ');

  let hourNumber = parseInt(hours, 10);
  const minuteNumber = parseInt(minutes, 10);

  if (period === 'PM' && hourNumber !== 12) hourNumber += 12;
  if (period === 'AM' && hourNumber === 12) hourNumber = 0;

  return hourNumber * 60 + minuteNumber;
}

function getArtistStyle(startTime: string, endTime: string): { top: number, height: number } {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  let durationMinutes = endMinutes - startMinutes;
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }
  const margin = 0;
  const top = (startMinutes < 12 * 60 ? startMinutes + 12 * 60 : startMinutes - 12 * 60) * scale + margin;
  return {
    top,
    height: durationMinutes * scale
  };
}

function getNowLineStyle(selectedDay: string): { top: number, showNowLine: boolean } {
  const margin = 30;
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Map each festival day to a date range
  const dayOrder = ['Thursday', 'Friday', 'Saturday', 'Sunday'];
  const selectedDayIndex = dayOrder.indexOf(selectedDay);

  if (selectedDayIndex === -1) {
    return { top: -1000, showNowLine: false };
  }

  const currentDayIndex = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const mappedDayIndex = (selectedDayIndex + 4) % 7; // Map to 0 = Sunday, etc.

  const isWithinFestivalDay = (
    (now.getHours() >= 12 && currentDayIndex === mappedDayIndex) || // 12pm - 11:59pm of selected day
    (now.getHours() < 4 && currentDayIndex === (mappedDayIndex + 1) % 7) // 12am - 4am of next day
  );

  if (!isWithinFestivalDay) {
    return { top: -1000, showNowLine: false };
  }

  let adjustedMinutes = totalMinutes;

  if (hours < 12) {
    adjustedMinutes += 24 * 60; // Shift early morning hours past midnight
  }

  const offsetMinutes = adjustedMinutes - 12 * 60;

  return { top: offsetMinutes * scale + margin, showNowLine: true };
}

function getPreviousDay(day: string): string {
  const days = ['Thursday', 'Friday', 'Saturday', 'Sunday'];
  const index = days.indexOf(day);
  return days[(index + days.length) % days.length];
}

const CalendarScreen: React.FC = () => {
  const [scrollTarget, setScrollTarget] = useState<{ artistId: number; day: string } | null>(null);
  const [highlightedArtistId, setHighlightedArtistId] = useState<number | null>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const { themeData, theme, setTheme } = useTheme();
  const [selectedDay, setSelectedDay] = useState<string>('Thursday');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [_, forceUpdate] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const timeColumnRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation<NativeStackNavigationProp<LineupStackParamList>>();
  const route = useRoute<RouteProp<CalendarStackParamList, 'FestivalSchedule'>>();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const defaultStageWidth = 100;
  const stageWidth = isLandscape
    ? (width - 45) / STAGE_NAMES.length // Full screen width minus the fixed time column
    : defaultStageWidth;

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(prev => !prev); // trigger re-render every minute
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.day && route.params?.artistId) {
        setSelectedDay(route.params.day);
        setScrollTarget({ artistId: route.params.artistId, day: route.params.day });
      }
    }, [route.params])
  );

  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    if (
      scrollTarget &&
      selectedDay === scrollTarget.day &&
      layoutReady &&
      scrollViewRef.current &&
      horizontalScrollRef.current
    ) {
      const targetArtist = artistsData.find(
        artist =>
          artist["AOTD #"] === scrollTarget.artistId &&
          artist.Scheduled === scrollTarget.day
      );

      if (targetArtist) {
        const { top } = getArtistStyle(targetArtist.StartTime, targetArtist.EndTime);
        const stageIndex = STAGE_NAMES.findIndex(stage => stage === targetArtist.Stage);
        const horizontalOffset = stageIndex * stageWidth;

        {/*console.log('Scrolling to', { top, horizontalOffset }); */} // logging scroll target for artist bio navigation

        scrollViewRef.current.scrollTo({ y: top - 20, animated: true });
        horizontalScrollRef.current.scrollTo({ x: horizontalOffset - 20, animated: true });

        setHighlightedArtistId(targetArtist["AOTD #"]);
        setTimeout(() => {
          setHighlightedArtistId(null); // Clear highlight after a short time
        }, 2000);

        // Only clear after scroll is performed
        setTimeout(() => {
          setScrollTarget(null);
          navigation.dispatch(
            CommonActions.setParams({ day: undefined, artistId: undefined })
          );
        }, 500); // Give time for scroll to complete
      }
    }
  }, [layoutReady, selectedDay, scrollTarget]);

  const contentWidth = isLandscape
    ? width - 45 // Same as above, no scrolling
    : STAGE_NAMES.length * defaultStageWidth; // Scroll in portrait
  const filteredData = showFavoritesOnly
    ? artistsData.filter((artist: Artist) => favorites[artist["AOTD #"]])
    : artistsData;

  const syncScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (timeColumnRef.current) {
      timeColumnRef.current.scrollTo({ y: offsetY, animated: false });
    }
  };

  const renderDayButtons = () => (
    ['Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
      <TouchableOpacity
        key={day}
        onPress={() => setSelectedDay(day)}
        style={[
          styles.dayButton,
          selectedDay === day &&
            { backgroundColor: themeData.highlightColor, borderColor: 'transparent' },
            selectedDay !== day && { borderColor: themeData.unselectedborder }
        ]}
      >
        <Text style={[
          styles.dayButtonText,
          selectedDay === day
            ? { color: theme === 'Light' ? 'white' : themeData.highlightTextColor }
            : { color: themeData.textColor }
        ]}>
          {day}
        </Text>
      </TouchableOpacity>
    ))
  );

  const renderArtistName = (artist: Artist) => (
    <Text style={[styles.artistName, { color: themeData.textColor }]}>{artist.Artist}</Text>
  );

  const renderStageColumn = (stage: string) => {
    const filtered = filteredData.filter((artist: Artist) => {
      const startMinutes = timeToMinutes(artist.StartTime);
      const isSameDay = artist.Scheduled === selectedDay;
      const isAfterMidnight = artist.Scheduled === getPreviousDay(selectedDay) && startMinutes < 5 * 60;
      return ((isSameDay && startMinutes >= 12 * 60) || isAfterMidnight) && artist.Stage === stage;
    });

    return filtered.map((artist: Artist, index: number) => {
      const isFavorited = favorites[artist["AOTD #"]] || false;
      const stageColor = isFavorited
        ? themeData.FavoritedstageColors[stage]
        : themeData.stageColors[stage];

      const stageTextColor = isFavorited
        ? themeData.FavoritedstageTextColors[stage]
        : themeData.stageTextColors[stage];

      const sortedArtists = filteredData
        .filter(a => {
          const startMinutes = timeToMinutes(a.StartTime);
          const isSameDay = a.Scheduled === selectedDay;
          const isAfterMidnight = a.Scheduled === getPreviousDay(selectedDay) && startMinutes < 5 * 60;
          return isSameDay || isAfterMidnight;
        })
        .sort((a, b) => a.Artist.localeCompare(b.Artist));
      const currentIndex = sortedArtists.findIndex(
        (a) =>
          a.Artist === artist.Artist &&
          a.Stage === artist.Stage &&
          a.StartTime === artist.StartTime
      );
      const animatedTextColor = highlightedArtistId === artist["AOTD #"]
        ? pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['black', stageTextColor]
          })
        : stageTextColor;

      return (
        <Animated.View
          key={`${artist["AOTD #"]}-${selectedDay}-${index}`}
          style={[
            styles.artistSlot,
            getArtistStyle(artist.StartTime, artist.EndTime),
            {
              backgroundColor: highlightedArtistId === artist["AOTD #"]
                ? pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['white', isFavorited
                      ? themeData.FavoritedstageColors[stage]
                      : themeData.stageColors[stage]]
                  })
                : isFavorited
                  ? themeData.FavoritedstageColors[stage]
                  : themeData.stageColors[stage],
              borderColor: highlightedArtistId === artist["AOTD #"]
                ? themeData.unselectedborder // <-- pulse color
                : (isFavorited
                    ? themeData.FavoritedstageColors[stage]
                    : themeData.unselectedborder),
              borderWidth: 1,
            }
          ]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() =>
              navigation.navigate('ArtistCarousel', {
                artists: sortedArtists,
                initialIndex: currentIndex,
              })
            }
            onLongPress={() => toggleFavorite(artist)}
            activeOpacity={0.8}
          >
            <Animated.Text style={[styles.artistName, { color: animatedTextColor }]}>{artist.Artist}</Animated.Text>
            <Animated.Text style={[styles.artistTime, { color: animatedTextColor }]}>{artist.StartTime} - {artist.EndTime}</Animated.Text>
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  const { top, showNowLine } = getNowLineStyle(selectedDay);

  const Container = Platform.OS === 'ios' ? SafeAreaView : View;

  useEffect(() => {
    if (highlightedArtistId !== null) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 150, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 150, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 150, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
      ]).start();
    }
  }, [highlightedArtistId]);

  // Calculate the top position for 2:00 PM
  const shotgunarooMinutes = 14 * 60; // 2:00 PM in minutes
  const shotgunarooTop = (shotgunarooMinutes - 12 * 60) * scale+10;

  const [shotgunarooFavorited, setShotgunarooFavorited] = useState(false);

  const SHOTGUNAROO_KEY = 'shotgunarooFavorited';

  useEffect(() => {
    // Load favorited status on mount
    AsyncStorage.getItem(SHOTGUNAROO_KEY).then(val => {
      if (val === 'true') setShotgunarooFavorited(true);
    });
  }, []);

  const [notificationTimes, setNotificationTimes] = useState<number[]>([5]); // default

  useEffect(() => {
    AsyncStorage.getItem('notificationTimes').then(val => {
      if (val) setNotificationTimes(JSON.parse(val));
    });
  }, []);

  const handleShotgunarooFavorite = async () => {
    const newVal = !shotgunarooFavorited;
    setShotgunarooFavorited(newVal);
    await AsyncStorage.setItem(SHOTGUNAROO_KEY, newVal ? 'true' : 'false');

    if (newVal) {
      await scheduleShotgunarooNotifications(notificationTimes);
    } else {
      await cancelShotgunarooNotifications();
    }
  };

  return (
    <Container style={[styles.container, { backgroundColor: themeData.backgroundColor }]}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          style={[
            styles.favoriteToggle,
            { backgroundColor: showFavoritesOnly ? themeData.highlightColor : 'transparent' },
            { borderColor: showFavoritesOnly ? 'transparent' : themeData.textColor }
          ]}
          disabled={!Object.values(favorites).some(f => f)}
        >
          <Ionicons name="heart" size={20} color={ showFavoritesOnly ? themeData.highlightTextColor : themeData.textColor } />
        </TouchableOpacity>
        {renderDayButtons()}
      </View>
      <View style={styles.scheduleContainer}>
        <ScrollView
          ref={timeColumnRef}
          style={[styles.fixedTimeColumn, { backgroundColor: themeData.backgroundColor }]}
          scrollEnabled={false}
          contentContainerStyle={{ height: scrollableHeight }}
        >
          {timeSlots.map((time, i) => (
            <Text key={i} style={[styles.timeLabel, { color: themeData.textColor }]}>{time}</Text>
          ))}
        </ScrollView>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollableContainer}
          onScroll={syncScroll}
          scrollEventThrottle={16}
        >
          <ScrollView
            horizontal
            ref={horizontalScrollRef}
            contentContainerStyle={{ width: contentWidth }}
          >
            <View
              style={{ height: scrollableHeight }}
              onLayout={() => setLayoutReady(true)}
            >
              <View style={styles.stageHeadersRow}>
                {STAGE_NAMES.map(stage => (
                  <View
                    key={stage}
                    style={[
                      { width: stageWidth },
                      styles.stageHeaderContainer,
                      { borderBottomColor: '#444' } // <-- dynamic color
                    ]}
                  >
                    <Text style={[styles.stageHeader, { color: themeData.textColor }]}>
                      {stage}
                    </Text>
                  </View>
                ))}
              </View>
              {showNowLine && (
                <View style={[styles.nowLine, { top }]}>
                  <View style={styles.nowDot} />
                  <View style={styles.nowLineBar} />
                </View>
              )}
              {selectedDay === 'Thursday' && (
                <View style={{
                  position: 'absolute',
                  left: 0, // Now relative to the scrollable area, so left: 0 is correct
                  right: 0,
                  top: shotgunarooTop,
                  alignItems: 'center',
                  zIndex: 10,
                  pointerEvents: 'box-none'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={{
                      backgroundColor: themeData.backgroundColor,
                      color: shotgunarooFavorited ? themeData.highlightColor : themeData.textColor,
                      fontWeight: 'bold',
                      paddingHorizontal: 6,
                      borderRadius: 4,
                      fontSize: 12,
                    }}>
                      Shotgunaroo 🍻
                    </Text>
                    <TouchableOpacity
                      onPress={handleShotgunarooFavorite}
                      style={{ marginLeft: 6 }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={shotgunarooFavorited ? 'heart' : 'heart-outline'}
                        size={16}
                        color={shotgunarooFavorited ? themeData.highlightColor : themeData.textColor}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{
                    height: 2,
                    width: '100%',
                    backgroundColor: shotgunarooFavorited ? themeData.highlightColor : themeData.textColor,
                    opacity: 0.7,
                  }} />
                </View>
              )}
              <View style={styles.stagesRow}>
                {STAGE_NAMES.map(stage => (
                  <View key={stage} style={[styles.stageColumn, { width: stageWidth, height: scrollableHeight }]}>
                    {renderStageColumn(stage)}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    </Container>
  );
};

// Styles are adjusted to work with themes
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scheduleContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  fixedTimeColumn: {
    width: 45,
    paddingHorizontal: 9,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  scrollableContainer: {
    flex: 1,
    marginLeft: 45,
  },
  timeLabel: {
    height: 60,
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    zIndex: 2,
    marginTop: 5,
  },
  favoriteToggle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    padding: 10,
    marginRight: 5,
    marginLeft: 10,
    width: 40,
    height: 40,
  },
  favoriteToggleActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  dayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
    height: 40,
    borderWidth: 1, // Add borderWidth to ensure it shows
  },
  selectedDayButton: {
    backgroundColor: '#007bff',
  },
  dayButtonText: {
    color: 'white',
  },
  selectedDayButtonText: {
    fontWeight: 'bold',
  },
  stageHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 5,
  },
  stageHeaderContainer: {
    borderBottomWidth: 1,
  },
  stageHeadersRow: {
    flexDirection: 'row',
  },
  stagesRow: {
    flexDirection: 'row',
  },
  stageColumn: {
    paddingVertical: 5,
    height: (17 * 60) * scale,
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: '#444',
  },
  artistSlot: {
    position: 'absolute',
    width: '92%',
    backgroundColor: 'lightgrey',
    padding: 2,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    left: 4,
  },
  favoritedArtistSlot: {
    backgroundColor: 'lightblue',
    borderColor: '#00d0ff',
  },
  artistName: {
    fontSize: Platform.select({
      ios: 10,
      android: 11
    }),
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  artistTime: {
    fontSize: Platform.select({
      ios: 9,
      android: 10.5
    }),
    fontStyle: 'italic',
  },
  nowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  nowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    left: -3,
    zIndex: 999,
  },
  nowLineBar: {
    height: 1,
    backgroundColor: 'red',
    flex: 1,
    marginLeft: -4,
    zIndex: 998,
  },
});

export default CalendarScreen;