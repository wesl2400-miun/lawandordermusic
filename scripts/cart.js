
const ENVIRONMENT = Object.freeze({
  PRODUCTION: 'https://wesl2400-miun.github.io/lawandordermusic/',
  DEV: 'http://127.0.0.1:5500/'
});

const BASE_URL = ENVIRONMENT.PRODUCTION;

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

const getRef = (id) => {
  return document.getElementById(id);
}

const initTag = (type, css = null, parent = null, text = null) => {
  const tag = document.createElement(type);
  if(css) tag.classList.add(css);
  if(parent) parent.appendChild(tag);
  if(text) tag.textContent = text;
  return tag;
}

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

class DialogView {
  constructor() {
    this._modal = getRef('modal');
    this._dialog = getRef('dialog');
    this._okBtn = getRef('ok-btn');
    this._updateDialog();
    this._wire();
  }
  _updateDialog = (isVisible = true) => {
    const visibility = isVisible ? 'flex' : 'none';
    this._modal = getRef('modal');
    this._modal.style.display = visibility;
    this._dialog = getRef('dialog');
    this._dialog.style.display = visibility;
  }

   _wire = () => {
    this._okBtn.addEventListener('click', () => {
      this._updateDialog(false);
    });
  }

}

class DetailsView {
  constructor(parent, track) {
    this.root = initTag('div', 'store-card__details', parent);
    const { title, price } = track;
    initTag('h2', null, this.root, title);
    initTag('p', null, this.root, price);
  }
}

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

  _initControls = (parent) => {
    const btn = initTag('button', null, parent);
    btn.id = 'player-btn';
    const img = initTag('img', null, btn);
    img.src = this._plays ? './assets/pause.svg' : './assets/play.svg';
    btn.addEventListener('click', () => {
      if(this._plays) this._root.pause();
      else this._root.play();
      this._plays = !this._plays;
      img.src = this._plays ? './assets/pause.svg' : './assets/play.svg';
    });
  }
}

class ActBarView {
  constructor(parent, track) {
    this._root = initTag('div', 'store-card__action-bar', parent);
    this._track = track;
  }

  storeConfig = () => {
    const { ref, mp3 } = this._track;
    this._initInfoBtn(ref); 
    this._initCartBtn(ref);
    new Player(this._root, mp3);
  }
  
  cartConfig = (cardHolder, card) => {
    const { ref } = this._track;
    this._initTrashBtn(ref, cardHolder, card);
  }

  _initInfoBtn = (ref) => {
    const infoBtn = initTag('button', null, this._root);
    infoBtn.id = 'info-btn';
    infoBtn.setAttribute('aria-label', 'Information');
    const img = initTag('img', null, infoBtn);
    img.src = './assets/info.svg'; 
    img.alt = '';
    this._wireCurrent(infoBtn, ref);
  }

  _wireCurrent = (tag, ref) => {
    tag.addEventListener('click', () => {
      window.location.href = `${REF.PRODUCT}?track=${encodeURIComponent(ref)}`;
    });
  }

  _initCartBtn = (ref) => {
    const cartBtn = initTag('button', null, this._root);
    cartBtn.id = 'cart-btn';
    cartBtn.setAttribute('aria-label', 'Add to Cart');
    const img = initTag('img', null, cartBtn);
    img.src = './assets/cart.svg';
    img.alt = '';
    this._wireAdd(cartBtn, ref);
  }

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

  _initTrashBtn = (ref, cardHolder, card) => {
    const trashBtn = initTag('button', null, this._root);
    trashBtn.id = 'trash-btn';
    trashBtn.setAttribute('aria-label', 'Remove from Cart');
    const img = initTag('img', null, trashBtn);
    img.src = './assets/trash.svg';
    img.alt = '';
    this._wireRemove(trashBtn, ref, cardHolder, card);
  }

  _wireRemove = (tag, ref, cardHolder, card) => {
    tag.addEventListener('click', () => {
      sessionStorage.removeItem(ref);
      cardHolder.removeChild(card);
    });
  }
}

class Card {
  constructor(track, cardHolder) {
    this._root = initTag('li', 'store-card', cardHolder);
    this._cardHolder = cardHolder;
    this._track = track;
    this._initImg();
  }

  _initImg = () => {
    const img = initTag('img', null, this._root);
    const { src, alt } = this._track;
    img.src = `${src}-min.png`;
    img.alt = alt;
    img.setAttribute('fetchpriority', 'high');
  }

  _details = () => {
    const details = new DetailsView(
      this._root, this._track);
    return details.root;
  }

  storeConfig = () => {
    const actBar = new ActBarView(
      this._details(), this._track);
    actBar.storeConfig();
  }

  cartConfig = () => {
    const actBar = new ActBarView(
      this._details(), this._track);
    actBar.cartConfig(this._cardHolder, this._root);
  }
}

class StoreView {
  constructor(tracks, main) {
    this._cardHolder = initTag('ul', 'card-holder', main);
    this._render(tracks);
    this._wireCartBtn();
  }

  _render = (tracks) => {
    for(const [_, track] of tracks) {
      const card = new Card(track, this._cardHolder);
      card.storeConfig();
    }
  }

    _wireCartBtn = () => {
    const cartBtn = getRef('cart-btn');
    const cartCounter = sessionStorage.length;
    cartBtn.textContent = `GO TO CART: ${cartCounter}`;
    cartBtn.addEventListener('click', () => {
      window.location.href = REF.CART;
    });
  }
}

class CartView {
  constructor(tracks, main) {
    this._cardHolder = initTag('ul', 'card-holder', main);
    this._render(tracks);
    this._wireBuyBtn();
  }

  _wireBuyBtn = () => {
    const buyBtn = getRef('buy-btn');
    buyBtn.addEventListener('click', () => {
      new DialogView();
      this._cardHolder.innerHTML = '';
      sessionStorage.clear();
    });
  }

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

class ProductView {
  constructor(parent, ref, tracks) {
    this._parent = parent;
    this._root = initTag('section', 'basic-card', this._parent);
    this._track = tracks.get(ref);
    this._initImg();
    this._initDetails();
    this._initVideo();
  }

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
    const source = initTag('source', null, video);
    source.type = 'video/mp4';
    source.src = mpeg;
  }

  _initImg = () => {
    const { src, alt } = this._track;
    const img = initTag('img', null, this._root);
    img.src = `${src}.png`;
    img.alt = alt;
    img.setAttribute('fetchpriority', 'high');
  }

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

window.addEventListener('load', () => {
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

  const main = getRef('main');

  const path = window.location.href;
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