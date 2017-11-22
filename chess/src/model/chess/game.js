import Game from '../game'
import Board from './board'
import * as Pieces from './pieces'
import PieceMovementRules from './piece-move-rules'
import deepEqual from 'deep-equal'
import compact from 'lodash/compact'

export default class extends Game {
  constructor(plr1, plr2) {
    super(compact([plr1, plr2]))
    // Put white player at first position in player queue.
    if (plr2 != null && plr2.color === 'white') {
      this.plrsQueue = [plr2, plr1]
    }

    this.board = new Board(plr1 != null && plr1.color === 'black')
    PieceMovementRules.apply()
    this.nextPieceId = this.constructor.arrangePieces(this.board, plr1, plr2)
  }

  static arrangePieces(board, plr1, plr2) {
    const color1 = plr1 != null ? plr1.color : null
    const color2 = plr2 != null ? plr2.color : null
    let id = 0
    for (let x = 0; x < 8; x++) {
      if (color2)
        board.addPiece(x, 1, new Pieces.Pawn(id++, color2, 1))
      if (color1)
        board.addPiece(x, 6, new Pieces.Pawn(id++, color1, -1))
    }

    for (let y = 0; y < 8; y += 7) {
      const color = y == 0 ? color2 : color1
      if (color) {
        board.addPiece(0, y, new Pieces.Rook(id++, color))
        board.addPiece(1, y, new Pieces.Knight(id++, color))
        board.addPiece(2, y, new Pieces.Bishop(id++, color))
        board.addPiece(plr1.color === 'white' ? 3 : 4, y, new Pieces.Queen(id++, color))
        board.addPiece(plr1.color === 'white' ? 4 : 3, y, new Pieces.King(id++, color))
        board.addPiece(5, y, new Pieces.Bishop(id++, color))
        board.addPiece(6, y, new Pieces.Knight(id++, color))
        board.addPiece(7, y, new Pieces.Rook(id++, color))
      }
    }
    return id
  }

  handleInterruption(plr, interruption) {
    switch (interruption.type) {
    case 'resignation': {
      const oppPlr = this.opponentPlayer(plr)
      this.endGame({ winPlr: oppPlr, reason: 'resignation' })
      break
    }
    }
  }

  validateMove(plr, move) {
    const baseVaildRes = super.validateMove(plr, move)
    if (!baseVaildRes)
      return baseVaildRes

    const fromCell = this.board.cell(move.from.x, move.from.y)
    const toCell = this.board.cell(move.to.x, move.to.y)

    if (fromCell == null ||
      toCell == null ||
      move.piece == null ||
      move.piece.color !== plr.color) {
      return false
    }

    for (const vm of this.getValidMoves(plr, move.piece, move.from)) {
      if (deepEqual(vm.to, move.to)) {
        if (vm.castling == null || this.isCastlingPossible(plr, vm)) {
          Object.assign(move, vm)
          return true
        }
      }
    }
    return false
  }

  commitMove(plr, move) {
    if (move.capture != null) {
      for (const p of move.capture.pieces) {
        this.board.removePiece(p, move.capture.cell.x, move.capture.cell.y)
      }
    }
    if (move.promotion != null) {
      this.board.removePiece(move.piece, move.from.x, move.from.y)
      move.promotion.newPiece = new Pieces.Queen(this.nextPieceId++, move.piece.color)
      this.board.cell(move.to.x, move.to.y).pieces.push(move.promotion.newPiece)
    }
    else {
      this.board.movePiece(move.piece, move.from.x, move.from.y, move.to.x, move.to.y)
      if (move.castling != null) {
        this.board.movePiece(move.castling.piece, move.castling.from.x, move.castling.from.y, move.castling.to.x, move.castling.to.y)
      }
    }
    move.piece.moveCount++
    super.commitMove(plr, move)
  }

  * getValidMoves(plr, piece, from) {
    if (piece == null || piece.color != plr.color)
      return

    for (const m of piece.getValidMoves(from, this.board, this.log)) {
      if (!this.willKingBeInCheck(plr, Object.assign(m, { from, piece })))
        yield m
    }
  }

  isKingInCheck(plr) {
    const king = this.board.findKing(plr.color)
    return this.isCellUnderAttack(plr, king)
  }

