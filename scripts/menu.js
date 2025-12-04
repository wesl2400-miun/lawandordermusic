/** Kör denna kod när laddningen av alla filer är klar **/
window.addEventListener('load', () => {

  /** Hämta referenserna till meny-knappen och rutterna i navigeringsmenyn **/
  const menuBtn = document.getElementById('menu-btn');
  const routes = document.getElementById('routes');
  const main = document.getElementById('main');

  let closed = true;
  const iconPath = './assets/';

  /** Visa eller dölj navigeringsmenyn, byt bilden på den och lägg till eller ta bort animationen från den **/
  const modify = (tag, display, animation) => {
    tag.style.display = display;
    tag.style.animation = animation;
  };
  
  /** Öppna eller stäng navigeringsmenyn beroende på 'closed' flaggan **/
  menuBtn.addEventListener('click', () => {
    if(closed) {
      menuBtn.setAttribute('src', `${iconPath}menu-open.svg`);
      modify(routes, 'flex', 'open-menu 0.3s ease-out');
      modify(main, 'none', 'none');
    } else {
      menuBtn.setAttribute('src', `${iconPath}menu-closed.svg`);
      modify(routes, 'none', 'none');
      modify(main, 'flex', 'close-menu 0.4s ease-out');
    }
    closed = !closed;
  });
});
