import test from 'tape'
import * as Pieces from './pieces'
import Rules from './piece-move-rules'
import Chess from './game'
import Player from './player'

const wplr = new Player(1, 'white')
const bplr = new Player(2, 'black')

Rules.apply()

test('test rules application', t => {
  const pawn = new Pieces.Pawn(1, 'white', 1)
  t.is(typeof pawn.getValidMoves, 'function')
  t.end()
})


test('test Pawn direct valid moves', t => {
  const chess = new Chess(wplr, bplr)

  const pawn01 = chess.board.cell(0, 1).pieces[0]
  let validmoves = [...pawn01.getValidMoves({ x: 0, y: 1 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [
    { to: { x: 0, y: 2 } },
    { to: { x: 0, y: 3 } }
  ], 'Black pawn can move one or two cells ahead as first move.')

  chess.commitMove(bplr, {
    from: { x: 0, y: 1 }, to: { x: 0, y: 2 },
    piece: chess.board.cell(0, 1).pieces[0]
  })
  validmoves = [...pawn01.getValidMoves({ x: 0, y: 2 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [
    { to: { x: 0, y: 3 } }
  ], 'Black pawn can move only one cell ahead as non-first move.')

  // Put white pawn opposite to black one two cells ahead
  chess.commitMove(wplr, {
    from: { x: 1, y: 6 }, to: { x: 1, y: 3 },
    piece: chess.board.cell(1, 6).pieces[0]
  })
  const pawn11 = chess.board.cell(1, 1).pieces[0]
  validmoves = [...pawn11.getValidMoves({ x: 1, y: 1 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [
    { to: { x: 1, y: 2 } }
  ], 'Black pawn can move only one cell ahead as first move if there another piece on two ahead cell.')

  // Put white pawn opposite to black one right ahead
  chess.commitMove(wplr, {
    from: { x: 2, y: 6 }, to: { x: 2, y: 2 },
    piece: chess.board.cell(2, 6).pieces[0]
  })
  const pawn21 = chess.board.cell(2, 1).pieces[0]
  t.true(pawn21 instanceof Pieces.Pawn)
  t.is(pawn21.color, 'black')
  validmoves = [...pawn21.getValidMoves({ x: 2, y: 1 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [],
    'Black pawn cannot move cause there is another piece right ahead.')

  const pawn06 = chess.board.cell(0, 6).pieces[0]
  validmoves = [...pawn06.getValidMoves({ x: 0, y: 6 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [
    { to: { x: 0, y: 5 } },
    { to: { x: 0, y: 4 } }
  ], 'White pawn can move one or two cells ahead as first move.')

  chess.commitMove(wplr, {
    from: { x: 0, y: 6 }, to: { x: 0, y: 5 },
    piece: chess.board.cell(0, 6).pieces[0]
  })
  validmoves = [...pawn06.getValidMoves({ x: 0, y: 5 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [
    { to: { x: 0, y: 4 } }
  ], 'White pawn can move only one cell ahead as non-first move.')

  t.end()
})

test('test Pawn diagonal valid capturing moves', t => {

  const chess = new Chess(wplr, bplr)

  const pawn01 = chess.board.cell(0, 1).pieces[0]
  // Put white pawn on right diagonal to black one
  chess.commitMove(wplr, {
    from: { x: 1, y: 6 }, to: { x: 1, y: 2 },
    piece: chess.board.cell(1, 6).pieces[0]
  })
  let validmoves = [...pawn01.getValidMoves({ x: 0, y: 1 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [
    { to: { x: 0, y: 2 } },
    { to: { x: 0, y: 3 } },
    { to: { x: 1, y: 2 }, capture: { cell: { x: 1, y: 2 }, pieces: chess.board.cell(1, 2).pieces } }
  ], 'Black pawn can capture white one on right diagonal.')

  // Put white pawns on right and left diagonals to black one
  chess.commitMove(wplr, {
    from: { x: 3, y: 6 }, to: { x: 3, y: 2 },
    piece: chess.board.cell(3, 6).pieces[0]
  })
  const pawn21 = chess.board.cell(2, 1).pieces[0]
  validmoves = [...pawn21.getValidMoves({ x: 2, y: 1 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [
    { to: { x: 2, y: 2 } },
    { to: { x: 2, y: 3 } },
    { to: { x: 1, y: 2 }, capture: { cell: { x: 1, y: 2 }, pieces: chess.board.cell(1, 2).pieces } },
    { to: { x: 3, y: 2 }, capture: { cell: { x: 3, y: 2 }, pieces: chess.board.cell(3, 2).pieces } }
  ], 'Black pawn can capture white ones on right and left diagonals.')

  // Put black pawn on right diagonal to black one
  chess.commitMove(wplr, {
    from: { x: 0, y: 1 }, to: { x: 5, y: 2 },
    piece: chess.board.cell(0, 1).pieces[0]
  })
  const pawn41 = chess.board.cell(4, 1).pieces[0]
  validmoves = [...pawn41.getValidMoves({ x: 4, y: 1 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [
    { to: { x: 4, y: 2 } },
    { to: { x: 4, y: 3 } },
    { to: { x: 3, y: 2 }, capture: { cell: { x: 3, y: 2 }, pieces: chess.board.cell(3, 2).pieces } }
  ], 'Black pawn can capture white ones on right and left diagonals.')

  const pawn06 = chess.board.cell(0, 6).pieces[0]
  // Put black pawn on right diagonal to white one
  chess.commitMove(bplr, {
    from: { x: 1, y: 0 }, to: { x: 1, y: 5 },
    piece: chess.board.cell(1, 0).pieces[0]
  })
  validmoves = [...pawn06.getValidMoves({ x: 0, y: 6 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [
    { to: { x: 0, y: 5 } },
    { to: { x: 0, y: 4 } },
    { to: { x: 1, y: 5 }, capture: { cell: { x: 1, y: 5 }, pieces: chess.board.cell(1, 5).pieces } }
  ], 'White pawn can capture black one on right diagonal.')

  t.end()
})

test('test Pawn En Passant valid capturing move', t => {

  const chess = new Chess(wplr, bplr)

  // Move pawns to make En Passant capturing possible
  chess.commitMove(wplr, {
    from: { x: 0, y: 6 }, to: { x: 0, y: 3 },
    piece: chess.board.cell(0, 6).pieces[0]
  })

  chess.commitMove(bplr, {
    from: { x: 1, y: 1 }, to: { x: 1, y: 3 },
    piece: chess.board.cell(1, 1).pieces[0]
  })

  const pawn03 = chess.board.cell(0, 3).pieces[0]
  const validmoves = [...pawn03.getValidMoves({ x: 0, y: 3 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [
    { to: { x: 0, y: 2 } },
    { to: { x: 1, y: 2 }, capture: { cell: { x: 1, y: 3 }, pieces: chess.board.cell(1, 3).pieces } }
  ], 'White pawn can capture black one En Passant.')

  t.end()
})

test('Test pawn promotion valid moves', t => {
  const chess = new Chess(wplr, bplr)
  // Setup pieces to allow white pawn to promote.
  chess.board.cell(0, 0).pieces = []
  chess.board.cell(0, 1).pieces = [...chess.board.cell(0, 6).pieces]

  const pawn01 = chess.board.cell(0, 1).pieces[0]
  const validmoves = [...pawn01.getValidMoves({ x: 0, y: 1 }, chess.board, chess.log)]
  t.deepEqual(validmoves, [
    { to: { x: 0, y: 0 }, promotion: {} },
    {
      to: { x: 1, y: 0 },
      capture: { cell: { x: 1, y: 0 }, pieces: chess.board.cell(1, 0).pieces },
      promotion: {}
    }
  ], 'White pawn can be promoted.')
  t.end()
})

test('Test rook valid moves', t => {
  const chess = new Chess(wplr, bplr)

  const rook = chess.board.cell(0, 0).pieces[0]
  let validMoves = [...rook.getValidMoves({ x: 0, y: 0 }, chess.board)]
  t.deepEqual(validMoves, [], 'Rook can\'t move at the begining')

  // Put the rook to the center
  chess.board.movePieces(0, 0, 3, 3)
  validMoves = [...rook.getValidMoves({ x: 3, y: 3 }, chess.board)]
  t.deepEqual(validMoves, [
    { to: { x: 3, y: 4 } },
    { to: { x: 3, y: 5 } },
    { to: { x: 3, y: 6 }, capture: { cell: { x: 3, y: 6 }, pieces: chess.board.cell(3, 6).pieces } },
    { to: { x: 3, y: 2 } },
    { to: { x: 4, y: 3 } },
    { to: { x: 5, y: 3 } },
    { to: { x: 6, y: 3 } },
    { to: { x: 7, y: 3 } },
    { to: { x: 2, y: 3 } },
    { to: { x: 1, y: 3 } },
    { to: { x: 0, y: 3 } }
  ], 'Rook can move vertically and horisontally and can capture pawn ahead')

  t.end()
})

test('Test if piece can attack a cell.', t => {
  const chess = new Chess(wplr, bplr)
  const queen = chess.board.cell(3, 0).pieces.pop()

  t.false(queen.canAttack({ x: 3, y: 0 }, { x: 3, y: 6 }, chess.board),
    'Black Queen in its initial position can\'t capture white pawn at [3,6] position.')

  t.true(queen.canAttack({ x: 3, y: 3 }, { x: 3, y: 6 }, chess.board),
    'Black Queen can attack white pawn at [3,6] position when the Queen is in center.')

  const pawn01 = chess.board.cell(0, 1).pieces[0]
  t.true(pawn01.canAttack({ x: 0, y: 1 }, { x: 1, y: 2 }, chess.board),
    'Black pawn can attack cell [1,2].')
  t.false(pawn01.canAttack({ x: 0, y: 1 }, { x: 0, y: 2 }, chess.board),
    'Black pawn cant attack cell [0,2].')

  t.end()
})