  isKingCheckmated(plr) {
    return this.isKingInCheck(plr) && !this.playerCanDoAtLeastOneMove(plr)
  }

  isStalemate(plr) {
    return !this.isKingInCheck(plr) && !this.playerCanDoAtLeastOneMove(plr)
  }

  playerCanDoAtLeastOneMove(plr) {
    const pieces = this.board.findPiecesOfColor(plr.color)
    for (const p of pieces) {
      const gv = this.getValidMoves(plr, p.piece, p).next()
      if (!gv.done) {
        return true
      }
    }
    return false
  }

  isCellUnderAttack(plr, cell) {
    const oppColor = invColor(plr.color)
    const oppPieces = this.board.findPiecesOfColor(oppColor)
    for (const p of oppPieces) {
      if (p.piece.canAttack(p, cell, this.board, this.log)) {
        return true
      }
    }
    return false
  }

  willKingBeInCheck(plr, move) {
    this.commitMove(plr, move)
    const r = this.isKingInCheck(plr)
    this.undoLastMove()
    return r
  }

  isCastlingPossible(plr, castlingMove) {
    if (this.isKingInCheck(plr))
      return false
    // Check if king does not pass through attacked cell.
    const dir = castlingMove.from.x < castlingMove.to.x ? 1 : -1
    const cell = { x: castlingMove.from.x + dir, y: castlingMove.from.y }
    return !this.isCellUnderAttack(plr, cell)
  }

  undoLastMove() {
    const logEntry = super.undoLastMove()
    if (!logEntry)
      return

    const move = logEntry.move

    if (move.capture != null) {
      const pieces = this.board.cell(move.capture.cell.x, move.capture.cell.y).pieces
      pieces.push.apply(pieces, move.capture.pieces)
    }

    if (move.promotion != null) {
      this.board.removePiece(move.promotion.newPiece, move.to.x, move.to.y)
      this.board.cell(move.from.x, move.from.y).pieces.push(move.piece)
    }
    else {
      this.board.movePiece(move.piece, move.to.x, move.to.y, move.from.x, move.from.y)
      if (move.castling != null) {
        this.board.movePiece(move.castling.piece, move.castling.to.x, move.castling.to.y, move.castling.from.x, move.castling.from.y)
      }
    }

    move.piece.moveCount--
    return logEntry
  }

  getGameResult(plr) {
    const oppPlr = this.opponentPlayer(plr)
    if (this.isKingCheckmated(oppPlr)) {
      return { winPlr: plr }
    }
    if (this.isStalemate(oppPlr)) {
      return { draw: true, reason: 'stalemate' }
    }
    if (this.isInsufficientMaterial()) {
      return { draw: true }
    }
    return null
  }

  isInsufficientMaterial() {
    const hasOnlyKing = pp => pp.length === 1 && pp[0].piece.type === 'king'

    const hasOnlyKingAndBishop = pp => pp.length === 2
      && pp.some(p => p.piece.type === 'king')
      && pp.some(p => p.piece.type === 'bishop')

    const hasOnlyKingAndKnight = pp => pp.length === 2
      && pp.some(p => p.piece.type === 'king')
      && pp.some(p => p.piece.type === 'knight')

    const bishopCellColor = pp => {
      const bishop = pp.find(p => p.piece.type === 'bishop')
      return this.board.cell(bishop.x, bishop.y).color
    }

    const white = [...this.board.findPiecesOfColor('white')]
    const black = [...this.board.findPiecesOfColor('black')]

    return (hasOnlyKing(white) && hasOnlyKing(black)) ||
      (hasOnlyKing(white) && hasOnlyKingAndBishop(black)) ||
      (hasOnlyKing(white) && hasOnlyKingAndKnight(black)) ||
      (hasOnlyKing(black) && hasOnlyKingAndBishop(white)) ||
      (hasOnlyKing(black) && hasOnlyKingAndKnight(white)) ||
      (hasOnlyKingAndBishop(white) && hasOnlyKingAndBishop(black) && bishopCellColor(white) === bishopCellColor(black))
  }

  opponentPlayer(plr) {
    return this.plrs[0] === plr ? this.plrs[1] : this.plrs[0]
  }
}

function invColor(color) {
  return color === 'white'
    ? 'black'
    : 'white'
}
