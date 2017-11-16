import UIPlayer from './ui-player'
import Chess from './model/chess/game'

export default class {
  constructor(uiVm){
    this.uiVm = uiVm
    this.lastFirstPlrColor = 'black'
  }

  create(){
    const plrColors = this.getPlayerColors()
    const plr1 = this.createPlayer(1, plrColors[0])
    const plr2 = this.createPlayer(2, plrColors[1])
    return new Chess(plr1, plr2)
  }

  createPlayer(id, color) {
    return new UIPlayer(this.uiVm, id, color, color)
  }

  getPlayerColors() {
    this.lastFirstPlrColor = this.lastFirstPlrColor === 'white' ? 'black' : 'white'
    const  secondPlrColor = this.lastFirstPlrColor === 'white' ? 'black' : 'white'
    return [this.lastFirstPlrColor, secondPlrColor]
  }
}
