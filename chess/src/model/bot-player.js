import wait from './utils/wait'
import Player from './player'

export default class extends Player {
  constructor(id, level = 0, delay = 0){
    super(id, 'bot')
    this.delay = delay
    this.level = level
  }

  async move(){
    if (this.delay)
      await wait(this.delay)
    return await this.moveInternal()
  }

  async moveInternal(){
  }
}
