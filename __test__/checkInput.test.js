// Import the js file to test
import { checkInput } from '../src/client/js/inputChecker'

// The describe() function takes two arguments - a string description, and a test suite as a callback function.  
// A test suite may contain one or more related tests    
describe("Testing the input checker functionality", () => {
    // The test() function has two arguments - a string description, and an actual test as a callback function.  
    test("Testing the input check function", () => {
        // Define the input for the function, if any, in the form of variables/array
        const inputdata = {
            location: "Berlin",
            startdate: "15-07-2022",
            enddate: "03-07-2022"
        }
        // Define the expected output, if any, in the form of variables/array
        const output = false;
        // The expect() function, in combination with a Jest matcher, is used to check if the function produces the expected output
        // The general syntax is `expect(myFunction(arg1, arg2, ...)).toEqual(expectedValue);`, where `toEqual()` is a matcher
        expect(checkInput(inputdata)).toEqual(output);
    })
});