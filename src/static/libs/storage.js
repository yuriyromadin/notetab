export class LocalStorage {
  constructor(prefix='BS_'){
    this.prefix = `notetab.${prefix}`;
  }

  set(obj, callback) {
    let value = JSON.stringify(obj);

    localStorage.setItem(this.prefix, value);
    if(typeof callback === 'function'){
      callback();
    }
  }

  get(callback) {
    let value = localStorage.getItem(this.prefix);

    if(value){
      try{
        value = JSON.parse(value);
      } catch(e) {
        throw new Error('LocalStorage is corrupted');
      }
    } else {
      value = {};
    }

    callback(value);
  }
}

export class ChromeStorage {
    constructor(prefix='BS_'){
      this.prefix = prefix;
      this.maxBytesPerItem = 4086;
      this.maxBytes = this.maxBytesPerItem * 512;
      this.itemCount = 0;

      chrome.storage.sync.get(null, this.onLoad.bind(this));
    }

    onLoad(items){
      for(let key in items){
        if(key.startsWith(this.prefix)){
          this.itemCount++;
        }
      }
    }

    set(obj, callback) {
      let value = JSON.stringify(obj),
          parts = Math.ceil(value.length / this.maxBytesPerItem),
          cache = {};

      if(value.length >= this.maxBytes){
        throw new Error('Value is to big for Chrome storage');
      }

      for(let i=0; i < parts; i++){
        cache[this.prefix + i] = value.substr(0, this.maxBytesPerItem);
        value = value.substr(this.maxBytesPerItem);
      }

      chrome.storage.sync.set(cache, callback);

      if(parts < this.itemCount){
        for(let i = parts; i < this.itemCount; i++){
          chrome.storage.sync.remove(this.prefix + i);
        }
      }
      this.itemCount = parts;
    }

    onGet(items, callback){
      let value = '';

      for(let key in items){
        if(key.startsWith(this.prefix)){
          value += items[key];
        }
      }

      if(value){
        try{
          value = JSON.parse(value);
        } catch(e) {
          throw new Error('Chrome storage is corrupted');
        }
      } else {
        value = {};
      }

      callback(value);

    }

    get(callback){
      chrome.storage.sync.get(null, (items) => { this.onGet(items, callback); });
    }
}
