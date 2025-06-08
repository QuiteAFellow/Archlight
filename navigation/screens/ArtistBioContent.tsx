import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Artist } from '../types';
import artistImages from '../../assets/utils/artistImages';
import { useFavorites } from '../../context/FavoritesContext';
import { useTheme } from './ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CalendarStackParamList } from '../screens/Stack/CalendarStackNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';

type CalendarNav = NativeStackNavigationProp<CalendarStackParamList, 'FestivalSchedule'>;

type Props = {
    artist: Artist;
};

const STAGE_OPTIONS = ['What Stage', 'Which Stage', 'The Other', 'Infinity Stage', 'This Tent', 'That Tent'];
const DAY_OPTIONS = ['Thursday', 'Friday', 'Saturday', 'Sunday'];
const ARTIST_EDITS_KEY = 'artistEdits';

const ArtistBioContent: React.FC<Props> = ({ artist }) => {
    const navigation = useNavigation<CalendarNav>();
    const { favorites, toggleFavorite } = useFavorites();
    const { themeData, theme } = useTheme();
    const isFavorited = favorites[artist["AOTD #"]] || false;
    const descriptionSegments = artist.Description.split('[PAGE_BREAK]');
    const [editMode, setEditMode] = useState(false);
    const [allowArtistEdit, setAllowArtistEdit] = useState(false);

    // Editable fields
    const [editDay, setEditDay] = useState(artist.Scheduled);
    const [editStage, setEditStage] = useState(artist.Stage);
    const [editStart, setEditStart] = useState(artist.StartTime);
    const [editEnd, setEditEnd] = useState(artist.EndTime);

    // DropDownPicker state for Day
    const [openDay, setOpenDay] = useState(false);
    const [dayValue, setDayValue] = useState(artist.Scheduled);
    const [dayItems, setDayItems] = useState(DAY_OPTIONS.map(day => ({ label: day, value: day })));

    // DropDownPicker state for Stage
    const [openStage, setOpenStage] = useState(false);
    const [stageValue, setStageValue] = useState(artist.Stage);
    const [stageItems, setStageItems] = useState(STAGE_OPTIONS.map(stage => ({ label: stage, value: stage })));

    // Heart icon logic
    const heartColor = isFavorited ? (theme === 'Light' ? 'red' : themeData.highlightColor) : themeData.textColor;
    const heartIcon = isFavorited ? 'heart' : 'heart-outline';

    const Container = Platform.OS === 'ios' ? SafeAreaView : View;

    // Load allowArtistEdit from AsyncStorage
    useEffect(() => {
        AsyncStorage.getItem('allowArtistEdit').then(val => setAllowArtistEdit(val === 'true'));
    }, []);

    // Load artist edits from AsyncStorage and merge with original data
    useEffect(() => {
        const loadEdits = async () => {
            try {
                const json = await AsyncStorage.getItem(ARTIST_EDITS_KEY);
                const edits = json ? JSON.parse(json) : {};
                const artistEdit = edits[artist["AOTD #"]];
                if (artistEdit) {
                    setEditDay(artistEdit.Scheduled ?? artist.Scheduled);
                    setEditStage(artistEdit.Stage ?? artist.Stage);
                    setEditStart(artistEdit.StartTime ?? artist.StartTime);
                    setEditEnd(artistEdit.EndTime ?? artist.EndTime);
                } else {
                    setEditDay(artist.Scheduled);
                    setEditStage(artist.Stage);
                    setEditStart(artist.StartTime);
                    setEditEnd(artist.EndTime);
                }
            } catch (e) {
                setEditDay(artist.Scheduled);
                setEditStage(artist.Stage);
                setEditStart(artist.StartTime);
                setEditEnd(artist.EndTime);
            }
        };
        loadEdits();
    }, [artist]);

    // Sync dropdowns with edit fields
    useEffect(() => {
        setDayValue(editDay);
    }, [editDay]);
    useEffect(() => {
        setStageValue(editStage);
    }, [editStage]);

    // Toggle favorite
    const handleToggleFavorite = () => {
        toggleFavorite(artist);
    };

    // Add this helper function inside your component (before handleSaveEdit)
    function parseTimeToMinutes(timeStr: string): number {
        // Expects format like "5:45 PM" or "12:00 AM"
        const [time, period] = timeStr.trim().split(' ');
        let [hour, minute] = time.split(':').map(Number);
        if (period.toLowerCase() === 'pm' && hour !== 12) hour += 12;
        if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
        return hour * 60 + minute;
    }

    // Save edits to AsyncStorage
    const handleSaveEdit = async () => {
        if (!DAY_OPTIONS.includes(dayValue)) {
            Toast.show({ type: 'error', text1: 'Invalid day' });
            return;
        }
        if (!STAGE_OPTIONS.includes(stageValue)) {
            Toast.show({ type: 'error', text1: 'Invalid stage' });
            return;
        }

        const startMinutes = parseTimeToMinutes(editStart);
        const endMinutes = parseTimeToMinutes(editEnd);

        // Calendar runs from 12:00 PM (720) to 5:00 AM (299 next day)
        const isInCalendarWindow = (min: number) =>
            (min >= 720 && min < 1440) || (min >= 0 && min < 300);

        if (!isInCalendarWindow(startMinutes) || !isInCalendarWindow(endMinutes)) {
            Toast.show({ type: 'error', text1: 'Times must be between 12:00 PM and 5:00 AM' });
            return;
        }

        // Check order: start must be before end, allowing for overnight sets
        let isOrderValid = false;
        if (startMinutes < endMinutes && startMinutes >= 720 && endMinutes < 1440) {
            // Same day, e.g. 5:45 PM - 6:30 PM
            isOrderValid = true;
        } else if (startMinutes >= 720 && endMinutes < 300) {
            // Overnight, e.g. 11:30 PM - 2:00 AM
            isOrderValid = true;
        }
        if (!isOrderValid) {
            Toast.show({ type: 'error', text1: 'Start time must be before end time and fit on the calendar.' });
            return;
        }

        // Save to AsyncStorage
        try {
            const json = await AsyncStorage.getItem(ARTIST_EDITS_KEY);
            const edits = json ? JSON.parse(json) : {};
            edits[artist["AOTD #"]] = {
                Scheduled: dayValue,
                Stage: stageValue,
                StartTime: editStart,
                EndTime: editEnd,
            };
            await AsyncStorage.setItem(ARTIST_EDITS_KEY, JSON.stringify(edits));
            setEditDay(dayValue);
            setEditStage(stageValue);
            setEditMode(false);
            Toast.show({ type: 'success', text1: 'Artist info updated!' });
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed to save edits.' });
        }
    };

    // Revert edits for this artist
    const handleRevertEdit = async () => {
        try {
            const json = await AsyncStorage.getItem(ARTIST_EDITS_KEY);
            const edits = json ? JSON.parse(json) : {};
            delete edits[artist["AOTD #"]];
            await AsyncStorage.setItem(ARTIST_EDITS_KEY, JSON.stringify(edits));
            setEditDay(artist.Scheduled);
            setEditStage(artist.Stage);
            setEditStart(artist.StartTime);
            setEditEnd(artist.EndTime);
            setEditMode(false);
            Toast.show({ type: 'success', text1: 'Reverted to original info.' });
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed to revert edits.' });
        }
    };

    return (
        <Container style={[styles.container, { backgroundColor: themeData.backgroundColor }]}>
            <ScrollView style={[styles.container, { backgroundColor: themeData.backgroundColor }]}>
                <View>
                    <Image source={artistImages[artist.Artist]} style={styles.imageHeader} resizeMode="cover" />
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color='#000000' />
                    </TouchableOpacity>
                    {/* Developer Edit Button */}
                    {allowArtistEdit && (
                        <View style={{ flexDirection: 'row', position: 'absolute', top: 40, right: 20, zIndex: 100 }}>
                            <TouchableOpacity
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: 'white',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 10,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 2,
                                    elevation: 3,
                                }}
                                onPress={() => editMode ? handleSaveEdit() : setEditMode(true)}
                            >
                                <Ionicons
                                    name={editMode ? 'save-outline' : 'pencil'}
                                    size={24}
                                    color="#333"
                                />
                            </TouchableOpacity>
                            {editMode && (
                                <TouchableOpacity
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: 'white',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 2,
                                        elevation: 3,
                                    }}
                                    onPress={handleRevertEdit}
                                >
                                    <Ionicons
                                        name="refresh"
                                        size={24}
                                        color="#333"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
                <View style={styles.content}>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: themeData.textColor }]}>{artist.Artist}</Text>
                        <TouchableOpacity onPress={handleToggleFavorite} style={styles.heartContainer}>
                            <Ionicons
                                name={heartIcon}
                                size={35}
                                color={heartColor}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Editable Info Fields */}
                    {editMode ? (
                        <>
                            {/* Day Dropdown */}
                            <View style={styles.infoContainer}>
                                <Ionicons name="calendar" size={20} color="darkgrey" />
                                <View style={{ flex: 1, marginLeft: 10, zIndex: openDay ? 2000 : 1 }}>
                                    <DropDownPicker
                                        open={openDay}
                                        value={dayValue}
                                        items={dayItems}
                                        setOpen={setOpenDay}
                                        setValue={val => {
                                            setDayValue(val);
                                            setEditDay(val);
                                        }}
                                        setItems={setDayItems}
                                        containerStyle={{ height: 44 }}
                                        style={{
                                            backgroundColor: themeData.backgroundColor,
                                            borderColor: '#ccc',
                                            minHeight: 44,
                                        }}
                                        textStyle={{ color: themeData.textColor }}
                                        dropDownContainerStyle={{
                                            backgroundColor: themeData.backgroundColor,
                                            borderColor: '#ccc',
                                            zIndex: 2000,
                                        }}
                                        listMode="SCROLLVIEW"
                                        placeholder="Select Day"
                                        ArrowDownIconComponent={({ style }) => (
                                            <Ionicons name="chevron-down" size={20} color={themeData.textColor} style={style} />
                                        )}
                                        TickIconComponent={({ style }) => (
                                            <Ionicons name="checkmark" size={20} color={themeData.textColor} style={style} />
                                        )}
                                        iconContainerStyle={{ backgroundColor: 'transparent' }}
                                        arrowIconContainerStyle={{ backgroundColor: 'transparent' }}
                                    />
                                </View>
                            </View>
                            {/* Stage Dropdown */}
                            <View style={styles.infoContainer}>
                                <Ionicons name="location" size={20} color="darkgrey" />
                                <View style={{ flex: 1, marginLeft: 10, zIndex: openStage ? 1500 : 1 }}>
                                    <DropDownPicker
                                        open={openStage}
                                        value={stageValue}
                                        items={stageItems}
                                        setOpen={setOpenStage}
                                        setValue={val => {
                                            setStageValue(val);
                                            setEditStage(val);
                                        }}
                                        setItems={setStageItems}
                                        containerStyle={{ height: 44 }}
                                        style={{
                                            backgroundColor: themeData.backgroundColor,
                                            borderColor: '#ccc',
                                            minHeight: 44,
                                        }}
                                        textStyle={{ color: themeData.textColor }}
                                        dropDownContainerStyle={{
                                            backgroundColor: themeData.backgroundColor,
                                            borderColor: '#ccc',
                                            zIndex: 1500,
                                        }}
                                        listMode="SCROLLVIEW"
                                        placeholder="Select Stage"
                                        ArrowDownIconComponent={({ style }) => (
                                            <Ionicons name="chevron-down" size={20} color={themeData.textColor} style={style} />
                                        )}
                                        TickIconComponent={({ style }) => (
                                            <Ionicons name="checkmark" size={20} color={themeData.textColor} style={style} />
                                        )}
                                        // Optionally, for more control:
                                        iconContainerStyle={{ backgroundColor: 'transparent' }}
                                        arrowIconContainerStyle={{ backgroundColor: 'transparent' }}
                                    />
                                </View>
                            </View>
                            {/* Start/End Time */}
                            <View style={styles.infoContainer}>
                                <Ionicons name="time" size={20} color="darkgrey" />
                                <TextInput
                                    value={editStart}
                                    onChangeText={setEditStart}
                                    placeholder="Start Time"
                                    placeholderTextColor="#aaa"
                                    style={[styles.infoText, { color: themeData.textColor, borderBottomWidth: 1, borderColor: '#ccc', flex: 1, marginLeft: 10 }]}
                                />
                                <Text style={{ color: themeData.textColor, marginHorizontal: 5 }}>-</Text>
                                <TextInput
                                    value={editEnd}
                                    onChangeText={setEditEnd}
                                    placeholder="End Time"
                                    placeholderTextColor="#aaa"
                                    style={[styles.infoText, { color: themeData.textColor, borderBottomWidth: 1, borderColor: '#ccc', flex: 1 }]}
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            {/* Normal Info Display */}
                            <View style={styles.infoContainer}>
                                <Ionicons name="calendar" size={20} color="darkgrey" />
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('FestivalSchedule', {
                                        day: artist.Scheduled,
                                        artistId: artist["AOTD #"],
                                        startTime: artist.StartTime
                                    })}
                                >
                                    <Text style={[styles.infoText, { color: themeData.textColor, textDecorationLine: 'underline' }]}>
                                        {editDay}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.infoContainer}>
                                <Ionicons name="time" size={20} color="darkgrey" />
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('FestivalSchedule', {
                                        day: artist.Scheduled,
                                        artistId: artist["AOTD #"],
                                        startTime: artist.StartTime
                                    })}
                                >
                                    <Text style={[styles.infoText, { color: themeData.textColor, textDecorationLine: 'underline' }]}>
                                        {editStart} - {editEnd}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.infoContainer}>
                                <Ionicons name="location" size={20} color="darkgrey" />
                                <Text style={[styles.infoText, { color: themeData.textColor }]}>{editStage}</Text>
                            </View>
                        </>
                    )}

                    {/* Genres */}
                    <View style={styles.infoContainer}>
                        <Ionicons name="disc-outline" size={20} color="darkgrey" />
                        <Text style={[styles.infoText, { color: themeData.textColor }]}>{artist.Genres}</Text>
                    </View>

                    {/* Description */}
                    <View style={styles.description}>
                        {descriptionSegments.map((segment, index) => (
                            <Text key={index} style={[styles.descriptionText, { color: themeData.textColor }]}>
                                {segment}
                                {index < descriptionSegments.length - 1 ? '\n\n' : ''}
                            </Text>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageHeader: {
        width: '100%',
        height: 400,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
        flexWrap: 'wrap',
    },
    heartContainer: {
        marginLeft: 10,
        padding: 5,
        backgroundColor: 'transparent',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        marginLeft: 10,
    },
    description: {
        marginTop: 10,
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 16,
    },
});

export default ArtistBioContent;