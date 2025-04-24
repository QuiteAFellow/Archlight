import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, ThemeType } from '../../theme';

interface ThemeContextProps {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    themeData: {
        backgroundColor: string;
        textColor: string;
        subtextColor: string;
        highlightColor: string;
        highlightTextColor: string;
        unselectedborder: string;
        stageColors: Record<string, string>;
        stageTextColors: Record<string, string>;
        FavoritedstageColors: Record<string, string>;
        FavoritedstageTextColors: Record<string, string>;
        buttonColors: Record<string, string>;
        NowBar: string;
    };
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeType>('Light');

    // Load the theme from AsyncStorage when the app starts
    useEffect(() => {
        const loadTheme = async () => {
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme as ThemeType);
        }
        };
        loadTheme();
    }, []);

    // Save the theme whenever it changes
    useEffect(() => {
        AsyncStorage.setItem('theme', theme);
    }, [theme]);

    // Extract the data for the current theme
    const themeData = themes[theme];

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themeData }}>
        {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
        if (!context) {
            throw new Error('useTheme must be used within a ThemeProvider');
        }
    return context;
};
