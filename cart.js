
const ref = (id) => {
  return document.getElementById(id);
}

const initTag = (type, css = null, parent = null, text = null) => {
  const tag = document.createElement(type);
  if(css) tag.classList.add(css);
  if(parent) parent.appendChild(tag);
  if(text) tag.textContent = text;
  return tag;
}

const REF = Object.freeze({
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
    this._root = initTag('div', 'store-card__details', parent);
    initTag('h2', null, this._root, title);
    initTag('p', null, this._root, price);
  }

  add = (view) => {
    this._root.appendChild(view.root);
  }
}

class Player {
  constructor(parent, mp3) {
    this._root = initTag('audio', null, parent);
    this._root.controls = true;
    const source = initTag('source', null, this._root);
    source.src = mp3;
    source.type = 'audio/mpeg';
  }
}

class ActBarView {
  constructor(ref, mp3, forStore = true) {
    this.root = initTag('div', 'store-card__action-bar');
    if(forStore) { 
      this._initInfoBtn(ref); 
      this._initCartBtn(ref);
      new Player(this.root, mp3);
    }
    else this._initTrashBtn(ref);
  }

  _initInfoBtn = (ref) => {
    const infoBtn = initTag('button', null, this.root);
    infoBtn.id = 'info-btn';
    infoBtn.setAttribute('aria-label', 'Information');
    const img = initTag('img', null, infoBtn);
    img.src = './assets/info.svg'; 
    this._wireSave(infoBtn, ref);
  }

  _initCartBtn = (ref) => {
    const cartBtn = initTag('button', null, this.root);
    cartBtn.id = 'cart-btn';
    cartBtn.setAttribute('aria-label', 'Add to Cart');
    const img = initTag('img', null, cartBtn);
    img.src = './assets/cart.svg';
    this._wireSave(cartBtn, ref);
  }

  _initTrashBtn = (ref) => {
    const trashBtn = initTag('button', null, this.root);
    trashBtn.id = 'trash-btn';
    trashBtn.setAttribute('aria-label', 'Remove from Cart');
    const img = initTag('img', null, trashBtn);
    img.src = './assets/trash.svg';
    this._wireRemove(trashBtn, ref);
  }
  
  _wireSave = (tag, ref) => {
    tag.addEventListener('click', () => {
      sessionStorage.setItem(ref, ref);
    });
  }

  _wireRemove = (tag, ref) => {
    tag.addEventListener('click', () => {
      sessionStorage.removeItem(ref);
    });
  }
}

class StoreCard {
  constructor(parent, track) {
    this._root = initTag('section', 'store-card', parent);
    const { ref, src, alt, title, price, mp3 } = track;
    this._initImg(src, alt)
    this._initDetails(ref, title, price, mp3);
  }

  _initImg = (src, alt) => {
    const img = initTag('img', null, this._root);
    img.src = src;
    img.alt = alt;
  }

  _initDetails = (ref, title, price, mp3) => {
    const details = new DetailsView(this._root, title, price);
    details.add(new ActBarView(ref, mp3));;
  }
}

const renderStore = (tracks) => {
  const main = ref('main');
  tracks.forEach(track => {
    new StoreCard(main, track);
  });
}

window.addEventListener('load', () => {
  const tracks = [
    new Track(
      REF.BULLETPROOF, 
      './assets/images/bulletproof-cover.png',
      'Law & Order - Bulletproof - Single Cover',
      'Law & Order - Bulletproof',
      './assets/audio/law_and_order_bulletproof.mp3'
    )
  ];
  renderStore(tracks);
  //sessionStorage.clear();
});