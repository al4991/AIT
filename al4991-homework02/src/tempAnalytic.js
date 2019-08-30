
/* analyzeTemperature
parameters: array of objects, where each represents the temperature of 36 cities

return: a string version of the weather data, which contains
    - the average temperature of different cities over
        - the entire time series
        -a specific year
        - a particular season
    - the coldest and warmest dates and times
    - the top ten coldest and warmest cities in the dataset

*/
function analyzeTemperature(weatherData) {
    function firstTenNY(){
        return weatherData
            .slice(0, 10)
            .reduce((accum, curr) => accum += `At ${curr['datetime']}, the temperature in NY is ${curr['New York']} (F)
`, `The first 10 lines of Temperature in NY: \n`);
    }

    function meanTemp(cityname) {
        return `The mean temperature in ${cityname} is : ${((weatherData
            .map((obj) => obj[cityname])
            .reduce((accumulator, curr) => accumulator + Number(curr), 0)) / weatherData.length)
            .toFixed(2)} (F) \n`;
    }

    function coldestAndWarmest(cityname) {
        const sortedWeather = weatherData.map((obj) => ({datetime: obj['datetime'], [cityname]: obj[cityname]}))
        .sort((a, b) => Number(a[cityname]) - Number(b[cityname]));
        const coldest = sortedWeather.shift();
        const warmest = sortedWeather.pop();
        return `The coldest time in ${cityname} is: ${coldest['datetime']}
The lowest temperature is: ${coldest[cityname]} (F)
The warmest time in ${cityname} is ${warmest['datetime']}
The highest temperature is: ${warmest[cityname]} (F)\n`;
    }

    function tenColdestWarmestMean() {
        const meanTemps = Object.entries(weatherData
            .reduce((accum, currObj) => {
                const entries = Object.entries(currObj);
                entries.map((tuple) => {
                    if (accum.hasOwnProperty(tuple[0]) && tuple[0] !== 'datetime') {
                        accum[tuple[0]] += Number(tuple[1]);
                    } else if (tuple[0] !== 'datetime') {
                        accum[tuple[0]] = Number(tuple[1]);
                    }});
                return accum;
                }, {}))
            .map((pair) => ([pair[0], (pair[1] / weatherData.length).toFixed(2)]));

        const topTenColdest = meanTemps
            .sort((a, b) => a[1] - b[1])
            .slice(0, 10);


        const topTenWarmest = meanTemps
            .sort((a, b) => b[1] -a[1])
            .slice(0, 10);

        return `Top 10 Cities with highest mean temperature \n` +
            topTenWarmest.reduce((accum, pair) => accum += `${pair[0]}: ${pair[1]} (F) \n`, '') +
            'Top 10 Cities with the lowest mean temperature\n' +
            topTenColdest.reduce((accum, pair) => accum += `${pair[0]}: ${pair[1]} (F) \n`, '');
    }

    function meanTempOfSpring2013(cityname) {
        const springData = weatherData
            .map((obj) => {
                let parsedDate = obj['datetime'].split(' ');
                parsedDate = [...(parsedDate[0].split('-')), ...( parsedDate[1].split(':'))];
                obj['datetime'] = new Date(Number(parsedDate[0]), Number(parsedDate[1]) - 1,
                    Number(parsedDate[2]), Number(parsedDate[3]), Number(parsedDate[4]), Number(parsedDate[5]));
                return {datetime: obj['datetime'], [cityname]: obj[cityname]};
            })
            .filter((obj) => obj['datetime'].getFullYear() === 2013 &&
                (obj['datetime'].getMonth() >= 1 &&
                obj['datetime'].getMonth() <= 3));
        const returnData = (springData.reduce( (accum, curr) => accum += Number(curr[cityname]), 0) / springData.length)
            .toFixed(2);
        return (`The average temperature over Spring 2013 in New York is: ${ returnData } (F)`);

    }

    return firstTenNY() + '\n' + meanTemp('San Diego') + '\n' + coldestAndWarmest('New York') +'\n' +
        tenColdestWarmestMean() + '\n' + meanTempOfSpring2013('New York');
}

module.exports = { analyzeTemperature: analyzeTemperature};
