import { handleNewLocationSubmit } from './js/app'
import { checkInput } from './js/inputChecker'
import { getWeatherData } from './js/getWeather'
import { getPictureData } from './js/getPicture'
import { toggleNavbar } from './js/dynamicPageElements'

// import styles
import './styles/base.scss'
import './styles/header.scss'
import './styles/structure.scss'
import './styles/navbar.scss'
import './styles/travelcard.scss'
// import './styles/footer.scss'

//
export {
  handleNewLocationSubmit,
  checkInput,
  getWeatherData,
  getPictureData,
  toggleNavbar
}

console.log("From client side index.js: we are here");

// Event listener for button
document.getElementById('add').addEventListener('click', handleNewLocationSubmit);
// Event listener for navbar
document.getElementById('navbarview').addEventListener('click', toggleNavbar);
