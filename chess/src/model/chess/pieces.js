export class Piece{
  constructor(id, type, color){
    this.id = id
    this.type = type
    this.color = color
    this.moveCount = 0
  }
}

export class Pawn extends Piece {
  constructor(id, color, direction){
    super(id, 'pawn', color)
    this.direction = direction
  }
}

export class King extends Piece{
  constructor(id, color){
    super(id, 'king', color)
  }
}

export class Queen extends Piece{
  constructor(id, color){
    super(id, 'queen', color)
  }
}

export class Knight extends Piece{
  constructor(id, color){
    super(id, 'knight', color)
  }
}

export class Bishop extends Piece{
  constructor(id, color){
    super(id, 'bishop', color)
  }
}

export class Rook extends Piece{
  constructor(id, color){
    super(id, 'rook', color)
  }
}
