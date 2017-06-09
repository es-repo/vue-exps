function createGame2048(size) {
  size = size || 4
  var size2 = size * size
  var size1_2 = size / 2
  var score = 0

  var board = Array.apply(null, { length: size })
    .map(function () {
      return Array.apply(null, { length: size })
        .map(function () { return 0 })
    })

  function cellIsEmpty(c) { return board[c.y][c.x] == 0 }
  function cellsEqual(c1, c2) { return board[c1.y][c1.x] == board[c2.y][c2.x] }
  function canMoveChip(cf, ct) { return cellIsEmpty(ct) || cellsEqual(cf, ct) }

  function moveChip(cf, ct) {
    var tWasEmpty = cellIsEmpty(ct)
    var v = board[ct.y][ct.x] += board[cf.y][cf.x]
    board[cf.y][cf.x] = 0
    return tWasEmpty ? 0 : v
  }

  function findRandomEmptyPos() {
    var r = Math.floor(Math.random() * size2)
    var c = {}
    for (var i = size2; i > 0; i--) {
      c.y = Math.floor(r / size)
      c.x = r % size
      if (cellIsEmpty(c))
        return c
      r++
      if (r == size2)
        r = 0
    }
    return null
  }

  function rot0(c, x, y) {
    c.x = x
    c.y = y
  }
  function rot90(c, x, y) {
    c.x = y
    c.y = x
  }
  function rot180(c, x, y) {
    c.x = size - 1 - x
    c.y = y
  }
  function rot270(c, x, y) {
    c.x = y
    c.y = size - 1 - x
  }

  function move(rot) {
    var scoreInc = 0
    var moves = []
    var consolidations = []
    var c = {}
    var tc = {}
    for (var y = 0; y < size; y++) {
      var s = size
      for (var x = size - 2; x >= 0; x--) {
        rot(c, x, y)
        if (!cellIsEmpty(c)) {
          var tx = x
          while (tx + 1 < s) {
            rot(tc, tx + 1, y)
            if (!cellIsEmpty(tc)) {
              if (cellsEqual(c, tc)) {
                tx++
                s = tx
              }
              break
            }
            tx++
          }

          if (x != tx) {
            rot(tc, tx, y)
            var v = moveChip(c, tc)
            moves.push({
              from: { x: c.x, y: c.y },
              to: { x: tc.x, y: tc.y }
            })
            if (v > 0) {
              consolidations.push({ x: tc.x, y: tc.y, value: v })
              scoreInc += v
              score += v
            }
          }
        }
      }
    }
    return {
      moves: moves, consolidations: consolidations, scoreInc: scoreInc
    }
  }

  return {
    size: size,
    board: board,
    score: function () { return score },
    turn: function () {
      var chips = []
      var p = findRandomEmptyPos()
      if (p != null) {
        var rnd = Math.random()
        var v = rnd > 0.8 ? 4 : 2
        p.value = v
        board[p.y][p.x] = v
        chips.push(p)
      }
      return chips
    },
    right: function () {
      return move(rot0)
    },
    down: function () {
      return move(rot90)
    },
    left: function () {
      return move(rot180)
    },
    up: function () {
      return move(rot270)
    },
    canMove: function () {
      for (var c = { y: 0 }, cr = { y: 0 }, cb = { y: 1 }; c.y < size; c.y++ , cr.y++ , cb.y++)
        for (c.x = 0, cr.x = 1, cb.x = 0; c.x < size; c.x++ , cr.x++ , cb.x++) {
          if (cellIsEmpty(c) ||
            (cr.x < size && cellsEqual(c, cr)) ||
            (cb.y < size && cellsEqual(c, cb)))
            return true
        }
    }
  }
}
