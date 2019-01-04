import { _defaults } from './helpers.js';
import { LocalStorage } from './libs/storage.js';
import { App } from './views.js';


window.app = new App({
  selector: '#app',
  storage: 'AS_',
  _defaults: _defaults.app,
  storageClass: LocalStorage
});
