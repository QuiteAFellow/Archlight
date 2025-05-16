import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../../types';
import { useFavorites } from '../../../context/FavoritesContext';
import { useTheme } from '../ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const confetti = require('../../../assets/animations/Confetti.json');

type HomeScreenNavigationProp = BottomTabNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  openSettings: () => void;
}

const CustomButton: React.FC<{
  title: string;
  onPress: () => void;
  buttonColor: string;
  iconName: string;
}> = ({ title, onPress, buttonColor, iconName }) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, { backgroundColor: buttonColor }]}>
    <Ionicons name={iconName} size={24} color="#000000" style={styles.icon} />
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, openSettings }) => {
  const { favorites } = useFavorites();
  const { theme, themeData } = useTheme();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showHappyRoo, setShowHappyRoo] = useState(false);
  const [logo, setLogo] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [simulate, setSimulate] = useState(false);
  const [countdownEnabled, setCountdownEnabled] = useState(false);

  useFocusEffect(() => {
    const loadCountdownSetting = async () => {
      const storedCountdown = await AsyncStorage.getItem('countdownEnabled');
      if (storedCountdown !== null) setCountdownEnabled(JSON.parse(storedCountdown));
    };
    loadCountdownSetting();
  });

  useEffect(() => {
    switch (theme) {
      case 'Light':
      case 'Bonnaroo':
      case 'OLED':
      default:
        setLogo(require('../../../assets/Icons/Archlight Splash 2025 - O.png'));
    }
  }, [theme]);

  useEffect(() => {
    const targetDate = new Date('2025-06-12T12:00:00-05:00');
    const endFreezeDate = new Date('2025-06-12T15:00:00-05:00');

    const timer = setInterval(() => {
      const now = simulate ? new Date('2025-06-12T12:30:00-05:00') : new Date();

      if (now < targetDate) {
        const diff = targetDate.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setCountdown({ days, hours, minutes, seconds });
        setShowHappyRoo(false);
        setShowConfetti(false);
      } else if (now >= targetDate && now < endFreezeDate) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setShowHappyRoo(true);
        setShowConfetti(true);
      } else {
        clearInterval(timer);
        setShowConfetti(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [simulate]);

  const Container = Platform.OS === 'ios' ? SafeAreaView : View;

  return (
    <View style={{ flex: 1 }}>
      {showConfetti && (
        <View pointerEvents='none' style={[StyleSheet.absoluteFillObject, { zIndex: 1000 }]}>
          <LottieView
            source={confetti}
            autoPlay
            loop
            resizeMode="cover"
            style={styles.lottie}
          />
        </View>
      )}
      <Container style={[styles.container, { backgroundColor: themeData.backgroundColor }]}>
        {logo && <Image source={logo} style={styles.logo} resizeMode="contain" />}
        <View style={{ height: 90, justifyContent: 'center' }}>
          {countdownEnabled && (
            <View style={styles.countdownContainer}>
              <Text style={[styles.countdownlabel, { color: themeData.textColor }]}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: themeData.textColor }}>Countdown: </Text>
                <Text style={[styles.number, { color: themeData.textColor }]}>{countdown.days}</Text>d{' '}
                <Text style={[styles.number, { color: themeData.textColor }]}>{countdown.hours}</Text>h{' '}
                <Text style={[styles.number, { color: themeData.textColor }]}>{countdown.minutes}</Text>m{' '}
                <Text style={[styles.number, { color: themeData.textColor }]}>{countdown.seconds}</Text>s
              </Text>
              <View style={styles.happyRooWrapper}>
                {showHappyRoo && (
                  <Text style={[styles.happyRooText, { color: themeData.highlightColor }]}>Happy Roo!</Text>
                )}
              </View>
            </View>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Calendar"
            onPress={() => navigation.navigate('Calendar')}
            buttonColor={themeData.buttonColors.calendar}
            iconName="calendar"
          />
          <CustomButton
            title="Lineup"
            onPress={() => navigation.navigate('Lineup')}
            buttonColor={themeData.buttonColors.lineup}
            iconName="list"
          />
          <CustomButton
            title="Centeroo/Outeroo Maps"
            onPress={() => navigation.navigate('Map')}
            buttonColor={themeData.buttonColors.map}
            iconName="map"
          />
          <CustomButton
            title="Theme/Notification Settings"
            onPress={openSettings}
            buttonColor={themeData.buttonColors.settings}
            iconName="settings"
          />
        </View>
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: -25,
    marginTop: -15,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: -10,
    marginTop: 30,
  },
  countdownlabel: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  number: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  happyRooWrapper: {
    minHeight: 34,
    justifyContent: 'center',
  },
  happyRooText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -10,
  },
  lottie: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    //pointerEvents: 'none',
  },
  simButton: {
    marginTop: 10,
    backgroundColor: '#888',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 30,
    marginHorizontal: 15,
    width: '40%',
    height: 150,
  },
  buttonText: {
    color: '#000000',
    fontSize: Platform.select({
      ios: 13,
      android: 14,
    }),
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  icon: {
    marginBottom: 5,
  },
});

export default HomeScreen;