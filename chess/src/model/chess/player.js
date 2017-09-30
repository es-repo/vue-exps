import Player from '../player'

export default class extends Player{
  constructor(id, color, name){
    super(id, name)
    this.color = color
  }
}
