/* generateReport
parameters: weatherData, variable, unit
    - weatherData: an array of objects that contains weather related data for cities
    - variable: the type of data in the weatherData
    - unit: the unit of measurement for the data in weatherData
returns: string of a rundown on the data
 */
function generateReport(weatherData, variable, unit){
    function tenHighestLowestMean() {
        const meanTemps = Object.entries(weatherData
            .reduce((accum, currObj) => {
                const entries = Object.entries(currObj);
                entries.map((tuple) => {
                    if (accum.hasOwnProperty(tuple[0]) && tuple[0] !== 'datetime') {
                        accum[tuple[0]] += Number(tuple[1]);
                    } else if (tuple[0] !== 'datetime') {
                        accum[tuple[0]] = Number(tuple[1]);
                    }
                });
                return accum;
            }, {}))
            .map((pair) => ([pair[0], (pair[1] / weatherData.length).toFixed(2)]));

        const topTenColdest = meanTemps
            .sort((a, b) => a[1] - b[1])
            .slice(0, 10);


        const topTenWarmest = meanTemps
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        return `Top 10 Cities with highest mean ${variable}\n` +
            topTenWarmest.reduce((accum, pair) => accum += `${pair[0]}: ${pair[1]} (${unit}) \n`, '') +
            `Top 10 Cities with the lowest mean ${variable}\n` +
            topTenColdest.reduce((accum, pair) => accum += `${pair[0]}: ${pair[1]} (${unit}) \n`, '');
    }
    function meanVariableOfSpring2013(cityname) {
        const springData = weatherData
            .map((obj) => {
                let parsedDate = obj['datetime'].split(' ');
                parsedDate = [...(parsedDate[0].split('-')), ...( parsedDate[1].split(':'))];
                obj['datetime'] = new Date(Number(parsedDate[0]), Number(parsedDate[1]) - 1,
                    Number(parsedDate[2]), Number(parsedDate[3]), Number(parsedDate[4]), Number(parsedDate[5]));
                return {datetime: obj['datetime'], [cityname]: obj[cityname]};
            })
            .filter((obj) => obj['datetime'].getFullYear() === 2013 &&
                (obj['datetime'].getMonth() >= 1 && obj['datetime'].getMonth() <= 3));
        const returnData = (springData.reduce( (accum, curr) => accum += Number(curr[cityname]), 0) / springData.length)
            .toFixed(2);
        return (`The average ${variable} over Spring 2013 in New York is: ${ returnData } (${unit})\n`);
    }

    console.log(tenHighestLowestMean());
    console.log(meanVariableOfSpring2013('New York'));
}

module.exports = {generateReport: generateReport};