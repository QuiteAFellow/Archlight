import * as fs from 'fs';
import * as path from 'path'; // Import path module to handle file paths
import * as sqlite3 from 'sqlite3';
import csvParser from 'csv-parser';

// Define types for CSV data
interface ArtistData {
    Artist: string;
    Description: string;
    Genres: string;
    Day: string;
    Stage: string;
    'Start Time': string;
    'End Time': string;
    'Relative Image Path': string;
    Favorite: boolean;
}

// Ensure the directory for the database file exists
const dbDirectory = './assets/db';
if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}

console.log('dbDirectory:', dbDirectory);

// Create a SQLite database instance
const dbFilePath = path.join(dbDirectory, 'ArtistDatabase.db'); // Use path.join to ensure correct file path
const db = new sqlite3.Database(dbFilePath);

console.log('dbFilePath:', dbFilePath);

// Define the table schema
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ArtistDatabase (
        id INTEGER PRIMARY KEY,
        Artist TEXT,
        Description TEXT,
        Genres TEXT,
        Day TEXT,
        Stage TEXT,
        StartTime TEXT,
        EndTime TEXT,
        RelativeImagePath TEXT,
        Favorite BOOLEAN
    );
`;

// Run the query to create the table
db.run(createTableQuery, function(err) {
    if (err) {
        console.error('Error creating table:', err.message);
        return;
    }
    console.log('Table created successfully');
    // Read the CSV file and insert data into the table
    const csvFilePath = './assets/csv/Artist Bios, Timesheet, Image Paths, Favorites.csv';
    fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (data: ArtistData) => {
            const insertQuery = `
                INSERT INTO ArtistDatabase (Artist, Description, Genres, Day, Stage, StartTime, EndTime, RelativeImagePath, Favorite)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.run(insertQuery, [data.Artist, data.Description, data.Genres, data.Day, data.Stage, data['Start Time'], data['End Time'], data['Relative Image Path'], data.Favorite], (err) => {
                if (err) {
                    console.error('Error inserting data:', err.message);
                }
            });
        })
        .on('end', () => {
            console.log('Data imported successfully');
        })
        .on('error', (err: Error) => {
            console.error('Error reading CSV file:', err.message);
        });
});