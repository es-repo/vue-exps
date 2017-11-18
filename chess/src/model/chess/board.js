import Board from '../board'

export default class extends Board {
  constructor(reverse = false) {
    super(8)
    const color1 = 'white'
    const color2 = 'black'

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const c = this.cell(x, y)
        c.color = (y + x % 2) % 2 == 0 ? color1 : color2
        c.rank = reverse ? y + 1 : 8 - y
        c.file = String.fromCharCode(96 + (reverse ? 8 - x : x + 1))
      }
    }
  }

  findKing(color) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const cell = this.cell(x, y)
        if (cell.pieces.length > 0 &&
          cell.pieces[0].type === 'king' &&
          cell.pieces[0].color === color) {
          return { x, y, piece: cell.pieces[0] }
        }
      }
    }
    return null
  }

  * findPiecesOfColor(color) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const cell = this.cell(x, y)
        const pieces = cell.pieces.filter(p => p.color === color)
        for (const piece of pieces)
          yield { x, y, piece }
      }
    }
  }
}
