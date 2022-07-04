// <<< Start Function --------------------------------------------------------
// Callback function handleNewLocationSubmit
function handleNewLocationSubmit(event){    
    // Get all keys / usernames needed for API authentification from Server
    getKeys('http://localhost:3000/keys')
    .then(function(keys){
        // Input checker missing. (mark date input field red when not fitting)
        // Start Date must be later than today
        // End Date must be later than start date?
        
        // get API keys
        const urlGeonames = 'http://api.geonames.org/searchJSON?q=';
        const usernameGeonames = '&username='+ keys.geonames_username;
        const api_key_weatherbit = keys.weatherbit_key;
        const api_key_pixabay = keys.pixabay_key;

        // get input data
        const inputdata = getInputData()

        // get data from Geonames API
        getGeonamesData(urlGeonames+inputdata.location+'&maxRows=1'+usernameGeonames)
        .then(function(locData){
            console.log(`Location Data: ${locData}`)
            let travelData = {
                city: locData.city, 
                country: locData.country, 
                lat: locData.lat, 
                lng: locData.lng, 
                startdate: inputdata.startdate, 
                enddate: inputdata.enddate
            }
            // Add data to Source POST requrest
            postStuff('/addToSource',travelData);
            // Calculate number of days until departure and journey duration
            let today = new Date();
            const dayCountdown = deltaDays(today, inputdata.startdate);
            const jouneyDuration = deltaDays(inputdata.startdate, inputdata.enddate)
            console.log(`Days until departure: ${dayCountdown}`)
            console.log(`Duration of journey in days: ${jouneyDuration}`)
            // get weather data for input location from weatherbit
            getWeatherData(api_key_weatherbit,travelData,dayCountdown,jouneyDuration)
            .then(function(fullWeatherData){
                // get a picture of the location from pixabay API
                getPicture(api_key_pixabay,travelData.city)
                .then(function(picturepath){
                    // Update website!
                    console.log('Updating website...')
                    updateWebsite(dayCountdown,fullWeatherData, picturepath);
                })
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
const getInputData = () =>{
    //Declare date variables
    let startdate = new Date();
    let enddate = new Date();

    // get entered location
    const location = document.getElementById('loc').value;
    // read out start & end date from user input
    startdate = document.getElementById('startdate').value;
    enddate = document.getElementById('enddate').value;
    const inputdata = {
        location: location,
        startdate: startdate,
        enddate: enddate
    }
    return inputdata
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

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< WEATHER >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// <<< Start Function --------------------------------------------------------
// Get weather data from weatherbit API
const getWeatherData = async (api_key_weatherbit, travelData,dayCountdown,jouneyDuration) => {
    // use the best method to get weather data for journey dates
    let weatherData = [];
    if (((dayCountdown) <= 1) && ((dayCountdown+jouneyDuration) <= 16)){
        // display current weather for the current day
        getCurrentWeatherData(api_key_weatherbit,travelData, weatherData)
        .then(function(weatherData){
            console.log('Weather Data Current')
            console.log(weatherData)
            getForecastWeatherData(api_key_weatherbit,travelData, weatherData, true)
            .then(function(weatherData){
                console.log(weatherData)
                return weatherData;
            })
        })
    } else if (((dayCountdown) > 1) && ((dayCountdown+jouneyDuration) <= 16)){
        // use forecast method
        getForecastWeatherData(api_key_weatherbit,travelData, weatherData, false)
        .then(function(weatherData){
            return weatherData;
        })
    } else if ((dayCountdown <= 1) && ((dayCountdown+jouneyDuration) >= 16)){
        // display current weather for the current day & forecast & more than forecast (for vacation longer than 16 days)
        getCurrentWeatherData(api_key_weatherbit,travelData, weatherData)
        .then(function(weatherData){
            console.log('Weather Data Current')
            console.log(weatherData)
            getForecastWeatherData(api_key_weatherbit,travelData, weatherData, true)
            .then(function(weatherData){
                const nDays = dayCountdown+jouneyDuration-16;
                setUnknownWeatherData(nDays, weatherData, travelData.startdate,false)
                .then(function(weatherData){
                    return weatherData;
                })
            })
        })
    } else if ((dayCountdown <= 16) && ((dayCountdown+jouneyDuration) >= 16)){
        // mix forecast and historical
        getForecastWeatherData(api_key_weatherbit,travelData, weatherData, false)
        .then(function(weatherData){
            const nDays = dayCountdown+jouneyDuration-16;
            setUnknownWeatherData(nDays, weatherData, travelData.startdate,false)
            .then(function(weatherData){
                return weatherData;
            })
        })
    } else if (dayCountdown > 16){
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

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< PICTURE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// <<< Start Function --------------------------------------------------------
// Get weather data from weatherbit API
const getPicture = async (api_key_pixabay, location) => {
    console.log(`getPicture - API-Key: ${api_key_pixabay}`)
    console.log(`getPicture - Location: ${location}`)
    // display current weather for the current day & forecast & more than forecast (for vacation longer than 16 days)
    const urlFoundation = 'https://pixabay.com/api/';
    const API_key = '?key=' + api_key_pixabay
    const searchterm = '&q=' + location + '&image_type=photo';
    
    // set together url
    const url = urlFoundation+API_key+searchterm
    const res = await fetch(url);
    try{
        const data = await res.json();
        console.log(`app.js: PictureData: ${data.hits[1].webformatURL}`)
        const picturepath = data.hits[1].webformatURL;
        // extract relevant data from API response
        return picturepath;
    } catch(error){
        console.log("error", error);
    }
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Update website with new location
const updateWebsite = async (dayCountdown,fullWeatherData, picturepath) => {
    const request = await fetch('/source');
    try{
        const allData = await request.json();
        const lastIndex = allData.length - 1;
        document.getElementById('date').innerHTML = `Days until Jounrey: ${dayCountdown}`;
        document.getElementById('temp').innerHTML = `City: ${allData[lastIndex].city} (Lat: ${allData[lastIndex].lateral} Long: ${allData[lastIndex].longitudinal} )
                                                    Country: ${allData[lastIndex].country}`;
        document.getElementById('content').innerHTML = `From: ${allData[lastIndex].startdate}   Till: ${allData[lastIndex].enddate}`;
        document.getElementById('image').innerHTML = `<img src="${picturepath}" alt="alt">`;
    } catch(error) {
        console.log("error", error);
    }
}
// End Function >>> 




export { handleNewLocationSubmit }
