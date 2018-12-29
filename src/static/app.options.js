import * as Mustache from 'mustache';
import { _defaults, View, groupBy } from './helpers.js';


class OptionsView extends View {
  constructor(options){
    super(options);
    this.saveDelay = 50;
  }

  onLoad(data) {
    Object.assign(this.settings, data);
    this.render();
  }

  events() {
    this.$scope.querySelectorAll('.setting').forEach((item) => {
      item.addEventListener('change', this.onSettingChange.bind(this));
    });
  }

  onSettingChange(e){
    const setting = e.currentTarget;
    this.settings[setting.name] = setting.value;

    this.saveSettings();
  }
}


class EditorOptionsView extends OptionsView {
  constructor(options){
    super(options);
  }

  render(){
    const template = this.getTemplate('EditorOptionsView'),
          mode = this.settings.mode;

    this.$scope.innerHTML = Mustache.render(template, {
      modes: ace.require('ace/ext/modelist').modes,
      settings: this.settings,
      selected: function(){
        return this.name === mode ? 'selected' : '';
      }
    });

    this.events();
  }

}

class AppOptionsView extends OptionsView {
  constructor(options){
    super(options);
    this.availableThemes = this.prepareThemes();
  }

  prepareThemes(){
      let themes = groupBy(
        ace.require('ace/ext/themelist').themes,
        theme => theme.isDark ? 'Dark' : 'Bright'
      );
      var res = [];

      for(let key in themes){
        res.push({
          key: key,
          value: themes[key]
        });
      }

      return res;
  }

  render(){
    const template = this.getTemplate('AppOptionsView'),
          theme = this.settings.theme;

    this.$scope.innerHTML = Mustache.render(template, {
      themes: this.availableThemes,
      settings: this.settings,
      selected: function(){
        return this.name === theme ? 'selected' : '';
      }
    });
    this.events();
  }
}

window.app = new AppOptionsView({
  selector: '#appOptions',
  storage: 'AS_',
  _defaults: _defaults.app
});

window.editor = new EditorOptionsView({
  selector: '#editorOptions',
  storage: 'AE_',
  _defaults: _defaults.editor
});
