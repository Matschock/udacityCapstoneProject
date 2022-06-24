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
                const dayCountdown = daysUntilDeparture(today, startdate);
                // if countdown <= 16 days -> use forecast method
                // if countdown > 16 days -> use historical data estimation
                // get weather data from weatherbit
                console.log(`Days until Departure: ${dayCountdown}`)
                getForecastWeatherData(api_key_weatherbit,travelData)
                // Update website!
                updateWebsite(dayCountdown);
            })
    })
}

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
        // extrace relevant data from API response
    //     let locData = {
    //         city: data.geonames[0].name,
    //         country: data.geonames[0].countryName,
    //         lat: data.geonames[0].lat,
    //         lng: data.geonames[0].lng
    //     }
    //     // print to console
    //     console.log('This is the ${data}')
    //     console.log(data)
    //     console.log(data.geonames[0].name)
    //     console.log('This is the ${locData}')
    //     console.log(locData)
    //     return locData;
    } catch(error){
        console.log("error", error);
    }
}

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

const daysUntilDeparture = (currentDate, startDateJourney) => {
    // console.log(`StartDate - Today: ${startDateJourney.getTime() - currentDate.getTime()}`)
    const startDate = new Date(startDateJourney);
    const deltaDays = Math.ceil(Math.abs(startDate  - currentDate)/(1000*60*60*24));
    return deltaDays;
}


export { handleNewLocationSubmit }
