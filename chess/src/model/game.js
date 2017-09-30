export default class {
  constructor(plrs) {
    this.plrs = plrs
    this.plrsQueue = [...plrs]
    this.stopPending = false
    this.log = []
  }

  async run(hooks) {
    hooks = Object.assign(defaultHooks(), hooks || {})
    bindHooks(hooks)

    while (this.plrsQueue.length > 0) {
      const plr = this.plrsQueue.shift()

      hooks.playerOnTurn(plr)

      const move = await plr.move()
      if (this.stopPending)
        return

      // Allow current player to undo last opponent move.
      // Opponent will make next again move.
      if (move.undoLastOpponentMove) {
        const logEntry = this.undoLastMove()
        if (logEntry) {
          // Put current player to the queue end.
          this.plrsQueue.push(plr)
          hooks.lastMoveUndone(logEntry.plr, logEntry.move)
        } else {
          // If log is empty, that is no moves was done,
          // then just let current player move again.
          this.plrsQueue.unshift(plr)
        }
        continue
      }

      hooks.moveDone(move)

      const isValidMove = this.validateMove(plr, move)
      if (isValidMove) {
        this.commitMove(plr, move)
        // Put current player to the queue end.
        this.plrsQueue.push(plr)
        hooks.moveAccepted(plr, move)
      }
      else {
        // Put player to the queue begin to let him make a move again.
        this.plrsQueue.unshift(plr)
        hooks.moveRejected(plr, move)
      }

      const gameResult = this.getGameResult(plr, move)
      if (gameResult != null && gameResult.isGameEnd) {
        this.plrsQueue = []
        hooks.gameEnded(gameResult)
      }
    }
  }

  validateMove() {
    return true
  }

  commitMove(plr, move) {
    this.log.push({ plr, move })
  }

  undoLastMove() {
    return this.log.pop()
  }

  getGameResult() {
    return null
  }

  stop() {
    this.stopPending = true
  }
}

function defaultHooks() {
  const nop = function () { }
  return {
    playerOnTurn: nop,
    moveDone: nop,
    moveAccepted: nop,
    moveRejected: nop,
    gameEnded: nop,
    lastMoveUndone: nop
  }
}

function bindHooks(hooks) {
  if (hooks.bindTo == null)
    return

  const defHooks = defaultHooks()
  for (const f in defHooks) {
    if (hooks[f] instanceof Function)
      hooks[f] = hooks[f].bind(hooks.bindTo)
  }
}
