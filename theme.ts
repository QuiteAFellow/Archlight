// Define the types for the available themes and stage names
export type ThemeType = 'Light' | 'Bonnaroo' | 'OLED';

// Define the stage names (for the stage colors)
export type StageName =
    | 'What Stage'
    | 'Which Stage'
    | 'The Other'
    | 'Infinity Stage'
    | 'This Tent'
    | 'That Tent';

// Define the theme object, each theme has different color options
export const themes: Record<ThemeType, {
    name: ThemeType;
    stageColors: Record<StageName, string>;
    FavoritedstageColors: Record<StageName, string>;
    stageTextColors: Record<StageName, string>;
    FavoritedstageTextColors: Record<StageName, string>;
    buttonColors: Record<string, string>;
    highlightColor: string;
    highlightTextColor: string;
    unselectedborder: string;
    backgroundColor: string;
    textColor: string;
    subtextColor: string;
    NowBar: string;
    buttonText: string;
    statusBarColor: string;
    scrollbarColor: string;
    }> = {
    Light: {
        name: 'Light',
        // Light Theme color scheme
        FavoritedstageColors: {
        'What Stage': '#84d443', // Green
        'Which Stage': '#fdb92d', // Yellow
        'The Other': '#f46c27',  // Orange
        'Infinity Stage': '#ff84ab', // Pink
        'This Tent': '#a77aff', // Purple
        'That Tent': '#80c8c7', // Cyan
        },
        stageColors: {
        'What Stage': '#a9a9a9', // Dark Green
        'Which Stage': '#a9a9a9', // Dark Yellow
        'The Other': '#a9a9a9',  // Dark Orange
        'Infinity Stage': '#a9a9a9', // Dark Pink
        'This Tent': '#a9a9a9', // Dark Purple
        'That Tent': '#a9a9a9', // Dark Cyan
        },
        FavoritedstageTextColors: {
        'What Stage': '#000000', // Black
        'Which Stage': '#000000', // Black
        'The Other': '#ffffff',  // White
        'Infinity Stage': '#ffffff', // White
        'This Tent': '#ffffff', // White
        'That Tent': '#000000', // Black
        },
        stageTextColors: {
        'What Stage': '#000000', // Black
        'Which Stage': '#000000', // Black
        'The Other': '#000000',  // White
        'Infinity Stage': '#000000', // White
        'This Tent': '#000000', // White
        'That Tent': '#000000', // Black
        },
        buttonColors: {
        calendar: '#84d443', // Green
        lineup: '#fdb92d', // Yellow
        map: '#f46c27',  // Orange
        settings: '#ff84ab', // Pink
        },
        highlightColor: '#007bff', // Blue highlight color
        highlightTextColor: '#ffffff', //white text for highlight color
        unselectedborder: '#000000',
        backgroundColor: '#ffffff', // White background
        textColor: '#000000', // Black text
        subtextColor: 'grey',
        NowBar: 'red',
        buttonText: '#ffffff',
        statusBarColor: '#ffffff',
        scrollbarColor: '#999999'
    },
    Bonnaroo: {
        name: 'Bonnaroo',
        // Bonnaroo Theme color scheme
        FavoritedstageColors: {
        'What Stage': '#84d443', // Green
        'Which Stage': '#fdb92d', // Yellow
        'The Other': '#f46c27',  // Orange
        'Infinity Stage': '#ff84ab', // Pink
        'This Tent': '#a77aff', // Purple
        'That Tent': '#80c8c7', // Cyan
        },
        stageColors: {
        'What Stage': '#575757', // Dark Green
        'Which Stage': '#575757', // Dark Yellow
        'The Other': '#575757',  // Dark Orange
        'Infinity Stage': '#575757', // Dark Pink
        'This Tent': '#575757', // Dark Purple
        'That Tent': '#575757', // Dark Cyan
        },
        FavoritedstageTextColors: {
        'What Stage': '#000000', // Black
        'Which Stage': '#000000', // Black
        'The Other': '#ffffff',  // White
        'Infinity Stage': '#ffffff', // White
        'This Tent': '#ffffff', // White
        'That Tent': '#000000', // Black
        },
        stageTextColors: {
        'What Stage': '#ffffff', // Black
        'Which Stage': '#ffffff', // Black
        'The Other': '#ffffff',  // White
        'Infinity Stage': '#ffffff', // White
        'This Tent': '#ffffff', // White
        'That Tent': '#ffffff', // Black
        },
        buttonColors: {
        calendar: '#84d443', // Green
        lineup: '#fdb92d', // Yellow
        map: '#f46c27',  // Orange
        settings: '#ff84ab', // Pink
        },
        highlightColor: '#79c031', // Green highlight color
        highlightTextColor: '#ffffff', //white text for highlight color
        unselectedborder: 'grey',
        backgroundColor: '#333333', // Dark grey background
        textColor: '#ffffff', // White text
        subtextColor: 'grey',
        NowBar: '#000000',
        buttonText: '#ffffff',
        statusBarColor: '#333333',
        scrollbarColor: '#77FF77'
    },
    OLED: {
        name: 'OLED',
        // OLED Theme color scheme
        FavoritedstageColors: {
        'What Stage': '#84d443', // Green
        'Which Stage': '#fdb92d', // Yellow
        'The Other': '#f46c27',  // Orange
        'Infinity Stage': '#ff84ab', // Pink
        'This Tent': '#a77aff', // Purple
        'That Tent': '#80c8c7', // Cyan
        },
        stageColors: {
        'What Stage': '#373737', // Dark Green
        'Which Stage': '#373737', // Dark Yellow
        'The Other': '#373737',  // Dark Orange
        'Infinity Stage': '#373737', // Dark Pink
        'This Tent': '#373737', // Dark Purple
        'That Tent': '#373737', // Dark Cyan
        },
        FavoritedstageTextColors: {
        'What Stage': '#000000', // Black
        'Which Stage': '#000000', // Black
        'The Other': '#ffffff',  // White
        'Infinity Stage': '#ffffff', // White
        'This Tent': '#ffffff', // White
        'That Tent': '#000000', // Black
        },
        stageTextColors: {
        'What Stage': '#ffffff', // Black
        'Which Stage': '#ffffff', // Black
        'The Other': '#ffffff',  // White
        'Infinity Stage': '#ffffff', // White
        'This Tent': '#ffffff', // White
        'That Tent': '#ffffff', // Black
        },
        buttonColors: {
        calendar: '#84d443', // Green
        lineup: '#fdb92d', // Yellow
        map: '#f46c27',  // Orange
        settings: '#ff84ab', // Pink
        },
        highlightColor: '#79c031', // Green highlight color
        highlightTextColor: '#ffffff', //white text for highlight color
        unselectedborder: '#ffffff',
        backgroundColor: '#000000', // Black background
        textColor: '#ffffff', // White text
        subtextColor: 'grey',
        NowBar: '#000000',
        buttonText: '#ffffff',
        statusBarColor: '#000000',
        scrollbarColor: 'grey'
    },
};
