// Hela koden ansvarar för webbutikens logik; det vill säga tilläggning och borttagning av produkter

// Sökvägen för antigen den publicerade eller den lokala webbplatsen
const ENVIRONMENT = Object.freeze({
  PRODUCTION: 'https://wesl2400-miun.github.io/lawandordermusic/',
  DEV: 'http://127.0.0.1:5500/'
});

// Bassökvägen som ska utgås ifrån, använd PRODUCTION när webbplatsen publiceras
const BASE_URL = ENVIRONMENT.DEV;

// Referenser till undersidor och produkter i produktmappen
const REF = Object.freeze({
  STORE: `${BASE_URL}store.html`,
  CART: `${BASE_URL}cart.html`,
  PRODUCT: `${BASE_URL}product.html`,
  BULLETPROOF: 'bulletproof',
  SURVEILLANCE: 'surveillance',
  TWO_STEPS_AHEAD: 'two-steps-ahead',
  UNTOUCHABLE: 'untouchable',
  CONFRONTATION: 'confrontation'
});

// Referera till en existerande HTML-tagg
const getRef = (id) => {
  return document.getElementById(id);
}

// Skapa ny HTML tagg
const initTag = (type, css = null, parent = null, text = null) => {
  const tag = document.createElement(type);
  if(css) tag.classList.add(css);
  if(parent) parent.appendChild(tag);
  if(text) tag.textContent = text;
  return tag;
}

// Skapa en source tag - Avsedd för repsonsiva bilder
const initSrcTag = (parent, path, type, brPoint) => {
  const source = initTag('source', null, parent);
  if(brPoint) source.media = `(min-width: ${brPoint}px)`;
  source.srcset = path;
  source.type = `image/${type}`;
  return source;
}

// Skapa en bild-tagg
const initImgTag = (parent, src, alt) => {
  const img = initTag('img', null, parent);
  img.alt = alt;
  img.src = src;
  img.setAttribute('fetchpriority', 'high');
}

// Hanterar repsonsiva bilder för produkter
class Picture {
  constructor(parent, src, alt, cover = true) {
    const root = initTag('picture', null, parent);
    if(cover) this._initCover(root, src, alt);
    else this._initThumbImg(root, src, alt);
  }

  // Sätt upp bilden för desktop
  _initCover = (root, src, alt) => {
    // Desktop
    initSrcTag(root, `${src}-800h.webp`, 'webp', '1400');
    initSrcTag(root, `${src}-800h.png`, 'png', '1400');

    // Surplatta
    initSrcTag(root, `${src}-500h.webp`, 'webp', '900');
    initSrcTag(root, `${src}-500h.png`, 'png', '900');

    // Mobil
    initSrcTag(root, `${src}-280h.webp`, 'webp', null);
    initImgTag(root, `${src}-280h.png`, alt);
  }

  _initThumbImg = (root, src, alt) => {
    // Desktop
    initSrcTag(root, `${src}-280h.webp`, 'webp', '1400');
    initSrcTag(root, `${src}-280h.png`, 'png', '1400');

    // Surplatta
    initSrcTag(root, `${src}-200h.webp`, 'webp', '900');
    initSrcTag(root, `${src}-200h.png`, 'png', '900');

    // Mobil
    initSrcTag(root, `${src}-100h.webp 1x, ${src}-200h.webp 2x`, 'webp', null);
    initImgTag(root, `${src}-100h.png`, alt);
  }
}

// Spara all information om en specifik produkt i denna modellklass
class Track {
  constructor(ref, src, alt, title, mp3, desc, mpeg, poster) {
    this.ref = ref;
    this.src = src;
    this.alt = alt;
    this.title = title;
    this.price = '$2';
    this.mp3 = mp3;
    this.desc = desc;
    this.mpeg = mpeg;
    this.poster = poster;
  }
}

