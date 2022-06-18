import { handleNewLocationSubmit } from './js/app'
//
import './styles/style.scss'
// import './styles/base.scss'
// import './styles/footer.scss'
// import './styles/form.scss'
// import './styles/header.scss'
//
export {
  handleNewLocationSubmit
}

console.log("From Index.js: we are here");

// Event listener for generate
document.getElementById('generate').addEventListener('click', handleNewLocationSubmit);
