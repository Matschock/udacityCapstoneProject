import { handleNewLocationSubmit } from './js/app'

// import styles
import './styles/base.scss'
import './styles/header.scss'
import './styles/structure.scss'
// import './styles/form.scss'
// import './styles/footer.scss'

//
export {
  handleNewLocationSubmit
}

console.log("From Index.js: we are here");

// Event listener for generate
document.getElementById('generate').addEventListener('click', handleNewLocationSubmit);
