import * as Mustache from 'mustache';
import { _defaults, View } from './helpers.js';
import { BlockStorage } from './libs/storage.js';


class OptionsView extends View {
    constructor(options){
      super(options);
      this.editorSettings = new BlockStorage(options.editorStorage);
    }

    onLoad(data) {
      Object.assign(this.settings, data);
      this.editorSettings.get(this.render.bind(this));
    }

    render(){
      const template = this.getTemplate('optionsView');

      this.$scope.innerHTML = Mustache.render(template, {
        themes: [],
        settings: this.settings
      });
    }
}

window.app = new OptionsView({
  selector: '#app',
  storage: 'AS_',
  editorStorage: 'AE_',
  _defaults: _defaults.app
});
