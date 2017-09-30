export default class {

  constructor(){
    this.listeners = []
  }

  on(listener, callOn){
    this.listeners.push({listener, callOn})
  }

  off(listener){
    for(let i = 0; i < this.listeners; i++){
      if (this.listeners[i].listener === listener){
        this.listeners.splice(i, 1)
        break
      }
    }
  }

  emit(){
    for(const l of this.listeners){
      l.listener.apply(l.callOn, arguments)
    }
  }
}