// Ansvarar för dialogrutan som visas på webbplatsen när köpte bekräftas och när samma produkt läggs till i varukorgen
class DialogView {
  constructor() {
    this._modal = getRef('modal');
    this._dialog = getRef('dialog');
    this._okBtn = getRef('ok-btn');
    this._updateDialog();
    this._wire();
  }

  // Uppdatera dialogrutan
  _updateDialog = (isVisible = true) => {
    const visibility = isVisible ? 'flex' : 'none';
    this._modal = getRef('modal');
    this._modal.style.display = visibility;
    this._dialog = getRef('dialog');
    this._dialog.style.display = visibility;
  }

  // Stäng dialogrutan när OK-knappen pressas
   _wire = () => {
    this._okBtn.addEventListener('click', () => {
      this._updateDialog(false);
    });
  }

}

// Visar titeln och priset i produkt-kortet
class DetailsView {
  constructor(parent, track) {
    this.root = initTag('div', 'store-card__details', parent);
    const { title, price } = track;
    initTag('h2', null, this.root, title);
    initTag('p', null, this.root, price);
  }
}

// Hanterar logiken och utseendet för ljuspelarknappen
class Player {
  constructor(parent, mp3) {
    this._root = initTag('audio', null, parent, 'Audio Player not supported');
    const source = initTag('source', null, this._root);
    source.src = mp3;
    source.type = 'audio/mpeg';
    this._root.load();
    this._plays = false;
    this._initControls(parent);
  }

  // Designa en skräddarsydd knapp som reagerar på klick
  _initControls = (parent) => {
    const btn = initTag('button', null, parent);
    btn.id = 'player-btn';
    const img = initTag('img', null, btn);
    img.src = this._plays ? './assets/pause.svg' : './assets/play.svg';
    img.alt = this._plays ? 'Pause' : 'Play';
    btn.addEventListener('click', () => {
      if(this._plays) this._root.pause();
      else this._root.play();
      this._plays = !this._plays;
      img.src = this._plays ? './assets/pause.svg' : './assets/play.svg';
      img.alt = this._plays ? 'Pause' : 'Play';
    });
  }
}

// Hanterar logiken bakom alla knappar i produkt-kortet för både 'Store' och 'Cart' undersidorna
class ActBarView {
  constructor(parent, track) {
    this._root = initTag('div', 'store-card__action-bar', parent);
    this._track = track;
  }

  // Konfigurationen för 'Store' undersidan
  storeConfig = () => {
    const { ref, mp3 } = this._track;
    this._initInfoBtn(ref); 
    this._initCartBtn(ref);
    new Player(this._root, mp3);
  }
  
  // Konfigurationen för 'Cart' undersidan
  cartConfig = (cardHolder, card) => {
    const { ref } = this._track;
    this._initTrashBtn(ref, cardHolder, card);
  }

  // Logiken för info-knappen
  _initInfoBtn = (ref) => {
    const infoBtn = initTag('button', null, this._root);
    infoBtn.id = 'info-btn';
    const img = initTag('img', null, infoBtn);
    img.width = '30';
    img.height = '30';
    img.src = './assets/info.svg'; 
    img.alt = 'Information';
    this._wireCurrent(infoBtn, ref);
  }

  // Skicka referensen till den produkten som för närvarande klickas en till produkt undersidan (detta sker via info-knappen)
  _wireCurrent = (tag, ref) => {
    tag.addEventListener('click', () => {
      window.location.href = `${REF.PRODUCT}?track=${encodeURIComponent(ref)}`;
    });
  }

  // Hantera logiken för 'lägg till varukorgen'-knappen
  _initCartBtn = (ref) => {
    const cartBtn = initTag('button', null, this._root);
    cartBtn.id = 'cart-btn';
    const img = initTag('img', null, cartBtn);
    img.width = '30';
    img.height = '30';
    img.src = './assets/cart.svg';
    img.alt = 'Cart';
    this._wireAdd(cartBtn, ref);
  }

