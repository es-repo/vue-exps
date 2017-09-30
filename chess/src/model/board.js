export default class {

  constructor(size) {
    this.size = size
    this.cells = []
    for (let y = 0; y < this.size; y++) {
      this.cells[y] = []
      for (let x = 0; x < this.size; x++) {
        this.cells[y][x] = { pieces: [] }
      }
    }
  }

  cell(x, y) {
    return this.isInBorders(x, y)
      ? this.cells[y][x]
      : null
  }

  isCellEmpty(x, y) {
    return this.cell(x, y).pieces.length == 0
  }

  isInBorders(x, y) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size
  }

  addPiece(x, y, p) {
    const c = this.cell(x, y)
    if (c == null)
      return

    c.pieces.push(p)
  }

  removePiece(p, x, y) {
    const c = this.cell(x, y)
    if (c == null)
      return

    const i = c.pieces.indexOf(p)
    if (i >= 0) {
      c.pieces.splice(i, 1)
    }
  }

  removePieces(x, y){
    const c = this.cell(x, y)
    if (c == null)
      return

    c.pieces = []
  }

  movePieces(fx, fy, tx, ty) {
    const from = this.cell(fx, fy)
    const to = this.cell(tx, ty)
    if (from == null || to == null)
      return

    for (const p of from.pieces)
      to.pieces.push(p)

    from.pieces = []
  }

  movePiece(p, fx, fy, tx, ty) {
    const from = this.cell(fx, fy)
    const to = this.cell(tx, ty)
    if (from == null || to == null)
      return

    const i = from.pieces.indexOf(p)
    if (i < 0)
      return

    from.pieces.splice(i, 1)
    to.pieces.push(p)
  }

  *traverse(sx, sy, dx, dy, l) {
    for (let k = 0; k < l; k++) {
      const x = sx + k * dx
      const y = sy + k * dy

      const outBorders = x < 0 || y < 0 ||
        x == this.size || y == this.size

      if (outBorders)
        break

      yield { x, y, pieces: this.cell(x, y).pieces }
    }
  }
}
