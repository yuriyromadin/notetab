import { BlockStorage } from './libs/storage.js';

export class View {
  constructor(options){
    this.$scope = document.querySelector(options.selector);
    this.storage = new BlockStorage(options.storage);
    this.settings = Object.assign({}, options._defaults);
    this.timeoutId = '';
    this.saveDelay = 500;
    this.storage.get(this.onLoad.bind(this));
  }

  saveSettings(){
    window.clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => {
      this.storage.set(this.settings);
      console.log('saving...', this.storage.prefix);
    }, this.saveDelay);
  }

  getTemplate(id){
    return document.getElementById(id).innerText;
  }

  onLoad() {}
}

export const _defaults = {
  app: {
    gridSize: '0.5fr 0.5fr',
    gutter: {
      position: '50%'
    },
    theme: 'xcode',
    version: '1.0.0'
  },
  editor: {
    mode: 'text',
    tabSize: 2,
    input: 'Start writing something awesome....\n'
  },
  calculator: {
    input: '1 + 2 / 2'
  }
};

export const groupBy = (arr, keyGetter) => {
  return arr.reduce((acc, item) => {
    const key = keyGetter(item);

    if(!(key in acc)){
      acc[key] = [];
    }
    acc[key].push(item);

    return acc;
  }, {});
};
