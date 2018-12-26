export class Observable {
  constructor(){
    this.subscribers = {};
  }

  on(event, callback) {
    this.subscribers[event] = this.subscribers[event] || [];
    this.subscribers[event].push(callback);

    return this;
  }

  dispatch(event, data) {
    let events = this.subscribers[event] || [];

    for(let i=0; i<events.length; i++){
      events[i](data);
    }
  }
}
