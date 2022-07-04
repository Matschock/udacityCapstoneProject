// <<< Start Function --------------------------------------------------------
// Callback function handleNewLocationSubmit
function handleNewLocationSubmit(event){    
    // Get all keys / usernames needed for API authentification from Server
    getKeys('http://localhost:3000/keys')
    .then(function(keys){
        // get input data
        const inputdata = getInputData()
        // Input checker missing. (mark date input field red when not fitting)
        const inputCheckPassed = Client.checkInput(inputdata)
        if(!inputCheckPassed){
            return
        }

        // get API keys
        const urlGeonames = 'http://api.geonames.org/searchJSON?q=';
        const usernameGeonames = '&username='+ keys.geonames_username;
        const api_key_weatherbit = keys.weatherbit_key;
        const api_key_pixabay = keys.pixabay_key;

        // get data from Geonames API
        getGeonamesData(urlGeonames+inputdata.location+'&maxRows=1'+usernameGeonames)
        .then(function(locData){
            // console.log(`Location Data: ${locData}`)
            const travelData = aggregateData(locData, inputdata)
            // Add data to Source POST requrest
            postStuff('/addToSource',locData, inputdata);
            // Calculate number of days until departure and journey duration
            let today = new Date();
            const dayCountdown = deltaDays(today, inputdata.startdate);
            const jouneyDuration = deltaDays(inputdata.startdate, inputdata.enddate)
            // get weather data for input location from weatherbit
            Client.getWeatherData(api_key_weatherbit,travelData,dayCountdown,jouneyDuration)
            .then(function(fullWeatherData){
                // get a picture of the location from pixabay API
                Client.getPictureData(api_key_pixabay,travelData.city)
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
// Function to aggregate data from geonames and from input
const aggregateData = async (geonamesdata, inputdata) => {
    let travelData = {
        city: geonamesdata.city, 
        country: geonamesdata.country, 
        lat: geonamesdata.lat, 
        lng: geonamesdata.lng, 
        startdate: inputdata.startdate, 
        enddate: inputdata.enddate
    }
    return travelData
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Post stuff to server
const postStuff = async (url = '',data) => {
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
// Calculate days until departure
const deltaDays = (currentDate, startDateJourney) => {
    // console.log(`StartDate - Today: ${startDateJourney.getTime() - currentDate.getTime()}`)
    const startDate = new Date(currentDate);
    const endDate = new Date(startDateJourney);
    const deltaDays = Math.ceil(Math.abs(startDate  - endDate)/(1000*60*60*24));
    return deltaDays;
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
