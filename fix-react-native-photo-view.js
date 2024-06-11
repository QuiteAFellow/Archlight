const fs = require('fs');
const path = require('path');

const gradleFilePath = path.resolve(__dirname, 'node_modules/react-native-photo-view/android/build.gradle');

fs.readFile(gradleFilePath, 'utf8', (err, data) => {
    if (err) {
        return console.log(err);
    }
    const result = data.replace(/compile /g, 'implementation ');

    fs.writeFile(gradleFilePath, result, 'utf8', (err) => {
        if (err) return console.log(err);
    });
});