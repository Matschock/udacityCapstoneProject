// <<< Start Function --------------------------------------------------------
// Callback function handleNewLocationSubmit
async function handleNewLocationSubmit(event){    
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
            postStuff('/addToSource',travelData, inputdata);
            // Calculate number of days until departure and journey duration
            let today = new Date();
            const dayCountdown = deltaDays(today, inputdata.startdate);
            const jouneyDuration = deltaDays(inputdata.startdate, inputdata.enddate)
            // get weather data for input location from weatherbit
            Client.getWeatherData(api_key_weatherbit,travelData,dayCountdown,jouneyDuration)
            .then(function(fullWeatherData){
                console.log('app.js: weatherdata received?')
                console.log(fullWeatherData)
                // get a picture of the location from pixabay API
                Client.getPictureData(api_key_pixabay,travelData.city)
                .then(function(picturepath){
                    // Update website!
                    console.log(':::Updating website...:::')
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
    const location = document.getElementById('locationinput').value;
    // read out start & end date from user input
    startdate = document.getElementById('startdateinput').value;
    enddate = document.getElementById('enddateinput').value;
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
        console.log('Geonames:')
        console.log(locData)
        return locData;
    } catch(error){
        console.log("error", error);
    }
}
// End Function >>> 

// <<< Start Function --------------------------------------------------------
// Function to aggregate data from geonames and from input
const aggregateData = (geonamesdata, inputdata) => {
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
        
        document.getElementById('traveldestination').innerHTML = allData[lastIndex].city;
        document.getElementById('datefrom').innerHTML = allData[lastIndex].startdate;
        document.getElementById('dateuntil').innerHTML = allData[lastIndex].enddate;
        document.getElementById('countdown').innerHTML = dayCountdown;
        document.getElementById('pictureholder').innerHTML = `<img id="picture" src="${picturepath}" alt="alt">`;
        // weatherdata - fullWeatherData
        console.log('updateWebsite: weatherdata received')
        console.log(fullWeatherData)
        const weathercontainer = document.getElementById('weather');
        // remove all weatheritems if already existing
        weathercontainer.textContent = '';
        for (let day of fullWeatherData){
            let weatheritem = document.createElement("div");
            weatheritem.classList.add("weather-item");
            // weatheritem.innerHTML = `${day.date} - Temp: ${day.temp} \u00B0 C`;
            let weatheritemdate = document.createElement("div");
            let weatheritemtemp = document.createElement("div");
            let weatheritemminmax = document.createElement("div");
            weatheritemdate.className = "weather-item-date";
            weatheritemdate.innerHTML = `${day.date}`;
            weatheritemtemp.className = "weather-item-temp";
            weatheritemtemp.innerHTML = `${day.temp}\u00B0C`;
            weatheritemminmax.className = "weather-item-minmax";
            weatheritemminmax.innerHTML = `${day.min_temp}\u00B0C / ${day.max_temp}\u00B0C`;
            // appendChild
            let documentFragment = document.createDocumentFragment();
            documentFragment.appendChild(weatheritem);
            weatheritem.appendChild(weatheritemdate);
            weatheritem.appendChild(weatheritemtemp);
            weatheritem.appendChild(weatheritemminmax);
            weathercontainer.appendChild(documentFragment);
        }
    } catch(error) {
        console.log("error", error);
    }
}
// End Function >>> 




export { handleNewLocationSubmit }
