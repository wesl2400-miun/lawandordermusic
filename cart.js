
const ENVIRONMENT = Object.freeze({
  PRODUCTION: 'https://wesl2400-miun.github.io/lawandordermusic/',
  DEV: 'http://127.0.0.1:5500/'
});

const BASE_URL = ENVIRONMENT.DEV;

const REF = Object.freeze({
  STORE: `${BASE_URL}store.html`,
  CART: `${BASE_URL}cart.html`,
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
  constructor(ref, src, alt, title, mp3) {
    this.ref = ref;
    this.src = src;
    this.alt = alt;
    this.title = title;
    this.price = '$2';
    this.mp3 = mp3;
  }
}

class DialogView {
  constructor() {
    this._modal = getRef('modal');
    this._dialog = getRef('dialog');
    this._okBtn = getRef('ok-btn');
    this._wire();
  }

  _wire = () => {
    this._okBtn.addEventListener('click', () => {
      this.updateDialog(false);
    });
  }

  updateDialog = (isVisible = true) => {
    const visibility = isVisible ? 'flex' : 'none';
    this._modal = getRef('modal');
    this._modal.style.display = visibility;
    this._dialog = getRef('dialog');
    this._dialog.style.display = visibility;
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

  storeConfig = (dialogView) => {
    const { ref, mp3 } = this._track;
    this._initInfoBtn(ref); 
    this._initCartBtn(ref, dialogView);
    new Player(this._root, mp3);
  }
  
  cartConfig = (main, card) => {
    const { ref } = this._track;
    this._initTrashBtn(ref, main, card);
  }

  _initInfoBtn = (ref) => {
    const infoBtn = initTag('button', null, this._root);
    infoBtn.id = 'info-btn';
    infoBtn.setAttribute('aria-label', 'Information');
    const img = initTag('img', null, infoBtn);
    img.src = './assets/info.svg'; 
    this._wireCurrent(infoBtn, ref);
  }

  _wireCurrent = (tag, ref) => {
    tag.addEventListener('click', () => {
      sessionStorage.setItem(REF.CURRENT, ref);
      window.location.href = `product.html?track=${encodeURIComponent(ref)}`;
    });
  }

  _initCartBtn = (ref, dialogView) => {
    const cartBtn = initTag('button', null, this._root);
    cartBtn.id = 'cart-btn';
    cartBtn.setAttribute('aria-label', 'Add to Cart');
    const img = initTag('img', null, cartBtn);
    img.src = './assets/cart.svg';
    this._wireAdd(cartBtn, ref, dialogView);
  }

  _wireAdd = (tag, ref, dialogView) => {
    tag.addEventListener('click', () => {
      const item = sessionStorage.getItem(ref);
      if(item) dialogView.updateDialog();
      else sessionStorage.setItem(ref, ref);
    });
  }

  _initTrashBtn = (ref, main, card) => {
    const trashBtn = initTag('button', null, this._root);
    trashBtn.id = 'trash-btn';
    trashBtn.setAttribute('aria-label', 'Remove from Cart');
    const img = initTag('img', null, trashBtn);
    img.src = './assets/trash.svg';
    this._wireRemove(trashBtn, ref, main, card);
  }

  _wireRemove = (tag, ref, main, card) => {
    tag.addEventListener('click', () => {
      sessionStorage.removeItem(ref);
      main.removeChild(card);
    });
  }
}

class Card {
  constructor(track) {
    this._root = initTag('section', 'store-card', main);
    this._track = track;
    this._initImg();
  }

  _initImg = () => {
    const img = initTag('img', null, this._root);
    const { src, alt } = this._track;
    img.src = src;
    img.alt = alt;
  }

  _details = () => {
    const details = new DetailsView(
      this._root, this._track);
    return details.root;
  }

  storeConfig = (dialogView) => {
    const actBar = new ActBarView(
      this._details(), this._track);
    actBar.storeConfig(dialogView);
  }

  cartConfig = (main) => {
    const actBar = new ActBarView(
      this._details(), this._track);
    actBar.cartConfig(main, this._root);
  }
}

class StoreView {
  constructor(tracks) {
    this._tracks = tracks;
  }

  render = (dialogView, cartCounter) => {
    for(const [_, track] of this._tracks) {
      const card = new Card(track, cartCounter);
      card.storeConfig(dialogView);
    }
  }
}

class CartView {
  constructor(tracks) {
    this._tracks = tracks;
    this._buyBtn = getRef('buy-btn');
  }

  render = (main, cartCounter) => {
    for(const key of Object.keys(sessionStorage)) {
      const track = this._tracks.get(key);
      if(track) {
        const card = new Card(track, cartCounter);
        card.cartConfig(main);
      }
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

  const main = getRef('main');
  const dialogView = new DialogView();

  const path = window.location.href;
  if(path === REF.STORE) {
    const storeView = new StoreView(tracks);
    storeView.render(dialogView);
  } else if(path === REF.CART) {
    const cartView = new CartView(tracks);
    cartView.render(main);
  }
});