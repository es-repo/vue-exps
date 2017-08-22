const wait = ms => new Promise(r => setTimeout(r, ms))

export class Player {
  constructor(id) {
    this.id = id
  }

  async move() {
  }
}

export class HumanPlayer extends Player {
  constructor(id) {
    super(id)
    this.resolveMove = () => { }
  }

  async move() {
    return await new Promise(r => {
      this.resolveMove = r
    })
  }

  userInput(v) {
    this.resolveMove(v)
  }
}

export class BotPlayer extends Player {
  constructor(id, level = 0, delay = 0){
    super(id)
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

export class Board {
  constructor(size) {
    this.size = size
    this.cells = new Array(size * size)
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = []
    }

    this.log = []
  }

  addPiece(p, x, y) {
    this.cell(x, y).push(p)
    this.log.push({ a: 'add', p, x, y })
  }

  removePiece(p, x, y) {
    const c = this.cell(x, y)
    const i = c.indexOf(p)
    if (p >= 0) {
      c.splice(i, 1)
      this.log.push({ a: 'remove', p, x, y })
    }
  }

  hasPiece(p, x, y){
    const pp = this.cell(x, y)
    return pp.find(v => v == p) != undefined
  }

  cell(x, y) {
    return this.cells[y * this.size + x]
  }

  isCellEmpty(x, y) {
    return this.cell(x, y).length == 0
  }

  isFull() {
    return !this.cells.find(c => c.length == 0)
  }

  *traverseTo(sx, sy, dx, dy, l) {
    for (let k = 0; k < l; k++) {
      const x = sx + k * dx
      const y = sy + k * dy

      const outBorders = x < 0 || y < 0 ||
        x == this.size || y == this.size

      if (outBorders)
        break

      yield { x, y, p: this.cell(x, y) }
    }
  }
}

export default class Game {
  constructor(plrs) {
    this.plrs = plrs
    this.queue = [...plrs]
    this.gameResult = null
    this.stopPending = false
  }

  *playersQueue() {
    while (this.queue.length > 0) {
      yield this.queue.shift()
    }
  }

  acceptMove(p, m) {
    const v = this.validateMove(p, m)
    if (v) {
      this.commitMove(p, m)
      this.gameResult = this.isGameEnd(p, m)
      this.queue.push(p)
    }
    else {
      this.queue.unshift(p)
    }

    return v
  }

  validateMove() {
    return true
  }

  commitMove() {
  }

  isGameEnd() {
    return { draw: true }
  }

  async run(hooks) {
    hooks = Object.assign(defaultHooks(), hooks || {})
    bindHooks(hooks)

    for (const p of this.playersQueue()) {
      hooks.playerOnTurn(p)

      const m = await p.move()
      if (this.stopPending)
        return

      hooks.move(m)

      const a = this.acceptMove(p, m)
      if (a) {
        hooks.moveAccepted(p, m)

        const gameRslt = this.isGameEnd(p)
        if (gameRslt != null) {
          this.queue = []
          hooks.gameEnded(gameRslt)
          return gameRslt
        }
      }
      else {
        hooks.moveRejected(p, m)
      }
    }
    return null
  }

  stop(){
    this.stopPending = true
  }
}

function defaultHooks() {
  const nop = function () { }
  return {
    playerOnTurn: nop,
    move: nop,
    moveAccepted: nop,
    moveRejected: nop,
    gameEnded: nop
  }
}

function bindHooks(hooks){
  if (hooks.bindTo == null)
    return

  const defHooks = defaultHooks()
  for(const f in defHooks){
    if (hooks[f] instanceof Function)
      hooks[f] = hooks[f].bind(hooks.bindTo)
  }
}

