function createGame2048(size) {
	size = size || 4
	var size2 = size * size
	var size1_2 = size / 2

	var board = Array.apply(null, { length: size })
		.map(function () {
			return Array.apply(null, { length: size })
				.map(function () { return 0 })
		})

	function cellIsEmpty(x, y) { return board[y][x] == 0 }
	function cellsEqual(x1, y1, x2, y2) { return board[y1][x1] == board[y2][x2] }
	function canMoveChip(xf, yf, xt, yt) { return cellIsEmpty(xt, yt) || cellsEqual(xf, yf, xt, yt) }

	function moveChip(xf, yf, xt, yt) {
		board[yt][xt] += board[yf][xf]
		board[yf][xf] = 0
	}

	function findRandomEmptyPos() {
		var r = Math.floor(Math.random() * size2)
		for (var i = size2; i > 0; i--) {
			var y = Math.floor(r / size)
			var x = r % size
			if (cellIsEmpty(x, y))
				return { x: x, y: y }
			r++
			if (r == size2)
				r = 0
		}
		return null
	}

	function move(dx, dy) {
		var shifts = []
		var xs = dx == 1 ? size - 1 : 0
		var ys = dy == 1 ? size - 1 : 0
		var xj = dx == 0 ? 1 : -dx
		var yi = dy == 0 ? 1 : -dy
		for (var i = 0, y = ys; i < size; i++, y += yi) {
			for (var j = 0, x = xs; j < size; j++, x += xj) {
				if (!cellIsEmpty(x, y)) {
					var tx = x, ty = y
					while (tx + dx < size && tx + dx >= 0
						&& ty + dy < size && ty + dy >= 0
						&& canMoveChip(x, y, tx + dx, ty + dy)) {
						tx += dx
						ty += dy
					}
					if (x != tx || y != ty) {
						moveChip(x, y, tx, ty)
						shifts.push({ fx: x, fy: y, tx: tx, ty: ty })
					}
				}
			}
		}
		return shifts
	}

	return {
		size: size,
		board: board,
		turn: function () {
			var r = []
			var p = findRandomEmptyPos()
			if (p != null) {
				var v = 2 * (1 + Math.round(Math.random()))
				p.v = v
				board[p.y][p.x] = v
				r.push(p)
			}
			return r
		},
		left: function () {
			return move(-1, 0)
		},
		right: function () {
			return move(1, 0)
		},
		up: function () {
			return move(0, -1)
		},
		down: function () {
			return move(0, 1)
		},
		isFull: function () {
			for (var x = 0; x < size; x++)
				for (var y = 0; y < size; y++)
					if (cellIsEmpty(x, y))
						return false
			return true
		}
	}
}