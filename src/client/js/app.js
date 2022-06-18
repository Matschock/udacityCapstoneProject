// Callback function performAction
function handleNewLocationSubmit(event){
    /* Global Variables */
    // Personal API Key for OpenWeatherMap API
    const myApiKey = '&appid=d447d3d87b60bb09c3b42f23c3d2d799&units=imperial';
    const URLfoundation = 'https://api.openweathermap.org/data/2.5/weather?zip=';
    const countryCode = ',de';
    //Declare Variable
    let date = new Date();

    // get entered zip code
    const zip = document.getElementById('zip').value;
    // get entered user response
    const userResponse = document.getElementById('feelings').value;
    // Create a new date instance dynamically with JS
    let fullDate = date.getMonth()+1+'.'+ date.getDate()+'.'+ date.getFullYear();
    // call OpenWeatherMap
    getTempData(URLfoundation+zip+countryCode+myApiKey)
    .then(function(temperatureC){
        // Add data to POST requrest
        postStuff('/addToSource',{temperature: temperatureC, date: fullDate, userResponse: userResponse});
        // Update website!
        updateWebsite();
    })
}

// Function to ask for data from OpenWeatherMap
const getTempData = async (url) => {
    const res = await fetch(url);
    try{
        const data = await res.json();
        // Kelvin to Celsius
        let temperatureC = data.main.temp;
        temperatureC = temperatureC.toFixed(2);
        return temperatureC;
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
        document.getElementById('date').innerHTML = allData[lastIndex].date;
        document.getElementById('temp').innerHTML = allData [lastIndex].temperature + ' °F';
        document.getElementById('content').innerHTML = allData[lastIndex].userResponse;
    } catch(error) {
        console.log("error", error);
    }
}


export { handleNewLocationSubmit }