  // Spara produkten i sessionStorage när 'lägg till' knappen klickas
  _wireAdd = (tag, ref,) => {
    tag.addEventListener('click', () => {
      const item = sessionStorage.getItem(ref);
      if(item) {
        new DialogView();
      } else {
        sessionStorage.setItem(ref, ref);
        const text = `GO TO CART: ${sessionStorage.length}`;
        getRef('cart-btn').textContent = text;
      }
    });
  }

  // Hantera logiken för ta-bort kanppen
  _initTrashBtn = (ref, cardHolder, card) => {
    const trashBtn = initTag('button', null, this._root);
    trashBtn.id = 'trash-btn';
    const img = initTag('img', null, trashBtn);
    img.width = '30';
    img.height = '30';
    img.src = './assets/trash.svg';
    img.alt = 'Trash';
    this._wireRemove(trashBtn, ref, cardHolder, card);
  }

  // Ta bort produkten från sessionStorage och dess kort från webbplatsen
  _wireRemove = (tag, ref, cardHolder, card) => {
    tag.addEventListener('click', () => {
      sessionStorage.removeItem(ref);
      cardHolder.removeChild(card);
    });
  }
}

// Ansvarar för produktkort vyn
class Card {
  constructor(track, cardHolder) {
    this._root = initTag('li', 'store-card', cardHolder);
    this._cardHolder = cardHolder;
    this._track = track;
    this._initThumbImg();
  }

  // Sätt upp bilden för produkten
  _initThumbImg = () => {
    const { src, alt } = this._track;
    new Picture(this._root, src, alt, false);
  }

  // Lägg till titeln och priset
  _details = () => {
    const details = new DetailsView(
      this._root, this._track);
    return details.root;
  }

  // Konfigurationen för 'Store' undersidan
  storeConfig = () => {
    const actBar = new ActBarView(
      this._details(), this._track);
    actBar.storeConfig();
  }

  // Konfigurationen för 'Cart' undersidan
  cartConfig = () => {
    const actBar = new ActBarView(
      this._details(), this._track);
    actBar.cartConfig(this._cardHolder, this._root);
  }
}

// Generar kort för 'Store' undersidan
class StoreView {
  constructor(tracks, main) {
    this._cardHolder = initTag('ul', 'card-holder', main);
    this._render(tracks);
    this._wireCartBtn();
  }

  // Generera kort
  _render = (tracks) => {
    for(const [_, track] of tracks) {
      const card = new Card(track, this._cardHolder);
      card.storeConfig();
    }
  }

  // Sätt upp den rosa 'Varukorg' knappen som sitter ovanpå produktkorten
  _wireCartBtn = () => {
    const cartBtn = getRef('cart-btn');
    const cartCounter = sessionStorage.length;
    cartBtn.textContent = `GO TO CART: ${cartCounter}`;
    cartBtn.addEventListener('click', () => {
      window.location.href = REF.CART;
    });
  }
}

// Generar kort för 'Cart' undersidan
class CartView {
  constructor(tracks, main) {
    this._cardHolder = initTag('ul', 'card-holder', main);
    this._render(tracks);
    this._wireBuyBtn();
  }

  // Sätt upp den rosa 'Purchase' knappen som sitter ovanpå produktkorten
  _wireBuyBtn = () => {
    const buyBtn = getRef('buy-btn');
    buyBtn.addEventListener('click', () => {
      new DialogView();
      this._cardHolder.innerHTML = '';
      sessionStorage.clear();
    });
  }

  // Generera kort
  _render = (tracks) => {
    for(const key of Object.keys(sessionStorage)) {
      const track = tracks.get(key);
      if(track) {
        const card = new Card(track, this._cardHolder);
        card.cartConfig();
      }
    }
  }
}

// Generara huvudinnehållet för produktundersidan
class ProductView {
  constructor(parent, ref, tracks) {
    this._parent = parent;
    this._root = initTag('section', 'basic-card', this._parent);
    this._track = tracks.get(ref);
    this._initCover();
    this._initDetails();
    this._initVideo();
  }

