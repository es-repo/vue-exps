import deepEqual from 'deep-equal'
import Event from './utils/event'
import Player from './model/chess/player'

export default class extends Player {
  constructor(uiVm, id, color, name) {
    super(id, color, name)
    this.pieceSelectedEvent = new Event()
    this.selectedPiece = null
    this.resolveMove = null
    this.resolveInterrupt = null
    this.moving = false
    this.uiVm - uiVm

    this.onPieceClickedHandler = this.onPieceClicked.bind(this)
    uiVm.$refs.board.$on('piece-clicked', this.onPieceClickedHandler)

    this.onCellClickedHandler = this.onCellClicked.bind(this)
    uiVm.$refs.board.$on('cell-clicked', this.onCellClickedHandler)

    this.onUndoClicklHandler = this.finishWithUndoLastMove.bind(this)
    uiVm.$on('undo-click', this.onUndoClicklHandler)

    this.onResignClickHandler = this.onResignClicked.bind(this)
    uiVm.$on('resign-click', this.onResignClickHandler)
  }

  async move() {
    this.moving = true
    return new Promise(resolve => {
      this.resolveMove = resolve
    })
  }

  onPieceClicked(piece, from) {
    if (!this.moving)
      return

    if (this.selectedPiece === null || piece.color === this.color) {
      this.selectedPiece = { piece, from }
      this.pieceSelectedEvent.emit(piece, from)
    }
    else {
      this.finishNormalMove(from)
    }
  }

  onCellClicked(to) {
    if (!this.moving)
      return

    if (this.selectedPiece === null || deepEqual(this.selectedPiece.from, to))
      return

    this.finishNormalMove(to)
  }

  finishNormalMove(to) {
    this.finishMove({
      piece: this.selectedPiece.piece,
      from: this.selectedPiece.from,
      to
    })
  }

  finishWithUndoLastMove() {
    this.finishMove({
      undoLastOpponentMove: true
    })
  }

  finishMove(move) {
    if (this.resolveMove != null) {
      this.resolveMove(move)
    }
    this.moving = false
    this.resolveMove = null
    this.selectedPiece = null
  }

  detach() {
    this.uiVm.$refs.board.$off('piece-clicked', this.onPieceClickedHandler)
    this.uiVm.$refs.board.$off('cell-clicked', this.onCellClickedHandler)
    this.uiVm.$refs.board.$off('resign-clicked', this.onResignClickHandler)
    this.uiVm.$off('undo-click', this.onUndoClicklHandler)
  }

  async interrupt(){
    return new Promise(resolve => {
      this.resolveInterrupt = resolve
    })
  }

  onResignClicked(){
    if (this.resolveInterrupt != null){
      this.resolveInterrupt({type: 'resignation'})
      this.resolveInterrupt = null
    }
  }
}
