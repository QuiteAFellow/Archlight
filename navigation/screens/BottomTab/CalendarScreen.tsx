import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import artistsData from '../../../database/Artist Bios, Timesheet, Image Paths, Favorites.json';
import { useFavorites } from '../../../context/FavoritesContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Artist } from '../../types'; // Ensure correct import path

interface FestivalDayProps {
  day: string;
  data: Artist[];
  navigation: any;
  favorites: { [key: string]: boolean };
  toggleFavorite: (artist: Artist) => void;
}

const timeSlots = [
  '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM',
  '10 PM', '11 PM', '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM'
];

function timeToMinutes(time: string): number {
  const [hours, minutesPart] = time.split(':');
  const [minutes, period] = minutesPart.split(' ');

  let hourNumber = parseInt(hours, 10);
  let minuteNumber = parseInt(minutes, 10);

  if (period === 'PM' && hourNumber !== 12) hourNumber += 12;
  if (period === 'AM' && hourNumber === 12) hourNumber = 0;

  return hourNumber * 60 + minuteNumber;
}

const scale = 1;

function getArtistStyle(startTime: string, endTime: string): { top: number, height: number } {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  let durationMinutes = endMinutes - startMinutes;
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }
  const margin = 25;
  const top = (startMinutes < 12 * 60 ? startMinutes + 12 * 60 : startMinutes - 12 * 60) * scale + margin;
  return {
    top,
    height: durationMinutes * scale
  };
}

const FestivalDay: React.FC<FestivalDayProps> = ({ day, data, navigation, favorites, toggleFavorite }) => {
  const filteredData = data.filter((artist: Artist) => {
    const artistStartMinutes = timeToMinutes(artist.StartTime);
    const isSameDay = artist.Scheduled === day;
    const isAfterMidnight = artist.Scheduled === getPreviousDay(day) && artistStartMinutes < 5 * 60;
    return (isSameDay && artistStartMinutes >= 12 * 60) || isAfterMidnight;
  });

  const renderArtistName = (artist: Artist) => {
    if (artist.Artist.includes('&')) {
      const parts = artist.Artist.split('&');
      return (
        <Text style={styles.artistName}>
          <Text>{parts[0].trim()} </Text>
          <Text style={styles.artistNameSmall}>& {parts[1].trim()}</Text>
        </Text>
      );
    } else if (artist.Artist === "Lowdown Brass Band") {
      const parts = artist.Artist.split(' ');
      return (
        <Text style={styles.artistName}>
          <Text>{parts[0]}</Text>
          {'\n'}
          <Text style={styles.artistNameSmall}>{parts.slice(1).join(' ')}</Text>
        </Text>
      );
    }
    return <Text style={styles.artistName}>{artist.Artist}</Text>;
  };

  const renderStageColumn = (stage: string) => {
    const stageData = filteredData.filter((artist: Artist) => artist.Stage === stage);
    return stageData.map((artist: Artist, index: number) => {
      const isFavorited = favorites[artist.Artist] || false;
      return (
        <TouchableOpacity
          key={`${artist["AOTD #"]}-${day}-${index}`}
          style={[styles.artistSlot, getArtistStyle(artist.StartTime, artist.EndTime), isFavorited && styles.favoritedArtistSlot]}
          onPress={() => navigation.navigate('ArtistBio', { artist: { ...artist, favorited: isFavorited } })}
          onLongPress={() => toggleFavorite(artist)}
        >
          {renderArtistName(artist)}
          <Text style={styles.artistTime}>{artist.StartTime} - {artist.EndTime}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <ScrollView style={styles.dayContainer} horizontal={true}>
      <View style={styles.stagesContainer}>
        {['What Stage', 'Which Stage', 'The Other Stage', 'This Tent', 'That Tent', 'Who Stage'].map(stage => (
          <View key={stage} style={styles.stageColumn}>
            <Text style={styles.stageHeader}>{stage}</Text>
            {renderStageColumn(stage)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

function getPreviousDay(day: string): string {
  const days = ['Thursday', 'Friday', 'Saturday', 'Sunday'];
  const index = days.indexOf(day);
  return days[(index + days.length) % days.length];
}

const CalendarScreen: React.FC = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const [selectedDay, setSelectedDay] = useState<string>('Thursday');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const timeColumnRef = useRef<ScrollView>(null);

  const renderDayButtons = () => (
    ['Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
      <TouchableOpacity
        key={day}
        onPress={() => setSelectedDay(day)}
        style={[styles.dayButton, selectedDay === day && styles.selectedDayButton]}
      >
        <Text style={[styles.dayButtonText, selectedDay === day && styles.selectedDayButtonText]}>{day}</Text>
      </TouchableOpacity>
    ))
  );

  const syncScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (timeColumnRef.current) {
      timeColumnRef.current.scrollTo({ y: offsetY, animated: false });
    }
  };

  const filteredData = showFavoritesOnly
    ? artistsData.filter((artist: Artist) => favorites[artist.Artist])
    : artistsData;

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          style={[
            styles.favoriteToggle,
            showFavoritesOnly && styles.favoriteToggleActive,
            { opacity: Object.values(favorites).some(favorited => favorited) ? 1 : 0.2 }
          ]}
          disabled={!Object.values(favorites).some(favorited => favorited)}
        >
          <Ionicons name="heart" size={20} color={showFavoritesOnly ? 'white' : 'grey'} />
        </TouchableOpacity>
        {renderDayButtons()}
      </View>
      <View style={styles.scheduleContainer}>
        <ScrollView
          ref={timeColumnRef}
          style={styles.fixedTimeColumn}
          scrollEnabled={false}
          contentContainerStyle={{ height: (17 * 60) * scale }} // Limit to 5 AM (17 hours from 12 PM to 5 AM)
        >
          {timeSlots.map((time, index) => (
            <Text key={index} style={styles.timeLabel}>{time}</Text>
          ))}
        </ScrollView>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollableContainer}
          onScroll={syncScroll}
          scrollEventThrottle={16}
        >
          <FestivalDay day={selectedDay} data={filteredData} navigation={navigation} favorites={favorites} toggleFavorite={toggleFavorite} />
        </ScrollView>
      </View>
    </View>
  );
};

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
    backgroundColor: '#f0f0f0',
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
  dayContainer: {
    flexDirection: 'row',
    marginTop: 0,
    height: (17 * 60) * scale,
  },
  stagesContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  stageColumn: {
    width: 100,
    paddingVertical: 5,
    height: '100%',
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: '#444',
  },
  stageHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center'
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
  artistNameSmall: {
    fontSize: 7, // Adjust the size as needed
  },
  artistTime: {
    fontSize: 10.5,
    fontStyle: 'italic',
  },
  dayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#888',
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
    height: 40,
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
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#f0f0f0',
    zIndex: 2,
    marginTop: 5
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
    borderColor: '#007bff'
  },
});

export default CalendarScreen;