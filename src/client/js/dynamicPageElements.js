// <<< Start Function --------------------------------------------------------
// Callback function toggleNavbar
function toggleNavbar(event){
    console.log('Navbar here')
    const main = document.getElementById('main');
    const navbar = document.getElementById('navbar');
    const location = document.getElementById('location');
    const startdate = document.getElementById('startdate');
    const enddate = document.getElementById('enddate');
    const bGenerate = document.getElementById('bGenerate');
    const test = document.getElementById('test');

    // location.classList.toggle("fadeIn");
    // location.classList.toggle("fadeOut");
    // startdate.classList.toggle("fadeIn");
    // startdate.classList.toggle("fadeOut");
    // enddate.classList.toggle("fadeIn");
    // enddate.classList.toggle("fadeOut");
    // bGenerate.classList.toggle("fadeIn");
    // bGenerate.classList.toggle("fadeOut");
    navbar.classList.toggle("fadeIn");
    navbar.classList.toggle("fadeOut");
    // test.classList.toggle("fadeIn");
    // test.classList.toggle("fadeOut");
    // main.classList.toggle("grid-full");
    // main.classList.toggle("grid-red");
}
// End Function >>> 

export { toggleNavbar }