const request = require('request');
const analytic = require('./analytic.js');

/* makeReports
parameters: url
    - url should be a string that points to a json object, which contains a property response with an array of objects,
     a property that points to a next page that also contains a json, and two properties to describe the type of data in
     the response.
return: nothing, but should print out a rundown of the data.
 */
function makeReports(url) {
    function kelvinToFaren(temp) {
        return (temp * 1.8) - 459.67;
    }
    request(url, function(error, response, body){
        if (error) { throw error;}

        const parsedData = JSON.parse(body);
        let weatherData = parsedData.response;
        if (parsedData['variable'] === 'temperature' && parsedData['unit'] === 'K'){
            weatherData = weatherData.map((obj) => {
                const entries = Object.entries(obj);
                return entries.reduce((returnObject, current) => {
                    returnObject[current[0]] = (typeof current[1] === 'number')
                        ? kelvinToFaren(current[1]).toFixed(2) : current[1];
                    return returnObject;
                }, {});
            });
            analytic.generateReport(weatherData, parsedData['variable'], 'F');
        } else { analytic.generateReport(weatherData, parsedData['variable'], parsedData['unit']); }

        if (parsedData.next !== undefined) {
            makeReports(`http://jvers.com/csci-ua.0480-spring2019-008/homework/02/${parsedData.next}.json`);
        }
    });

}

makeReports('http://jvers.com/csci-ua.0480-spring2019-008/homework/02/temperature-resource.json');