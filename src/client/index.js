import { handleNewLocationSubmit } from './js/app'
import { checkInput } from './js/inputChecker'
import { getWeatherData } from './js/getWeather'
import { getPictureData } from './js/getPicture'

// import styles
import './styles/base.scss'
import './styles/header.scss'
import './styles/structure.scss'
// import './styles/form.scss'
// import './styles/footer.scss'

//
export {
  handleNewLocationSubmit,
  checkInput,
  getWeatherData,
  getPictureData
}

console.log("From client side index.js: we are here");

// Event listener for generate
document.getElementById('generate').addEventListener('click', handleNewLocationSubmit);
