import * as math from 'mathjs';
import { Observable } from './observable.js';

export class Draggable extends Observable {
  constructor(element){
    super();

    this.element = element;
    this.element.addEventListener('mousedown', this.onMouseDown.bind(this));

    this.onMouseMove = this._onMouseMove.bind(this);
    this.onMouseUp = this._onMouseUp.bind(this);

    this.updateWindowWidth();
  }

  updateWindowWidth() {
    this.windowWidth = document.documentElement.clientWidth;
    this.windowHeight = document.documentElement.clientHeight;
  }

  _onMouseMove(e){
    let left = math.round(e.clientX / this.windowWidth, 2),
        top = math.round(e.clientY / this.windowHeight, 2);

    this.dispatch('move', {left: left, top: top});
  }

  _onMouseUp(){
    document.body.removeEventListener('mousemove', this.onMouseMove);
    document.body.removeEventListener('mouseup', this.onMouseUp);
    this.element.classList.remove('drag-start');
    this.dispatch('stop');
  }

  onMouseDown(){
    document.body.addEventListener('mousemove', this.onMouseMove);
    document.body.addEventListener('mouseup', this.onMouseUp);
    this.element.classList.add('drag-start');
    this.dispatch('start');
    this.updateWindowWidth();
  }
}
