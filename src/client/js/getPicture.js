// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< PICTURE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// <<< Start Function --------------------------------------------------------
// Get weather data from weatherbit API
const getPictureData = async (api_key_pixabay, location) => {
    // console.log(`getPicture - API-Key: ${api_key_pixabay}`)
    // console.log(`getPicture - Location: ${location}`)
    // display current weather for the current day & forecast & more than forecast (for vacation longer than 16 days)
    const urlFoundation = 'https://pixabay.com/api/';
    const API_key = '?key=' + api_key_pixabay
    const searchterm = '&q=' + location + '&image_type=photo';
    
    // set together url
    const url = urlFoundation+API_key+searchterm
    const res = await fetch(url);
    try{
        const data = await res.json();
        // if no picture found for entered location, search for "no image found"
        if(data.totalHits === 0) {
            const url = urlFoundation+API_key+'&q=not found&image_type=photo'
            const res = await fetch(url);
            try{
                const data = await res.json();
                // extract picture url from received data
                const picturepath = data.hits[0].webformatURL;
                return picturepath;
            } catch(error) {
                console.log("error",error)
            }
        } else if (data.totalHits >= 10) {
            // get random picture out of the first 10 pictures
            const nmbr = Math.floor(Math.random()*10);
            const picturepath = data.hits[nmbr].webformatURL;
            console.log(`getPicture.js: ${data.hits[0].webformatURL}`)
            return picturepath;
        } else {
            // extract picture url from received data
            console.log(`getPicture.js: ${data.hits[0].webformatURL}`)
            const picturepath = data.hits[0].webformatURL;
            return picturepath;
        }
    } catch(error){
        console.log(`Pixalog no hits error error error`)
        console.log("error", error);
    }
}
// End Function >>> 

export { getPictureData }