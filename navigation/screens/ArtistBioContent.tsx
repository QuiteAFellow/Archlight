import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Artist } from '../types';
import artistImages from '../../assets/utils/artistImages';
import { useFavorites } from '../../context/FavoritesContext';

type Props = {
    artist: Artist;
};

const ArtistBioContent: React.FC<Props> = ({ artist }) => {
    const { favorites, toggleFavorite } = useFavorites();
    const isFavorited = favorites[artist["AOTD #"]] || false;

    const descriptionSegments = artist.Description.split('[PAGE_BREAK]');

    return (
        <View style={styles.container}>
        <Image source={artistImages[artist.Artist]} style={styles.imageHeader} resizeMode="cover" />
        <View style={styles.content}>
        <View style={styles.titleContainer}>
        <Text style={styles.title}>{artist.Artist}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(artist)}>
            <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={35} color={isFavorited ? 'red' : 'black'} />
        </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
            <Ionicons name="calendar" size={20} color="darkgrey" />
            <Text style={styles.infoText}>{artist.Scheduled}</Text>
        </View>
        <View style={styles.infoContainer}>
            <Ionicons name="time" size={20} color="darkgrey" />
            <Text style={styles.infoText}>{artist.StartTime} - {artist.EndTime}</Text>
        </View>
        <View style={styles.infoContainer}>
            <Ionicons name="location" size={20} color="darkgrey" />
            <Text style={styles.infoText}>{artist.Stage}</Text>
        </View>
        <View style={styles.infoContainer}>
            <Ionicons name="disc-outline" size={20} color="darkgrey" />
            <Text style={styles.infoText}>{artist.Genres}</Text>
        </View>
        <Text style={styles.description}>
            {descriptionSegments.join('\n\n')}
        </Text>
        </View>
    </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    imageHeader: {
        width: '100%',
        height: 400
    },
    content: {
        padding: 20
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        flex: 1,
        flexWrap: 'wrap',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    infoText: {
        fontSize: 16,
        color: 'black',
        marginLeft: 10
    },
    description: {
        fontSize: 16,
        color: 'black',
        marginTop: 10,
        marginBottom: 10
    },
});

export default ArtistBioContent;
