import * as fs from 'fs';
import * as sqlite3 from 'sqlite3';
import csvParser from 'csv-parser'; // Import the default export

// Create a SQLite database instance
const dbFilePath = './assets/csv/Artist Bios, Timesheet, Image Paths, Favorites.db';
const db = new sqlite3.Database(dbFilePath);

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
db.run(createTableQuery, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Table created successfully');
        // Read the CSV file and insert data into the table
        const csvFilePath = 'assets/csv/Artist Bios, Timesheet, Image Paths, Favorites.csv';
        fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on('data', (data: any) => { // Explicitly define the type of 'data' parameter
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
            });
    }
});
