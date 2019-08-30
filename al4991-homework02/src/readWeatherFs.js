const fs = require('fs');
const tempAnalytic = require('./tempAnalytic.js');

function kelvinToFaren(temp) {
    return (temp * 1.8) - 459.67;
}

fs.readFile('./historical-hourly-weather-data-json/temperature.json', 'utf8', function(err, data) {
        if (err) {throw err;}
        const parsedData = JSON.parse(data);
        const fixedData = parsedData.map((obj) => {
            const entries = Object.entries(obj);
            return entries.reduce((returnObject, current) => {
                returnObject[current[0]] = (typeof current[1] === 'number')
                    ? kelvinToFaren(current[1]).toFixed(2) : current[1];
                return returnObject;
            }, {});
        });
        console.log(tempAnalytic.analyzeTemperature(fixedData));
    }
);