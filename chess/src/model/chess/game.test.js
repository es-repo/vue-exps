import test from 'tape'
import isSubset from 'is-subset'
import Chess from './game'
import Player from './player'
import * as Pieces from './pieces'

const wplr = new Player(1, 'white')
const bplr = new Player(2, 'black')

test('test piece initial arrangement',
  t => {
    const chess_wb = new Chess(wplr, bplr)
    const chess_bw = new Chess(bplr, wplr)

    t.is(chess_wb.board.cell(0, 0).rank, 8)
    t.is(chess_wb.board.cell(0, 0).file, 'a')
    t.is(chess_bw.board.cell(0, 0).rank, 1)
    t.is(chess_bw.board.cell(0, 0).file, 'h')

    for (const g of [chess_wb, chess_bw]) {

      const cell_00 = g.board.cell(0, 0)
      t.equal(cell_00.pieces.length, 1)
      t.equal(cell_00.pieces[0].type, 'rook')
      t.equal(cell_00.pieces[0].color, g.plrs[1].color)

      const cell_01 = g.board.cell(0, 1)
      t.equal(cell_00.pieces.length, 1)
      t.equal(cell_01.pieces[0].type, 'pawn')
      t.equal(cell_01.pieces[0].color, g.plrs[1].color)
      t.equal(cell_01.pieces[0].direction, 1)

      const cell_37 = g.board.cell(3, 7)
      t.equal(cell_37.pieces.length, 1)
      t.equal(cell_37.pieces[0].type, 'queen')
      t.equal(cell_37.pieces[0].color, g.plrs[0].color)
      // quenn on her own color
      t.equal(cell_37.pieces[0].color, cell_37.color)

      const cell_36 = g.board.cell(3, 6)
      t.equal(cell_36.pieces.length, 1)
      t.equal(cell_36.pieces[0].type, 'pawn')
      t.equal(cell_36.pieces[0].color, g.plrs[0].color)
      t.equal(cell_36.pieces[0].direction, -1)
    }

    t.end()
  })

test('test move validation',
  t => {
    const chess = new Chess(wplr, bplr)

    const white_invalid_moves = [
      {
        // from out of borders
        from: { x: -1, y: -1 },
        to: { x: 0, y: 5 },
        piece: new Pieces.Queen(20, 'white')
      },

      {
        // to out of borders
        from: { x: 0, y: 6 },
        to: { x: 0, y: 8 },
        piece: new Pieces.Queen(21, 'white')
      },

      {
        // move from empty cell
        from: { x: 2, y: 2 },
        to: { x: 3, y: 3 },
        piece: null
      },

      {
        // move to cell with white piece
        from: { x: 3, y: 7 },
        to: { x: 3, y: 6 },
        piece: new Pieces.Queen(22, 'white')
      },

      {
        // white player tries to move black piece
        from: { x: 0, y: 1 },
        to: { x: 0, y: 2 },
        piece: new Pieces.Pawn(23, 'black')
      }
    ]

    for (const m of white_invalid_moves) {
      t.false(chess.validateMove(wplr, m))
    }

    // lets put white Queen to the center
    chess.board.movePieces(3, 7, 3, 4)

    const valid_white_moves = [
      {
        // to empty cell
        from: { x: 0, y: 6 },
        to: { x: 0, y: 5 },
        piece: chess.board.cell(0, 6).pieces[0]
      },

      {
        // to cell with black piece
        from: { x: 3, y: 4 },
        to: { x: 3, y: 1 },
        piece: chess.board.cell(3, 4).pieces[0]
      }
    ]

    for (const m of valid_white_moves) {
      t.true(chess.validateMove(wplr, m))
    }

    t.end()
  })

test('test move commitment',
  t => {
    const chess = new Chess(wplr, bplr)
    // commit move to empty cell
    const move = {
      from: { x: 0, y: 6 },
      to: { x: 0, y: 5 },
      piece: chess.board.cell(0, 6).pieces[0]
    }
    chess.commitMove(wplr, move)
    t.true(chess.board.isCellEmpty(move.from.x, move.from.y))
    t.false(chess.board.isCellEmpty(move.to.x, move.to.y))

    let last_log_entry = chess.log[chess.log.length - 1]
    t.equal(last_log_entry.plr, wplr)
    t.equal(last_log_entry.move, move)
    t.is(last_log_entry.move.capture, undefined)

    const move2 = {
      from: { x: 0, y: 5 },
      to: { x: 0, y: 1 },
      piece: chess.board.cell(0, 5).pieces[0],
      capture: {
        cell: { x: 0, y: 1 },
        pieces: [...chess.board.cell(0, 1).pieces]
      }
    }

    // ensure that "to" cell contains black piece which will be captured by white one
    t.is(1, chess.board.cell(move2.to.x, move2.to.y).pieces.length)
    const blackPiece = chess.board.cell(move2.to.x, move2.to.y).pieces[0]
    t.is('black', blackPiece.color)

    chess.commitMove(wplr, move2)

    t.true(chess.board.isCellEmpty(move2.from.x, move2.from.y))
    t.false(chess.board.isCellEmpty(move2.to.x, move2.to.y))
    t.is(chess.board.cell(move2.to.x, move2.to.y).pieces.length, 1)
    t.is('white', chess.board.cell(move2.to.x, move2.to.y).pieces[0].color)

    last_log_entry = chess.log[chess.log.length - 1]
    t.equal(last_log_entry.plr, wplr)
    t.equal(last_log_entry.move, move2)
    t.equal(last_log_entry.move.capture.pieces.length, 1)
    t.deepEqual(last_log_entry.move.capture.cell, move2.to)
    t.equal(last_log_entry.move.capture.pieces[0], blackPiece)

    t.end()
  })

test('Test move commitment with promotion', t => {
  const chess = new Chess(wplr, bplr)
  // Put white pawn to allow it to promote with knight capturing
  chess.board.cell(0, 1).pieces[0] = chess.board.cell(0, 6).pieces[0]
  chess.commitMove(wplr, {
    from: { x: 0, y: 1 },
    to: { x: 1, y: 0 },
    piece: chess.board.cell(0, 1).pieces[0],
    capture: { cell: { x: 1, y: 0 }, pieces: [chess.board.cell(1, 0).pieces[0]] },
    promotion: {}
  })
  const promotedPiece = chess.board.cell(1, 0).pieces[0]
  t.true(isSubset(promotedPiece,
    { type: 'queen', color: 'white' }),
  'White pawn promoted to queen with knight capturing.')
  t.end()
})

test('Test if King is in check', t => {
  const chess = new Chess(wplr, bplr)
  t.false(chess.isKingInCheck(wplr), 'White king cant be captured when all peices in initial positions')
  t.false(chess.isKingInCheck(bplr), 'Balck king cant be captured when all peices in initial positions')

  // put black king to the center
  chess.board.cell(4, 3).pieces.push(chess.board.cell(4, 0).pieces.pop())
  // put white pawn close to the king
  chess.board.cell(5, 4).pieces.push(chess.board.cell(5, 6).pieces.pop())
  t.true(chess.isKingInCheck(bplr), 'White king is in check by black pawn')

  t.end()
})
