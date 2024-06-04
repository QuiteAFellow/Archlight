// loadAssetsAsync.tsx
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';
import artistImages from './assets/utils/artistImages';

// Function to cache images
const cacheImages = (images: any[]) => {
    return images.map(image => {
        if (typeof image === 'string') {
            return Image.prefetch(image);
        } else {
            return Asset.fromModule(image).downloadAsync();
        }
    });
};

// Function to cache fonts
const cacheFonts = (fonts: { [key: string]: any }[]) => {
    return fonts.map(font => Font.loadAsync(font));
};

// Function to cache data files
const cacheDataFiles = (files: { uri: string; name: string }[]) => {
    return files.map(file => FileSystem.downloadAsync(file.uri, FileSystem.documentDirectory + file.name));
};

// Main function to load assets asynchronously
const loadAssetsAsync = async () => {
    // Cache images
    const imageAssets = cacheImages([
        require('./assets/icon.png'),
        require('./assets/splash.png'),
        ...Object.values(artistImages), // Cache all artist images
        // Add all map images
        require('.assets/Maps/Roo24_Centeroo.jpg'),
        require('./assets/Maps/Roo24_Outeroo.jpg'),
    ]);

    // Cache fonts
    const fontAssets = cacheFonts([
        { 'open-sans': require('./assets/fonts/OpenSans-Regular.ttf') },
        { 'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf') },
    ]);

    // Cache data files
    const dataFiles = cacheDataFiles([
        { uri: FileSystem.documentDirectory + 'Artist Bios, Timesheet, Image Paths, Favorites.json', name: 'Artist Bios, Timesheet, Image Paths, Favorites.json' },
        { uri: FileSystem.documentDirectory + 'Food Vendor Info 2024.json', name: 'Food Vendor Info 2024.json' },
    ]);

    await Promise.all([...imageAssets, ...fontAssets, ...dataFiles]);
};

export default loadAssetsAsync;