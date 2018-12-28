import * as Mustache from 'mustache';
import { _defaults, View } from './helpers.js';


class AppOptionsView extends View {
    constructor(options){
      super(options);
    }

    onLoad(data) {
      Object.assign(this.settings, data);
      this.render();
    }

    render(){
      const template = this.getTemplate('optionsView');
      this.$scope.innerHTML = Mustache.render(template, {
        themes: [],
        settings: this.settings
      });
    }
}

window.app = new AppOptionsView({
  selector: '#app',
  storage: 'AS_',
  _defaults: _defaults.app
});
