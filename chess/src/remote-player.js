import Player from './model/chess/player.js'

export default class extends Player {
  constructor(gameDocRef, id, color, name) {
    super(id, color, name)
    // Should be set from outside after game instanse will be created
    this.board = null
    this.resolveMove = null
    this.resolveInterruption = null
    this.listenRemotePlayerMove(gameDocRef)
    this.listenRemotePlayerInterruption(gameDocRef)
  }

  async move() {
    return new Promise(resolve => {
      this.resolveMove = resolve
    })
  }

  listenRemotePlayerMove(gameDocRef) {
    // Listen for 'moves' collection changes in game document.
    // When new move is appeared then check if it's correspond
    // to the remote player. And if yes then reflect this move.
    gameDocRef.collection('moves')
      .orderBy('timestamp')
      .onSnapshot(movesSnapshot => {
        if (movesSnapshot.size === 0)
          return

        const lastMoveDoc = movesSnapshot.docs[movesSnapshot.size - 1]
        const lastMoveDocData = lastMoveDoc.data()
        if (lastMoveDocData.plrId === this.id) {
          // Remote player did a move.
          if (this.resolveMove != null) {
            const move = this.restoreMove(lastMoveDocData.move)
            this.resolveMove(move)
            this.resolveMove = null
          }
        }
      })
  }

  restoreMove(str){
    const remoteMove = JSON.parse(str)
    const move = {
      from: {x: 7 - remoteMove.from.x, y: 7 - remoteMove.from.y},
      to: {x: 7 - remoteMove.to.x, y: 7 - remoteMove.to.y}
    }
    const cell = this.board.cell(move.from.x,  move.from.y)
    move.piece = cell.pieces.length > 0 ? cell.pieces[0] : null
    return move
  }

  async interrupt(){
    return new Promise(resolve => {
      this.resolveInterruption = resolve
    })
  }

  listenRemotePlayerInterruption(gameDocRef) {
    // Listen for 'interruptions' collection changes in game document.
    gameDocRef.collection('interruptions')
      .orderBy('timestamp')
      .onSnapshot(snapshot => {

        // Take last interruption which correspond to remote player.
        for(let i = snapshot.docs.length - 1; i >= 0; i--){
          const docData = snapshot.docs[i].data()
          if (docData.plrId === this.id){
            const inter = JSON.parse(docData.interruption)
            if (this.resolveInterruption != null){
              this.resolveInterruption(inter)
              this.resolveInterruption = null
            }
            break
          }
        }
      })
  }
}
