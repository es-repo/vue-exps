import Game, { BotPlayer } from './game'

export default class extends Game {
  constructor(plrs, board, aim) {
    super(plrs)
    this.board = board
    this.aim = aim

    this.findAimSeqFuncs = [
      this.findInRow.bind(this, 1, 0),
      this.findInRow.bind(this, 0, 1),
      this.findInRow.bind(this, 1, 1),
      this.findInRow.bind(this, -1, 1)]
  }

  validateMove(p, m) {
    return this.board.isCellEmpty(m.x, m.y)
  }

  commitMove(p, m) {
    this.board.addPiece(p.id, m.x, m.y)
  }

  isGameEnd(p) {
    for (const f of this.findAimSeqFuncs) {
      const aimSeq = f(p)
      if (aimSeq != null)
        return { winPlr: p, aimSeq: aimSeq }
    }

    const isDraw = this.board.isFull()
    return isDraw
      ? { draw: true }
      : null
  }

  findInRow(dx, dy, plr) {
    const s = this.board.size
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const seq = []
        for (const c of this.board.traverseTo(x, y, dx, dy, this.aim)) {
          if (c.p.length > 0 && c.p.indexOf(plr.id) >= 0) {
            seq.push(c)
          }
          else break
        }
        if (seq.length == this.aim)
          return seq
      }
    }
    return null
  }
}

class Array2d {
  constructor(w, h) {
    h = h || w
    this.width = w
    this.height = h
    this.array = Array.apply(null, { length: h })
      .map(() => new Array(w))
  }

  get(i, j) {
    return this.array[i][j]
  }

  set(i, j, v) {
    this.array[i][j] = v
  }

  fill(v) {
    this.forEach((_, i, j) => this.set(i, j, v))
  }

  forEach(f) {
    for (let i = 0; i < this.height; i++)
      for (let j = 0; j < this.width; j++) {
        const b = f(this.array[i][j], i, j, this)
        if (b) break
      }
  }
}

export class TicTacToeBotPlayer extends BotPlayer {
  constructor(id, board, aim, level = 0, delay = 0) {
    super(id, level, delay)
    this.aim = aim
    this.board = board
    this.moves = new Array2d(this.board.size)
    this.oppPiece = id == 'x' ? 'o' : 'x'
    this.sucumbProb = [0.75, 0.3, 0]
  }

  async moveInternal() {

    let bests = this.findBestMoves(this.id)
    const succumb = Math.random() < this.sucumbProb[this.level]
    if (!succumb) {
      const myTemp = this.getMoveTemp(bests[0])
      const oppBests = this.findBestMoves(this.oppPiece)
      const oppTemp = this.getMoveTemp(oppBests[0])
      if (myTemp < oppTemp) {
        bests = oppBests
      }
    }

    const r = Math.floor(Math.random() * bests.length)
    return bests[r]
  }

  getMoveTemp(m) {
    return this.moves.get(m.y, m.x).reduce((t, v, i) => v > 0 ? i : t, 0)
  }

  findBestMoves(p) {
    this.fillMoves(p)

    const compare = (m1, m2) => {
      if (m1 == null)
        return -1

      for (let i = m1.length - 1; i >= 0; i--) {
        if (m1[i] > m2[i])
          return 1
        else if (m1[i] < m2[i])
          return -1
      }
      return 0
    }

    const bests = []
    this.moves.forEach((m, i, j) => {
      const bm = bests.length == 0
        ? null
        : this.moves.get(bests[0].y, bests[0].x)

      const c = compare(bm, m)
      if (c < 1) {
        if (c < 0) {
          bests.length = 0
        }
        bests.push({ x: j, y: i })
      }
    })
    return bests
  }

  fillMoves(p) {
    this.moves.forEach(
      (v, i, j, a) => a.set(i, j, Array.apply(null, { length: this.aim }).map(() => 0)))

    this.moves.forEach((v, i, j) => {
      this.fillTo(j, i, 1, 0, p)
      this.fillTo(j, i, 0, 1, p)
      this.fillTo(j, i, 1, 1, p)
      this.fillTo(j, i, -1, 1, p)
    })
  }

  fillTo(sx, sy, dx, dy, p) {
    if (!this.board.isCellEmpty(sx, sy)) {
      this.moves.get(sy, sx)[0] = -1
    }

    if (!this.canMoveTo(sx, sy, dx, dy, p))
      return

    const pc = this.pieceCountOnMoveTo(sx, sy, dx, dy, p)
    for (const c of this.board.traverseTo(sx, sy, dx, dy, this.aim)) {
      if (c.p.length == 0) {
        this.moves.get(c.y, c.x)[pc]++
      }
    }
  }

  pieceCountOnMoveTo(sx, sy, dx, dy, p) {
    let count = 0
    for (const c of this.board.traverseTo(sx, sy, dx, dy, this.aim)) {
      if (c.p.indexOf(p) >= 0)
        count++
    }
    return count
  }

  canMoveTo(sx, sy, dx, dy, p) {
    let l = 0
    for (const c of this.board.traverseTo(sx, sy, dx, dy, this.aim)) {
      const opponentPiece = c.p.length > 0 && c.p.indexOf(p) == -1
      if (opponentPiece)
        break
      l++
    }

    return l == this.aim
  }
}
