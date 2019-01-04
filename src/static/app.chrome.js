import { _defaults } from './helpers.js';
import { ChromeStorage } from './libs/storage.js';
import { App } from './views.js';


window.app = new App({
  selector: '#app',
  storage: 'AS_',
  _defaults: _defaults.app,
  storageClass: ChromeStorage
});
