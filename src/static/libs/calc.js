import * as math from 'mathjs'
import { Observable } from './observable.js'

math.config({number: 'BigNumber'});

export class Calc extends Observable {

  constructor(settings) {
    super()
    this.defaults = {
      scope: '.calculator',
      input: '.input',
      output: '.output',
      data: '',
      inputDelay: 100,
    };

    this.settings = Object.assign({}, this.defaults, settings);
    this.scope = document.querySelector(this.settings.scope);
    this.input = this.scope.querySelector(this.settings.input);
    this.output = this.scope.querySelector(this.settings.output);
    this.parser = math.parser();
    this.timeoutId = '';
    this.initializeEvents();
    this.calculate();
  }

  initializeEvents(){
    this.input.addEventListener('input', this.onInput.bind(this));
    this.input.addEventListener('paste', this.onPaste.bind(this));
    this.output.addEventListener('click', this.onOutputClick);
  }

  calculate(){
    let lines = this.input.children,
        html = '';

    if(!~this.input.innerHTML.indexOf('div')){
      this.input.innerHTML = '<div></div>';
    }

    for(let i=0; i<lines.length; i++){
        let line = lines[i],
            expression = line.textContent.replace(/^\s+|\s+$/g, ''),
            out = document.createElement('div'),
            outInner = document.createElement('span'),
            className = 'result', result;

        try{
          result = this.parser.eval(expression);
        } catch(e){ console.log(e) }

        if (!result) {
          result = '';
          className += ' empty';
        } else {
          this.parser.scope.prev = result;
        }

        result = result.toString();

        html += `
          <div style="top: ${line.offsetTop}px">
            <span class="${className}" title="${result}">${result}</span>
          </div>
        `;
    }

    this.output.innerHTML = html;
    this.parser.clear();
    this.onChange();
  }

  onInput(){
    window.clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(this.calculate.bind(this), this.settings.inputDelay);
  }

  onChange(){
    this.settings.data = this.input.innerText;
    this.dispatch('change', this.settings.data);
  }

  onPaste(e){
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
  }

  onOutputClick (e){
    if(!e.target.classList.contains('result')){
      return;
    }

    const selection = window.getSelection(),
          range = document.createRange();

    range.selectNodeContents(e.target);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  }
}
