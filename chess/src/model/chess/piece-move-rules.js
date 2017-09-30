import * as Pieces from './pieces'

export default {
  apply() {
    Object.assign(Pieces.Piece.prototype, { canAttack })
    Object.assign(Pieces.Pawn.prototype, getPawnExtentions())
    Object.assign(Pieces.Rook.prototype, getRookExtentions())
    Object.assign(Pieces.Bishop.prototype, getBishopExtentions())
    Object.assign(Pieces.Queen.prototype, getQueenExtentions())
    Object.assign(Pieces.Knight.prototype, getKnightExtentions())
    Object.assign(Pieces.King.prototype, getKingExtentions())
  }
}

function getPawnExtentions() {

  function assignPromotion(move, board) {
    if (move.to.y === board.size - 1 || move.to.y === 0) {
      return Object.assign(move, { promotion: {} })
    }
    return move
  }

  function* getDirectMoves(from, board) {
    const oneY = from.y + this.direction
    if (oneY >= 0 && oneY < board.size)
      yield { x: from.x, y: oneY }

    const isFirstMove = this.direction > 0 ? from.y === 1 : from.y === 6
    if (isFirstMove) {
      yield { x: from.x, y: from.y + this.direction * 2 }
    }
  }

  function* getDirectValidMoves(from, board) {
    for (const to of getDirectMoves.call(this, from, board)) {
      if (board.isInBorders(to.x, to.y) && board.isCellEmpty(to.x, to.y)) {
        yield assignPromotion({ to }, board)
      }
      else break
    }
  }

  function* getDiagonalMoves(from, board) {
    if (from.x - 1 >= 0) {
      yield { x: from.x - 1, y: from.y + this.direction }
    }
    if (from.x + 1 < board.size) {
      yield { x: from.x + 1, y: from.y + this.direction }
    }
  }

  function* getDiagonalCapturing(from, board) {
    const invColor = getInvColor(this.color)
    for (const to of getDiagonalMoves.call(this, from, board)) {
      const cell = board.cell(to.x, to.y)
      if (cell.pieces.length > 0 && cell.pieces[0].color === invColor) {
        yield assignPromotion({
          to,
          capture: { cell: to, pieces: [...cell.pieces] }
        }, board)
      }
    }
  }

  function* getEnPassantCapturing(from, board, log) {
    const last_opponent_move = log.length > 0
      ? log[log.length - 1].move
      : null

    if (last_opponent_move === null)
      return

    const is_opponent_two_cells_pawn_advancing =
      last_opponent_move.piece.type === 'pawn' &&
      Math.abs(last_opponent_move.from.y - last_opponent_move.to.y) === 2

    if (!is_opponent_two_cells_pawn_advancing)
      return

    const near_opponent_pawn = Math.abs(from.x - last_opponent_move.to.x) === 1 &&
      from.y === last_opponent_move.to.y

    if (!near_opponent_pawn)
      return

    yield {
      to: { x: last_opponent_move.to.x, y: from.y + this.direction },
      capture: { cell: last_opponent_move.to, pieces: [last_opponent_move.piece] }
    }
  }

  return {
    getValidMoves: function* (from, board, log) {
      yield* getDirectValidMoves.call(this, from, board)
      yield* getDiagonalCapturing.call(this, from, board)
      yield* getEnPassantCapturing.call(this, from, board, log)
    },
    canAttack(from, to, board) {
      for (const m of getDiagonalMoves.call(this, from, board)) {
        if (m.x === to.x && m.y === to.y) {
          return true
        }
      }
      return false
    }
  }
}

function getRookExtentions() {
  return {
    getValidMoves: function* (from, board) {
      yield* getValidMoves(this.color, board, board.traverse.bind(board, from.x, from.y + 1, 0, 1, 8))
      yield* getValidMoves(this.color, board, board.traverse.bind(board, from.x, from.y - 1, 0, -1, 8))
      yield* getValidMoves(this.color, board, board.traverse.bind(board, from.x + 1, from.y, 1, 0, 8))
      yield* getValidMoves(this.color, board, board.traverse.bind(board, from.x - 1, from.y, -1, 0, 8))
    }
  }
}