  // Sätt upp filmen för den specifika produkten
  _initVideo = () => {
    const { title, mpeg, poster } = this._track;
    if(!mpeg) return;
    const card = initTag('section', 'video-card', this._parent);
    const label = initTag('h2', null, card);
    label.textContent = `${title} - Official Video`
    const video = initTag('video', 'clip', card);
    video.preload = 'none';
    video.controls = true;
    video.poster = poster;
    video.width = '280';
    video.height = '150';
    const source = initTag('source', null, video);
    source.type = 'video/mp4';
    source.src = mpeg;
  }

  // Sätt upp produktens bild
  _initCover = () => {
    const { src, alt } = this._track;
    new Picture(this._root, src, alt);
  }

  // Sätt upp titeln och beskriviningen för den specifika produkten
  _initDetails = () => {
    const { title, desc } = this._track;
    const pageTitle = getRef('page-title');
    pageTitle.textContent = title;
    const cardTitle = initTag('h2', null, this._root);
    cardTitle.textContent = title;
    const description = initTag('p', 'basic-card', this._root);
    description.textContent = desc;
  }
}

// Kör denna kod när laddningen av alla filer är klar
window.addEventListener('load', () => {

  // Produktlistan med alla detaljer
  const tracks = new Map([
    [ REF.BULLETPROOF, new Track(
      REF.BULLETPROOF, 
      './assets/images/bulletproof-cover',
      'Law & Order - Bulletproof - Single Cover',
      'Law & Order - Bulletproof',
      './assets/audio/bulletproof.mp3',
      `A story about someone who easily brushes off a bulletrain of attacks like it's nothing.`,
      './assets/videos/bulletproof.mp4',
      './assets/images/bulletproof-poster.png'
    )],
    [ REF.SURVEILLANCE, new Track(
      REF.SURVEILLANCE, 
      './assets/images/surveillance-cover',
      'Law & Order - Surveillance - Single Cover',
      'Law & Order - Surveillance',
      './assets/audio/surveillance.mp3',
      `A story about someone who is constantly watched by hostile people. `,
      './assets/videos/surveillance.mp4',
      './assets/images/surveillance-poster.png'
    )],
    [ REF.TWO_STEPS_AHEAD, new Track(
      REF.TWO_STEPS_AHEAD, 
      './assets/images/two-steps-ahead-cover',
      'Law & Order - Two Steps Ahead - Single Cover',
      'Law & Order - Two Steps Ahead',
      './assets/audio/two-steps-ahead.mp3',
      `A story about someone who can foresee their enemies' next moves and defend themself beforehand.`,
      './assets/videos/two-steps-ahead-ov.mp4',
      './assets/images/two-steps-ahead-ov-poster.png'
    )],
    [ REF.UNTOUCHABLE, new Track(
      REF.UNTOUCHABLE, 
      './assets/images/untouchable-cover',
      'Law & Order - Untouchable - Single Cover',
      'Law & Order - Untouchable',
      './assets/audio/untouchable.mp3',
      `A story about someone who is impossible to take down.`
    )],
    [ REF.CONFRONTATION, new Track(
      REF.CONFRONTATION, 
      './assets/images/confrontation-cover',
      'Law & Order - Confrontation - Single Cover',
      'Law & Order - Confrontation',
      './assets/audio/confrontation.mp3',
      `A story about how open confrontation is sometimes the only path to true peace.`
    )]
  ]);

  // Hämta referens till huvudinnehållets behållare
  const main = getRef('main');

  // Hämta den aktuella sidans address
  const path = window.location.href;

  // Generara lämplig vy beroende på vilekn undersida som aktuellet visas
  if(path === REF.STORE) {
    new StoreView(tracks, main);
  } else if(path === REF.CART) {
    new CartView(tracks, main);
  } else if (path.includes(REF.PRODUCT)) {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('track') || '';
    if(ref) new ProductView(main, ref, tracks);
  }
});