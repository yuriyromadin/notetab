import { _defaults } from './helpers.js';
import { LocalStorage } from './libs/storage.js';
import { AppOptionsView, EditorOptionsView } from './views.js';

window.app = new AppOptionsView({
  selector: '#appOptions',
  storage: 'AS_',
  storageClass: LocalStorage,
  _defaults: _defaults.app
});

window.editor = new EditorOptionsView({
  selector: '#editorOptions',
  storage: 'AE_',
  storageClass: LocalStorage,
  _defaults: _defaults.editor
});