function getBishopExtentions() {
  return {
    getValidMoves: function* (from, board) {
      yield* getValidMoves(this.color, board, board.traverse.bind(board, from.x + 1, from.y + 1, 1, 1, 8))
      yield* getValidMoves(this.color, board, board.traverse.bind(board, from.x + 1, from.y - 1, 1, -1, 8))
      yield* getValidMoves(this.color, board, board.traverse.bind(board, from.x - 1, from.y + 1, -1, 1, 8))
      yield* getValidMoves(this.color, board, board.traverse.bind(board, from.x - 1, from.y - 1, -1, -1, 8))
    }
  }
}

function getQueenExtentions() {
  return {
    getValidMoves: function* (from, board) {
      yield* Pieces.Rook.prototype.getValidMoves.call(this, from, board)
      yield* Pieces.Bishop.prototype.getValidMoves.call(this, from, board)
    }
  }
}

function getKnightExtentions() {

  return {
    getValidMoves: function* (from, board) {
      yield* getValidMoves(this.color, board, function* () {
        yield { x: from.x + 1, y: from.y + 2 }
        yield { x: from.x + 2, y: from.y + 1 }
        yield { x: from.x - 1, y: from.y + 2 }
        yield { x: from.x - 2, y: from.y + 1 }
        yield { x: from.x + 1, y: from.y - 2 }
        yield { x: from.x + 2, y: from.y - 1 }
        yield { x: from.x - 1, y: from.y - 2 }
        yield { x: from.x - 2, y: from.y - 1 }
      }, false)
    }
  }
}

function getKingExtentions() {

  function castling(from, board, rookX) {
    // Check if king did moves
    if (board.cell(from.x, from.y).pieces[0].moveCount > 0)
      return null

    // Check if rook did moves
    const rook = board.cell(rookX, from.y).pieces[0]
    if (rook == null || rook.moveCount > 0)
      return null

    // Check if there are pieces beetween rook and king
    const dir = from.x > rookX ? -1 : 1
    for (let x = from.x + dir; x != rookX; x += dir) {
      if (!board.isCellEmpty(x, from.y))
        return null
    }

    return {
      to: { x: from.x + 2 * dir, y: from.y },
      castling: { from: { x: rookX, y: from.y }, to: { x: from.x + dir, y: from.y }, piece: rook }
    }
  }

  function* castlings(from, board) {
    const kingside = castling(from, board, 7)
    if (kingside !== null)
      yield kingside

    const queenSide = castling(from, board, 0)
    if (queenSide !== null)
      yield queenSide
  }

  return {
    getValidMoves: function* (from, board) {
      yield* castlings(from, board)

      yield* getValidMoves(this.color, board, function* () {
        yield { x: from.x, y: from.y + 1 }
        yield { x: from.x + 1, y: from.y + 1 }
        yield { x: from.x + 1, y: from.y }
        yield { x: from.x + 1, y: from.y - 1 }
        yield { x: from.x, y: from.y - 1 }
        yield { x: from.x - 1, y: from.y - 1 }
        yield { x: from.x - 1, y: from.y }
        yield { x: from.x - 1, y: from.y + 1 }
      }, false)
    }
  }
}

function* getValidMoves(color, board, traverse, stopOnObstacle = true) {
  const oppColor = getInvColor(color)
  for (const c of traverse()) {
    if (!board.isInBorders(c.x, c.y))
      continue

    const cell = board.cell(c.x, c.y)
    const to = { x: c.x, y: c.y }
    if (cell.pieces.length === 0) {
      yield { to }
    }
    else {
      if (cell.pieces[0].color === oppColor) {
        yield { to, capture: { cell: to, pieces: [...cell.pieces] } }
      }
      if (stopOnObstacle)
        return
    }
  }
}

function canAttack(from, to, board, log) {
  for (const m of this.getValidMoves(from, board, log)) {
    if (m.to.x === to.x && m.to.y === to.y) {
      return true
    }
  }
  return false
}

function getInvColor(color) {
  return color === 'black' ? 'white' : 'black'
}
