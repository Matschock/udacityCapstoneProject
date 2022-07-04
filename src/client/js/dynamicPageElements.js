// <<< Start Function --------------------------------------------------------
// Callback function toggleNavbar
function toggleNavbar(event){
    console.log('Navbar here')
    const navbar = document.getElementById('navbar');

    navbar.classList.toggle("fadeIn");
    navbar.classList.toggle("fadeOut"); 
}
// End Function >>> 

export { toggleNavbar }