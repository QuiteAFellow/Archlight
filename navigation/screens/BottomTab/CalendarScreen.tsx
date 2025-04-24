import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFavorites } from '../../../context/FavoritesContext';
import rawArtistsData from '../../../database/Artist Bios, Timesheet, Image Paths, Favorites.json';
import { Artist } from '../../types';
import { LineupStackParamList } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../ThemeContext';

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
  const margin = 30; // same as used in getArtistStyle
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const offsetMinutes = totalMinutes - 12 * 60;
  const currentDay = now.toLocaleString('en-us', { weekday: 'long' }); // Get current day as string

  if (offsetMinutes < 0 || offsetMinutes > 17 * 60 || currentDay !== selectedDay) {
    return { top: -1000, showNowLine: false }; // hide line if not selected day
  }

  return { top: offsetMinutes * scale + margin, showNowLine: true };
}

function getPreviousDay(day: string): string {
  const days = ['Thursday', 'Friday', 'Saturday', 'Sunday'];
  const index = days.indexOf(day);
  return days[(index + days.length) % days.length];
}

const CalendarScreen: React.FC = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { themeData, theme, setTheme } = useTheme();
  const [selectedDay, setSelectedDay] = useState<string>('Thursday');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [_, forceUpdate] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const timeColumnRef = useRef<ScrollView>(null);
  const navigation = useNavigation<NativeStackNavigationProp<LineupStackParamList>>();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const defaultStageWidth = 100;
  const stageWidth = isLandscape
    ? (width - 45) / STAGE_NAMES.length // Full screen width minus the fixed time column
    : defaultStageWidth;

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(prev => !prev); // trigger re-render every minute
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

      return (
        <TouchableOpacity
          key={`${artist["AOTD #"]}-${selectedDay}-${index}`}
          style={[
            styles.artistSlot,
            getArtistStyle(artist.StartTime, artist.EndTime),
            {
              backgroundColor: isFavorited
                ? themeData.FavoritedstageColors[stage]  // Use favorited stage colors when the artist is favorited
                : themeData.stageColors[stage],  // Use default stage color when not favorited
            },
            isFavorited && { borderColor: themeData.FavoritedstageColors[stage] }, // Use the favorited border color
          ]}
          onPress={() =>
            navigation.navigate('ArtistCarousel', {
              artists: sortedArtists,
              initialIndex: currentIndex,
            })
          }
          onLongPress={() => toggleFavorite(artist)}
        >
          <Text style={[styles.artistName, { color: isFavorited ? themeData.FavoritedstageTextColors[stage] : themeData.stageTextColors[stage] }]}>{artist.Artist}</Text>
          <Text style={[styles.artistTime, { color: isFavorited ? themeData.FavoritedstageTextColors[stage] : themeData.stageTextColors[stage] }]}>{artist.StartTime} - {artist.EndTime}</Text>
        </TouchableOpacity>
      );
    });
  };

  const { top, showNowLine } = getNowLineStyle(selectedDay);

  return (
    <View style={[styles.container, { backgroundColor: themeData.backgroundColor }]}>
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
          <ScrollView horizontal contentContainerStyle={{ width: contentWidth }}>
            <View style={{ height: scrollableHeight }}>
              <View style={styles.stageHeadersRow}>
                {STAGE_NAMES.map(stage => (
                  <Text key={stage} style={[styles.stageHeader, { width: stageWidth, color: themeData.textColor }]}>{stage}</Text>
                ))}
              </View>
              {showNowLine && (
                <View style={[styles.nowLine, { top }]}>
                  <View style={styles.nowDot} />
                  <View style={styles.nowLineBar} />
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
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
    fontSize: 11,
    fontWeight: 'bold',
  },
  artistTime: {
    fontSize: 10.5,
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