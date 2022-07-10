// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< WEATHER >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// <<< Start Function --------------------------------------------------------
// Get weather data from weatherbit API
const getWeatherData = async (api_key_weatherbit, travelData,dayCountdown,jouneyDuration) => {
    // use the best method to get weather data for journey dates
    let weatherData = [];
    if (((dayCountdown) <= 1) && ((dayCountdown+jouneyDuration) <= 16)){
        // display current weather for the current day
        await getCurrentWeatherData(api_key_weatherbit,travelData, weatherData)
        .then(async function(weatherData){
            console.log('getWeather: Weather Data Current - Loop 1')
            await getForecastWeatherData(api_key_weatherbit,travelData, weatherData, true)
            .then(function(weatherData){
                return weatherData;
            })
        })
    } else if (((dayCountdown) > 1) && ((dayCountdown+jouneyDuration) <= 16)){
        // use forecast method
        console.log('getWeather: Weather Data Current - Loop 2')
        await getForecastWeatherData(api_key_weatherbit,travelData, weatherData, false)
        .then(function(weatherData){
            return weatherData;
        })
    } else if ((dayCountdown <= 1) && ((dayCountdown+jouneyDuration) >= 16)){
        // display current weather for the current day & forecast & more than forecast (for vacation longer than 16 days)
        await getCurrentWeatherData(api_key_weatherbit,travelData, weatherData)
        .then(async function(weatherData){
            console.log('getWeather: Weather Data Current - Loop 3')
            await getForecastWeatherData(api_key_weatherbit,travelData, weatherData, true)
            .then(function(weatherData){
                const nDays = dayCountdown+jouneyDuration-16;
                setUnknownWeatherData(nDays, weatherData, travelData.startdate,false)
                .then(function(weatherData){
                    return weatherData;
                })
            })
        })
    } else if ((dayCountdown <= 16) && ((dayCountdown+jouneyDuration) >= 16)){
        console.log('getWeather: Weather Data Current - Loop 4')
        // mix forecast and historical
        await getForecastWeatherData(api_key_weatherbit,travelData, weatherData, false)
        .then(function(weatherData){
            const nDays = dayCountdown+jouneyDuration-16;
            setUnknownWeatherData(nDays, weatherData, travelData.startdate,false)
            .then(function(weatherData){
                return weatherData;
            })
        })
    } else if (dayCountdown > 16){
        console.log('getWeather: Weather Data Current - Loop 5')
        // use historical data estimation method
        const nDays = jouneyDuration;
        setUnknownWeatherData(nDays, weatherData, travelData.startdate, true)
        .then(function(weatherData){
            return weatherData;
        })
    }
    return weatherData;
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Get weather data from weatherbit API
const getCurrentWeatherData = async (api_key_weatherbit, travelData, weatherData) => {
    // generate weatherbit url components
    const urlFoundation = 'https://api.weatherbit.io/v2.0/current?';
    const location_coordinates = '&lat=' + travelData.lat + '&lon=' + travelData.lng;
    const API_key = '&key=' + api_key_weatherbit
    // set together url
    const url = urlFoundation+location_coordinates+API_key
    const res = await fetch(url);
    try{
        const data = await res.json();
        console.log('app.js: Current Weather Data from getCurrentWeatherData:')
        console.log(data)
        console.log(`Current Temp in Item [0]: ${data.data[0].temp}`)
        // extract relevant data from API response
        const tmpWeatherData = {
            date: travelData.startdate, 
            max_temp: data.data[0].temp, 
            min_temp: data.data[0].temp,
            temp: data.data[0].temp,
            description: data.data[0].weather.description
        };
        weatherData.push(tmpWeatherData);
        return weatherData;
    } catch(error){
        console.log("error", error);
    }
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Get weather data from weatherbit API
const getForecastWeatherData = async (api_key_weatherbit, travelData, weatherData, skipCurrent) => {
    // generate weatherbit url components
    const urlFoundation = 'https://api.weatherbit.io/v2.0/forecast/daily?';
    const location_coordinates = '&lat=' + travelData.lat + '&lon=' + travelData.lng;
    const forecastdays = '&days=16';
    const API_key = '&key=' + api_key_weatherbit
    // set together url
    const url = urlFoundation+location_coordinates+forecastdays+API_key
    const res = await fetch(url);
    try{
        const data = await res.json();
        console.log('app.js: Weather Forecast:')
        console.log(data)
        console.log(`MaxTemp in Item [0]: ${data.data[0].app_max_temp}`)
        // extract relevant data from API response
        weatherData = extraceWeatherData(data, travelData, weatherData, skipCurrent)
        return weatherData;
    } catch(error){
        console.log("error", error);
    }
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Get weather data from weatherbit API
const setUnknownWeatherData = async (nDays, weatherData, startdate, useStartDate) => {
    // get date         
    for (let i = 0; i <= nDays; i++) {
        let date = new Date();
        let dateformatted = '';
        if (!useStartDate){
            date.setDate(date.getDate() + 16 + i);
        } else {
            date = new Date(startdate);
            date.setDate(date.getDate() + i);
        }
        if ((date.getMonth()+1) < 10){
            if (date.getDate() < 10){
                dateformatted = date.getFullYear()+'-0'+(date.getMonth()+1)+'-0'+(date.getDate());
            } else {
                dateformatted = date.getFullYear()+'-0'+(date.getMonth()+1)+'-'+(date.getDate());
            }
        } else {
            if (date.getDate() < 10){
                dateformatted = date.getFullYear()+'-'+(date.getMonth()+1)+'-0'+(date.getDate());
            } else {
                dateformatted = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+(date.getDate());
            }
        }
        const tmpWeatherData = {
            date: dateformatted, 
            max_temp: 'unknown', 
            min_temp: 'unknown',
            temp: 'unknown',
            description: 'no weather data available'
        };
        weatherData.push(tmpWeatherData);
    }
    console.log('app.js: Weather Unknown Data:')
    console.log(weatherData)
    return weatherData;
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Extrace Weather Data
const extraceWeatherData = (data, travelData, weatherData, skipCurrent) => {
    let setStartDate = false;
    for (let i = 0; i < data.data.length; i++){
        if (data.data[i].valid_date == travelData.startdate){
            setStartDate = true;
            if (!skipCurrent){
                let tmpWeatherData = relevantWeatherData(data.data[i])
                weatherData.push(tmpWeatherData);
            }
        } else if (setStartDate == true) {
            let tmpWeatherData = relevantWeatherData(data.data[i])
            weatherData.push(tmpWeatherData);
        }
        if (data.data[i].valid_date == travelData.enddate){
            setStartDate = false;
            // break loop
        }
    }
    console.log(weatherData)
    return weatherData;
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// extract relevant data from weatherdata data.data
const relevantWeatherData = (data) => {
    const tmpWeatherdata = {
        date: data.valid_date, 
        max_temp: data.max_temp, 
        min_temp: data.min_temp,
        temp: data.temp,
        description: data.weather.description
    };
    return tmpWeatherdata;
}
// End Function >>> 

export { getWeatherData }