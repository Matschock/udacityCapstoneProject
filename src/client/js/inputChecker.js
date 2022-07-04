function checkInput(inputText) {
    // Check if input data is valid
    // start date must be later than today + end date must be later than start date
    console.log("::: Running checkInput :::" + inputText.startdate + " & " + inputText.enddate);
    const startdate = new Date(inputText.startdate);
    const enddate = new Date(inputText.enddate);

    const deltaDays = Math.ceil((enddate-startdate)/(1000*60*60*24));
    console.log(`InputChecker: ${deltaDays}`)

    if(deltaDays<0){
        alert("Invalid dates entered.")
        return false
    }
    return true
}

export { checkInput }