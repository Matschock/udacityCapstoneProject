// <<< Start Function --------------------------------------------------------
// Callback function handleNewLocationSubmit
function handleNewLocationSubmit(event){    
    // Get all keys / usernames needed for API authentification from Server
    getKeys('http://localhost:3000/keys')
        // get meaningClound Sentiment Analysis
        .then(function(keys){

            // Input checker missing. (mark date input field red when not fitting)
            // Start Date must be later than todaz
            // End Date must be later than start date?
            
            // weatherbit URL
            const api_key_weatherbit = keys.weatherbit_key;
    
            // geonames URL
            const urlGeonames = 'http://api.geonames.org/searchJSON?q=';
            const usernameGeonames = '&username='+ keys.geonames_username;

            //Declare date variables
            let startdate = new Date();
            let enddate = new Date();

            // get entered location
            const location = document.getElementById('loc').value;
            // read out start & end date from user input
            startdate = document.getElementById('startdate').value;
            enddate = document.getElementById('enddate').value;
            // get data from Geonames API
            getGeonamesData(urlGeonames+location+'&maxRows=1'+usernameGeonames)
            .then(function(locData){
                console.log(`Location Data: ${locData}`)
                let travelData = {
                    city: locData.city, 
                    country: locData.country, 
                    lat: locData.lat, 
                    lng: locData.lng, 
                    startdate: startdate, 
                    enddate: enddate
                }
                console.log(`Travel Data: ${travelData}`)
                console.log(travelData)
                // Add data to Source POST requrest
                postStuff('/addToSource',travelData);
                // Calculate number of days until journey starts
                let today = new Date();
                // days until departure
                const dayCountdown = deltaDays(today, startdate);
                // duration of journey
                const jouneyDuration = deltaDays(startdate, enddate)
                // get weather data from weatherbit
                console.log(`Days until departure: ${dayCountdown}`)
                console.log(`Duration of journey in days: ${jouneyDuration}`)
                getWeatherData(api_key_weatherbit,travelData,dayCountdown,jouneyDuration)
                //getForecastWeatherData(api_key_weatherbit,travelData)
                .then(function(fullWeatherData){
                    // Update website!
                    updateWebsite(dayCountdown,fullWeatherData);
                })
            })
    })
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// get API keys from Server
const getKeys = async (serveraddress) => {
    const res = await fetch(serveraddress);
    try{
        const keys = await res.json()
        return keys;
    } catch(error){
        console.log("error", error);
    }
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Function to ask for data from OpenWeatherMap
const getGeonamesData = async (url) => {
    const res = await fetch(url);
    try{
        const data = await res.json();
        // extrace relevant data from API response
        let locData = {
            city: data.geonames[0].name,
            country: data.geonames[0].countryName,
            lat: data.geonames[0].lat,
            lng: data.geonames[0].lng
        }
        // print to console
        console.log('This is the ${data}')
        console.log(data)
        console.log(data.geonames[0].name)
        console.log('This is the ${locData}')
        console.log(locData)
        return locData;
    } catch(error){
        console.log("error", error);
    }
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Post stuff to server
const postStuff = async (url = '', data = {}) => {
    const res = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" of headers
    });
    try {
        const newStuff = await res.json();
        return newStuff;
    } catch(error) {
        console.log("error", error);
    }
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Get weather data from weatherbit API
const getWeatherData = async (api_key_weatherbit, travelData,dayCountdown,jouneyDuration) => {
    // use the best method to get weather data for journey dates
    let fullWeatherData = [];
    if ((dayCountdown+jouneyDuration) <= 16){
        // use forecast method
        getForecastWeatherData(api_key_weatherbit,travelData)
        .then(function(weatherData){
            fullWeatherData.push(weatherData);
            return fullWeatherData;
        })
    } else if ((dayCountdown <= 16) && ((dayCountdown+jouneyDuration) <= 16)){
        // mix forecast and historical
        getForecastWeatherData(api_key_weatherbit,travelData)
        .then(function(weatherData){
            fullWeatherData.push(weatherData);
            getEstimationWeatherData(api_key_weatherbit,travelData)
            .then(function(weatherData){
                fullWeatherData.push(weatherData);
                return fullweatherData;
            })
        })
    } else if (dayCountdown > 16){
        // use historical data estimation method
        getEstimatedWeatherData(api_key_weatherbit,travelData)
        .then(function(weatherData){
            fullWeatherData.push(weatherData);
            return fullWeatherData;
        })
    }
    return fullWeatherData;
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Get weather data from weatherbit API
const getForecastWeatherData = async (api_key_weatherbit, travelData) => {
    // generate weatherbit url components
    const urlFoundation = 'https://api.weatherbit.io/v2.0/forecast/daily?';
    const location_coordinates = '&lat=' + travelData.lat + '&lon=-' + travelData.lng;
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
        let weatherData = extraceWeatherData(data, travelData)
        return weatherData;
    } catch(error){
        console.log("error", error);
    }
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Get weather data from weatherbit API
const getEstimatedWeatherData = async (api_key_weatherbit, travelData) => {
    // generate weatherbit url components
    const urlFoundation = 'https://api.weatherbit.io/v2.0/forecast/daily?';
    const location_coordinates = '&lat=' + travelData.lat + '&lon=-' + travelData.lng;
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
        let weatherData = extraceWeatherData(data, travelData)
        return weatherData;
    } catch(error){
        console.log("error", error);
    }
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Extrace Weather Data
const extraceWeatherData = (data, travelData) => {
    let weatherData = [];
    let setStartDate = false;
    for (let i = 0; i < data.data.length; i++){
        if (data.data[i].valid_date == travelData.startdate){
            setStartDate = true;
            let tmpWeatherData = relevantWeatherData(data.data[i])
            weatherData.push(tmpWeatherData);
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
    const tmpweatherdata = {
        date: data.valid_date, 
        max_temp: data.max_temp, 
        min_temp: data.min_temp,
        temp: data.temp,
        description: data.weather.description
    };
    return tmpweatherdata;
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Update website with new location
const updateWebsite = async (dayCountdown) => {
    const request = await fetch('/source');
    try{
        const allData = await request.json();
        const lastIndex = allData.length - 1;
        document.getElementById('date').innerHTML = `Days until Jounrey: ${dayCountdown}`;
        document.getElementById('temp').innerHTML = `City: ${allData[lastIndex].city} (Lat: ${allData[lastIndex].lateral} Long: ${allData[lastIndex].longitudinal} )
                                                    Country: ${allData[lastIndex].country}`;
        document.getElementById('content').innerHTML = `From: ${allData[lastIndex].startdate}   Till: ${allData[lastIndex].enddate}`;
    } catch(error) {
        console.log("error", error);
    }
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Calculate days until departure
const deltaDays = (currentDate, startDateJourney) => {
    // console.log(`StartDate - Today: ${startDateJourney.getTime() - currentDate.getTime()}`)
    const startDate = new Date(currentDate);
    const endDate = new Date(startDateJourney);
    const deltaDays = Math.ceil(Math.abs(startDate  - endDate)/(1000*60*60*24));
    return deltaDays;
}
// End Function >>> 


export { handleNewLocationSubmit }
