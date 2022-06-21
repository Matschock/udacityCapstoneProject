// Callback function performAction
function handleNewLocationSubmit(event){
    /* Global Variables */
    // Personal API Key for OpenWeatherMap API
        // const myApiKey = '&appid=d447d3d87b60bb09c3b42f23c3d2d799&units=imperial';
        // const URLfoundation = 'https://api.openweathermap.org/data/2.5/weather?zip=';
        // const countryCode = ',de';
    // geonames URL
    const urlGeonames = 'http://api.geonames.org/searchJSON?q=';
    const usernameGeonames = '&username=matschok';
    //Declare Variable
    let startdate = new Date();
    let enddate = new Date();

    // get entered location
    const location = document.getElementById('loc').value;
    // get start and end date
    startdate = document.getElementById('startdate').value;
    enddate = document.getElementById('enddate').value;
    // Create a new date instance dynamically with JS
    //let fullDate = date.getMonth()+1+'.'+ date.getDate()+'.'+ date.getFullYear();
    // get data from Geonames
    getGeonamesData(urlGeonames+location+'&maxRows=1'+usernameGeonames)
    .then(function(locData){
        // Add data to POST requrest
        postStuff('/addToSource',{city: locData.city, country: locData.country, lat: locData.lat, lng: locData.lng, startdate: startdate, enddate: enddate});
        // Calculate number of days until journey starts
        const today = new Date();
        const dayCountdown = daysUntilDeparture(startdate - today);
        // Update website!
        updateWebsite();
    })
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

const updateWebsite = async () => {
    const request = await fetch('/source');
    try{
        const allData = await request.json();
        const lastIndex = allData.length - 1;
        document.getElementById('date').innerHTML = `City: ${allData[lastIndex].city} (Lat: ${allData[lastIndex].lateral} Long: ${allData[lastIndex].longitudinal} )`;
        document.getElementById('temp').innerHTML = `Country: ${allData[lastIndex].country}`;
        document.getElementById('content').innerHTML = `From: ${allData[lastIndex].startdate}   Till: ${allData[lastIndex].enddate}`;
    } catch(error) {
        console.log("error", error);
    }
}

const daysUntilDeparture(currentDate, startDateJourney) => {
    const deltaDays = Math.ceil(Math.abs(startDateJourney - currentDate)/(1000*60*60*24));
}


export { handleNewLocationSubmit }
