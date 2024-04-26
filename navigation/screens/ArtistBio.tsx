import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

const ArtistBio: React.FC<{ route: any }> = ({ route }) => {
    const { artistId } = route.params;
    const [artist, setArtist] = useState<any>(null);

    useEffect(() => {
        // Open the SQLite database
        SQLite.openDatabase({ name: 'ArtistDatabase.db', location: 'default' })
            .then((db: SQLiteDatabase) => {
                // Define the query to retrieve artist data
                const query = `SELECT * FROM ArtistDatabase WHERE id = ?`;

                // Execute the query with the artistId parameter
                db.transaction(tx => {
                    tx.executeSql(
                        query,
                        [artistId],
                        (_, { rows }) => {
                            // Extract the first row (assuming artistId is unique) and set it as the artist state
                            const artistData = rows.item(0);
                            setArtist(artistData);
                        },
                        (_, error) => {
                            console.error('Error fetching artist data:', error);
                        }
                    );
                });
            })
            .catch(error => {
                console.error('Error opening database:', error);
            });
    }, [artistId]);

    if (!artist) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Image source={{ uri: artist.image }} style={styles.image} />
            <Text style={styles.name}>{artist.name}</Text>
            <Text style={styles.Day}>{artist.Day}</Text>
            <Text style={styles.SetTime}>{artist.SetTime}</Text>
            <Text style={styles.Stage}>{artist.Stage}</Text>
            <Text style={styles.bio}>{artist.bio}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    bio: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    Day: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    SetTime: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    Stage: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default ArtistBio;
