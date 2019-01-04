import { _defaults } from './helpers.js';
import { ChromeStorage } from './libs/storage.js';
import { AppOptionsView, EditorOptionsView } from './views.js';

window.app = new AppOptionsView({
  selector: '#appOptions',
  storage: 'AS_',
  storageClass: ChromeStorage,
  _defaults: _defaults.app
});

window.editor = new EditorOptionsView({
  selector: '#editorOptions',
  storage: 'AE_',
  storageClass: ChromeStorage,
  _defaults: _defaults.editor
});
