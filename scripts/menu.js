// Kör denna kod när laddningen av alla filer är klar - Ansvarar för navigerinsmenyn
window.addEventListener('load', () => {

  // Hämta referenserna till meny-knappen och rutterna i navigeringsmenyn
  const menuBtn = document.getElementById('menu-btn');
  const routes = document.getElementById('routes');
  const main = document.getElementById('main');

  let closed = true;
  const iconPath = './assets/';

  // Fäll ihop navigerinsmenyn
  const closeMenu = () => {
    menuBtn.src = `${iconPath}menu-closed.svg`;
    routes.style.display = 'none';
    main.style.display = 'flex';
    main.style.animation = 'close-menu 0.4s ease-out';
    closed = true;
  }

  // Utök navigeringsmenyn
  const openMenu = () => {
    menuBtn.src = `${iconPath}menu-open.svg`;
    routes.style.display = 'flex';
    routes.style.animation = 'open-menu 0.3s ease-out';
    main.style.display = 'none';
    closed = false;
  }

  // Använd en icke-hopfällbar navigeringsmeny
  const resetMenu = () => {
    menuBtn.style.display = 'none';
    routes.style.display = 'flex';
    routes.style.animation = 'none';
    main.style.display = 'flex';
    main.style.animation = 'none';
  }

  // Gör navigeringsmenyn hopfällbar
  const applyMenu = () => {
    menuBtn.style.display = 'block';
    menuBtn.src = `${iconPath}menu-closed.svg`;
    routes.style.display = 'none';
    main.style.display = 'flex';
    closed = true;
  }
 
  // Låt meny-knappen reagera på klick event
  menuBtn.addEventListener('click', () => {
    if(closed) openMenu();
    else closeMenu();
  });

  // Ta bort eller applicera en hopfällbar meny beroende på fönsterbreeden och kolla upp detta i realtid
  window.addEventListener('resize', () => {
    if(window.innerWidth >= 500) resetMenu();
    else applyMenu();
  });
});
