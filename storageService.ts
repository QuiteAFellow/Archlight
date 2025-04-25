// storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save data to AsyncStorage
 * @param key - The key where the value will be stored
 * @param value - The value to store (any data type)
 */
export const saveToStorage = async (key: string, value: any): Promise<void> => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        console.log(`Successfully saved to ${key}`);
    } catch (error) {
        console.error(`Error saving data to ${key}:`, error);
    }
};

/**
 * Load data from AsyncStorage
 * @param key - The key of the value to retrieve
 * @returns The retrieved value, or null if not found
 */
export const loadFromStorage = async (key: string): Promise<any> => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`Error loading data from ${key}:`, error);
        return null;
    }
};
