import test from 'tape'
import Board from './board'
import * as Pieces from './pieces'

test('Test find king', t => {
  const board = new Board()
  t.is(board.findKing('white'), null)
  t.is(board.findKing('black'), null)
  const blackKing = new Pieces.King(1, 'black')
  board.cell(3, 4).pieces.push(blackKing)
  const whiteKing = new Pieces.King(2, 'white')
  board.cell(2, 7).pieces.push(whiteKing)
  t.deepEqual(board.findKing('white'), { x: 2, y: 7, piece: whiteKing }, 'Find white king')
  t.deepEqual(board.findKing('black'), { x: 3, y: 4, piece: blackKing }, 'Find balck king')
  t.end()
})
