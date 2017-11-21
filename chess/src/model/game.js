import Event from '../utils/event'

export default class {
  constructor(plrs, options = null) {
    this.plrs = plrs
    this.options = options || {}
    this.plrsQueue = [...plrs]
    this.stopPending = false
    this.log = []
    this.gameResult = null

    this.playerOnTurnEvent = new Event()
    this.lastMoveUndoneEvent = new Event()
    this.moveDoneEvent = new Event()
    this.moveAcceptedEvent = new Event()
    this.moveRejectedEvent = new Event()
    this.gameEndedEvent = new Event()
  }

  async listenForInterruption(){
    // A player can interrupt the game for example by resigning of offering a draw.
    // Listen for the interruption and react.
    while(!this.isEnded){
      const interruptions = this.plrsQueue.map(plr =>
        plr.interrupt().then(interruption => {return {plr, interruption}}))
      const {plr, interruption} = await Promise.race(interruptions)
      this.handleInterruption(plr, interruption)
    }
  }

  handleInterruption(){
  }

  async run() {
    this.listenForInterruption()

    while (this.plrsQueue.length > 0) {
      const plr = this.plrsQueue.shift()
      this.playerOnTurnEvent.emit(plr)
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
          this.lastMoveUndoneEvent.emit(logEntry.plr, logEntry.move)
        } else {
          // If log is empty, that is no moves was done,
          // then just let current player move again.
          this.plrsQueue.unshift(plr)
        }
        continue
      }

      this.moveDoneEvent.emit(move)

      const isValidMove = this.validateMove(plr, move)
      if (isValidMove) {
        this.commitMove(plr, move)
        // Put current player to the queue end.
        this.plrsQueue.push(plr)
        this.moveAcceptedEvent.emit(plr, move)
      }
      else {
        // Put player to the queue begin to let him make a move again.
        this.plrsQueue.unshift(plr)
        this.moveRejectedEvent.emit(plr, move)
      }

      const gameResult = this.getGameResult(plr, move)
      if (gameResult != null) {
        this.endGame(gameResult)
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

  get isEnded(){
    return this.gameResult != null
  }

  endGame(gameResult){
    // Check if game was not ended before.
    if (this.gameResult != null)
      return

    this.gameResult = gameResult
    this.plrsQueue = []
    this.gameEndedEvent.emit(this.gameResult)
  }
}
