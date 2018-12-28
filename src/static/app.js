import * as math from 'mathjs';
import * as Mustache from 'mustache';

import { _defaults, View } from './helpers.js';
import { Draggable } from './libs/draggable.js';
import { Calc } from './libs/calc.js';


class EditorView extends View {
  constructor(options){
    super(options);
    this.editor = ace.edit(this.$scope);
    this.appSettings = options.settings;
    this.editor.getSession().on('change', () => {this.onEditorChange(this.editor);});
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


class App extends View {
  constructor(options){
    super(options);
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
      settings: this.settings,
      _defaults: _defaults.editor
    });

    let calculator = new CalculatorView({
      selector: '#calculator',
      storage: 'CL_',
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

window.app = new App({
  selector: '#app',
  storage: 'AS_',
  _defaults: _defaults.app
});
