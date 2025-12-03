
const ENVIRONMENT = Object.freeze({
  PRODUCTION: 'https://wesl2400-miun.github.io/lawandordermusic/',
  DEV: 'http://127.0.0.1:5500/'
});

const BASE_URL = ENVIRONMENT.PRODUCTION;

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

const refreshCart = () => {
  const cartBtn = getRef('cart-btn');
  let value = sessionStorage.length;
  if(sessionStorage.getItem(REF.CURRENT)) value--;
  cartBtn.textContent = `GO TO CART: ${value}`
}

const REF = Object.freeze({
  CURRENT: 'CURRENT',
  STORE: `${BASE_URL}store.html`,
  CART: `${BASE_URL}cart.html`,
  BULLETPROOF: 'BULLETPROOF',
  SURVEILLANCE: 'SURVEILLANCE',
  TWO_STEPS_AHEAD: 'TWO_STEPS_AHEAD',
  UNTOUCHABLE: 'UNTOUCHABLE',
  CONFRONTATION: 'CONFRONTATION'
});

class Track {
  constructor(ref, src, alt, title, mp3) {
    this.ref = ref;
    this.src = src;
    this.alt = alt;
    this.title = title;
    this.price = '$2';
    this.mp3 = mp3;
  }
}

class DetailsView {
  constructor(parent, title, price) {
    this.root = initTag('div', 'store-card__details', parent);
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
  constructor(main, card, parent, mp3, ref) {
    this._main = main;
    this._card = card;
    this._root = initTag('div', 'store-card__action-bar', parent);
    const path = window.location.href;
    if(path == REF.STORE) { 
      this._initInfoBtn(ref); 
      this._initCartBtn(ref);
      new Player(this._root, mp3);
    } else if(path == REF.CART) {
      this._initTrashBtn(ref);
    }
  }

  _initInfoBtn = (ref) => {
    const infoBtn = initTag('button', null, this._root);
    infoBtn.id = 'info-btn';
    infoBtn.setAttribute('aria-label', 'Information');
    const img = initTag('img', null, infoBtn);
    img.src = './assets/info.svg'; 
    this._wireCurrent(infoBtn, ref);
  }

  _initCartBtn = (ref) => {
    const cartBtn = initTag('button', null, this._root);
    cartBtn.id = 'cart-btn';
    cartBtn.setAttribute('aria-label', 'Add to Cart');
    const img = initTag('img', null, cartBtn);
    img.src = './assets/cart.svg';
    this._wireAdd(cartBtn, ref);
  }

  _initTrashBtn = (ref) => {
    const trashBtn = initTag('button', null, this._root);
    trashBtn.id = 'trash-btn';
    trashBtn.setAttribute('aria-label', 'Remove from Cart');
    const img = initTag('img', null, trashBtn);
    img.src = './assets/trash.svg';
    this._wireRemove(trashBtn, ref);
  }

  _wireCurrent = (tag, ref) => {
    tag.addEventListener('click', () => {
      sessionStorage.setItem(REF.CURRENT, ref);
      window.location.href = './product.html';
    });
  }

  _wireAdd = (tag, ref) => {
    tag.addEventListener('click', () => {
      sessionStorage.setItem(ref, ref);
      refreshCart();
    });
  }

  _wireRemove = (tag, ref) => {
    tag.addEventListener('click', () => {
      sessionStorage.removeItem(ref);
      this._main.removeChild(this._card);
    });
  }
}

class StoreCard {
  constructor(main, track) {
    this._root = initTag('section', 'store-card', main);
    const { ref, src, alt, title, price, mp3 } = track;
    this._initImg(src, alt)
    this._initDetails(main, ref, title, price, mp3);
  }

  _initImg = (src, alt) => {
    const img = initTag('img', null, this._root);
    img.src = src;
    img.alt = alt;
  }

  _initDetails = (main, ref, title, price, mp3) => {
    const details = new DetailsView(this._root, title, price);
    const { root } = details;
    new ActBarView(main, this._root, root, mp3, ref);
  }
}

const renderStore = (tracks) => {
  const path = window.location.href;
  const main = getRef('main');
  if(path == REF.STORE) {
    for(const [_, track] of tracks) {
      new StoreCard(main, track);
      const cartBtn = getRef('cart-btn');
      cartBtn.addEventListener('click', () => {
        window.location.href = './cart.html';
      });
      refreshCart();
    }
  } else if(path == REF.CART) {
    for(const key of Object.keys(sessionStorage)) {
      const track = tracks.get(key);
      if(track) new StoreCard(main, track);
    }
  }
}

window.addEventListener('load', () => {
  const tracks = new Map([
    [ REF.BULLETPROOF, new Track(
      REF.BULLETPROOF, 
      './assets/images/bulletproof-cover.png',
      'Law & Order - Bulletproof - Single Cover',
      'Law & Order - Bulletproof',
      './assets/audio/law_and_order_bulletproof.mp3'
    )],
    [ REF.SURVEILLANCE, new Track(
      REF.SURVEILLANCE, 
      './assets/images/surveillance-cover.png',
      'Law & Order - Surveillance - Single Cover',
      'Law & Order - Surveillance',
      './assets/audio/law_and_order_surveillance.mp3'
    )],
    [ REF.TWO_STEPS_AHEAD, new Track(
      REF.TWO_STEPS_AHEAD, 
      './assets/images/two-steps-ahead-cover.png',
      'Law & Order - Two Steps Ahead - Single Cover',
      'Law & Order - Two Steps Ahead',
      './assets/audio/law_and_order_two_steps_ahead.mp3'
    )],
    [ REF.UNTOUCHABLE, new Track(
      REF.UNTOUCHABLE, 
      './assets/images/untouchable-cover.png',
      'Law & Order - Untouchable - Single Cover',
      'Law & Order - Untouchable',
      './assets/audio/law_and_order_untouchable.mp3'
    )],
    [ REF.CONFRONTATION, new Track(
      REF.CONFRONTATION, 
      './assets/images/confrontation-cover.png',
      'Law & Order - Confrontation - Single Cover',
      'Law & Order - Confrontation',
      './assets/audio/law_and_order_confrontation.mp3'
    )]
  ]);
  renderStore(tracks);
});