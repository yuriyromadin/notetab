import * as math from 'mathjs';
import * as Mustache from 'mustache';

import { _defaults, groupBy } from './helpers.js';
import { Draggable } from './libs/draggable.js';
import { Calc } from './libs/calc.js';


export class View {
  constructor(options){
    this.$scope = document.querySelector(options.selector);
    this.storageClass = options.storageClass;
    this.storage = new this.storageClass(options.storage);
    this.settings = Object.assign({}, options._defaults);
    this.timeoutId = '';
    this.saveDelay = 500;
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

  initialize(){
    this.storage.get(this.onLoad.bind(this));
  }

  onLoad() {}
}

class EditorView extends View {
  constructor(options){
    super(options);
    this.editor = ace.edit(this.$scope);
    this.appSettings = options.settings;
    this.editor.getSession().on('change', () => {this.onEditorChange(this.editor);});
    this.initialize();
  }

  onLoad(data) {
    Object.assign(this.settings, data);
    this.editor.setValue(this.settings.input, 1);
    this.updateUI();
  }

  onEditorChange(e) {
    this.settings.input = e.getValue();
    this.saveSettings();
  }

  updateUI() {
    this.editor.renderer.setOptions({
      showInvisibles: true,
      displayIndentGuides: true,
      scrollPastEnd: true,
      showPrintMargin: true,
      theme: `ace/theme/${this.appSettings.theme}`
    });

    this.editor.session.setOptions({
      mode: `ace/mode/${this.settings.mode}`,
      tabSize: this.settings.tabSize,
      wrap: true
    });
  }
}


class CalculatorView extends View {

  constructor(options){
    super(options);
    this.appSettings = options.settings;
    this.initialize();
  }

  onLoad(data) {
    const template = this.getTemplate('calculatorView');
    Object.assign(this.settings, data);

    this.$scope.innerHTML = Mustache.render(template, {
      lines: this.settings.input.trim().split('\n'),
      className: this.currentThemeClassName()
    });


    let calc = new Calc({
      data: this.settings.input
    });

    calc.on('change', this.onChange.bind(this));
  }

  onChange(data) {
    this.settings.input = data;
    this.saveSettings();
  }

  currentThemeClassName() {
    return `ace-${this.appSettings.theme.replace(new RegExp('_', 'g'), '-')}`;
  }
}


export class App extends View {
  constructor(options){
    super(options);
    this.initialize();
  }

  onLoad(data){
    const template = this.getTemplate('appView');

    Object.assign(this.settings, data);

    this.$scope.innerHTML = Mustache.render(template);
    this.gutter = new Draggable(this.$scope.querySelector('.gutter'));
    this.gutter.on('move', this.onGutterMove.bind(this));

    let editor = new EditorView({
      selector: '#editor',
      storage: 'AE_',
      storageClass: this.storageClass,
      settings: this.settings,
      _defaults: _defaults.editor
    });

    let calculator = new CalculatorView({
      selector: '#calculator',
      storage: 'CL_',
      storageClass: this.storageClass,
      settings: this.settings,
      _defaults: _defaults.calculator
    });

    this.updateUI();
  }

  onGutterMove(data){
    let left = data.left,
        right = math.round(1 - left, 2);

    this.settings.gridSize = `${left}fr ${right}fr`;
    this.settings.gutter.position = `${left * 100}%`;

    this.updateUI();
    this.saveSettings();
  }

  updateUI(){
    this.$scope.classList.add('visible');
    this.$scope.style.gridTemplateColumns = this.settings.gridSize;
    this.gutter.element.style.left = this.settings.gutter.position;
  }
}



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


export class EditorOptionsView extends OptionsView {
  constructor(options){
    super(options);
    this.initialize();
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

export class AppOptionsView extends OptionsView {
  constructor(options){
    super(options);
    this.availableThemes = this.prepareThemes();
    this.initialize();
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
