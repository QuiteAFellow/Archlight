import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from '../../../context/FavoritesContext';
import { useTheme } from '../ThemeContext'; // Import theme context

interface Artist {
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

interface FestivalDayProps {
  day: string;
  data: Artist[];
  navigation: any;
  favorites: { [key: string]: boolean };
  toggleFavorite: (artist: Artist) => void;
}

const timeToMinutes = (time: string): number => {
  const [hours, minutesPart] = time.split(':');
  const [minutes, period] = minutesPart.split(' ');

  let hourNumber = parseInt(hours, 10);
  let minuteNumber = parseInt(minutes, 10);

  if (period === 'PM' && hourNumber !== 12) hourNumber += 12;
  if (period === 'AM' && hourNumber === 12) hourNumber = 0;

  return hourNumber * 60 + minuteNumber;
};

const getArtistStyle = (startTime: string, endTime: string): { top: number, height: number } => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  let durationMinutes = endMinutes - startMinutes;
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }
  const margin = 25;
  const top = (startMinutes < 12 * 60 ? startMinutes + 12 * 60 : startMinutes - 12 * 60) + margin;
  return {
    top,
    height: durationMinutes
  };
};

const FestivalDay: React.FC<FestivalDayProps> = ({ day, data, navigation, favorites, toggleFavorite }) => {
  const { themeData } = useTheme();  // Get themeData from context

  const filteredData = data.filter(artist => {
    const artistStartMinutes = timeToMinutes(artist.StartTime);
    const isSameDay = artist.Scheduled === day;
    const isAfterMidnight = artist.Scheduled === getPreviousDay(day) && artistStartMinutes < 5 * 60;
    return (isSameDay && artistStartMinutes >= 12 * 60) || isAfterMidnight;
  });

  const renderStageColumn = (stage: string) => {
    const stageData = filteredData.filter(artist => artist.Stage === stage);
    return stageData.map((artist, index) => {
      const isFavorited = favorites[artist["AOTD #"]] || false;
      const heartColor = isFavorited ? (themeData.highlightColor) : themeData.textColor; // Heart color based on theme
      return (
        <TouchableOpacity
          key={`${artist["AOTD #"]}-${day}-${index}`}
          style={[
            styles.artistSlot,
            getArtistStyle(artist.StartTime, artist.EndTime),
            isFavorited && { backgroundColor: themeData.highlightColor },  // Favorited artist styling
          ]}
          onPress={() => navigation.navigate('ArtistBio', { artist: { ...artist, favorited: isFavorited } })}
          onLongPress={() => toggleFavorite(artist)}
        >
          <Text style={[styles.artistName, { color: themeData.textColor }]}>{artist.Artist}</Text>
          <Text style={[styles.artistTime, { color: themeData.textColor }]}>{artist.StartTime} - {artist.EndTime}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <ScrollView style={styles.dayContainer} horizontal={true}>
      <View style={styles.stagesContainer}>
        {['What Stage', 'Which Stage', 'The Other', 'Infinity Stage', 'This Tent', 'That Tent'].map(stage => (
          <View key={stage} style={styles.stageColumn}>
            <Text style={[styles.stageHeader, { color: themeData.textColor }]}>{stage}</Text>
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

const styles = StyleSheet.create({
  dayContainer: {
    flexDirection: 'row',
    marginTop: 0,
    height: 17 * 60,
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
    textAlign: 'center',
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
  artistName: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  artistTime: {
    fontSize: 10.5,
    fontStyle: 'italic',
  },
});

export default FestivalDay;