<template>
  <div :class="$style.container">
    <shadow-svg/>
    <div :class="$style.board">
      <div v-for="x in size"
           :class="$style.column"
           :key="x">
        <cell v-for="y in size"
              :model="cell(x-1, y-1)"
              ref="cells"
              :class="$style.cell"
              :highlighted="isCellHighLighted(x-1, y-1)"
              :selectedPiece="selectedPiece"
              :key="y"
              @click="onCellClicked(x-1, y-1)"
              @piece-clicked="onPieceClicked($event, x-1, y-1)" />
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import deepEqual from 'deep-equal'
import 'web-animations-js'
import Board from './model/chess/board'
import Cell from './cell.vue'
import ShadowSvg from './ui-utils/svg-effects/shadow.vue'

export default {
  components: { Cell, ShadowSvg },

  props: {
    size: {
      type: Number,
      default: 8
    },

    model: {
      required: true,
      type: Board
    },

    lastMove: {
      type: Object,
      default: null
    },

    selectedPiece: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      lastMoveUpdated: this.lastMove !== null,
      movingPiecePrevBoundRects: []
    }
  },

  watch: {
    lastMove() {
      this.lastMoveUpdated = true
    }
  },

  beforeUpdate() {
    if (this.lastMove === null || !this.lastMoveUpdated)
      return
    this.preAnimatePieceMoving(this.lastMove.piece, this.lastMove.from)
    if (this.lastMove.castling != null){
      this.preAnimatePieceMoving(this.lastMove.castling.piece, this.lastMove.castling.from)
    }
    this.preAnimatePieceCapturing(this.lastMove.capture)
  },

  updated() {
    if (this.lastMove === null || !this.lastMoveUpdated)
      return
    this.animatePieceMoving(this.lastMove.piece, this.lastMove.to)
    if (this.lastMove.castling != null){
      this.animatePieceMoving(this.lastMove.castling.piece, this.lastMove.castling.to)
    }
    this.lastMoveUpdated = false
  },

  methods: {
    cell(x, y) {
      return this.model.cells[y][x]
    },

    cellVm(x, y) {
      return this.$refs.cells[x * this.size + y]
    },

    pieceVm(p, x, y) {
      const cellVm = this.cellVm(x, y)
      return cellVm.$refs.pieces.find(vm => vm.model === p)
    },

    isCellHighLighted(x, y) {
      return this.lastMove != null &&
        (deepEqual(this.lastMove.from, { x, y }) || deepEqual(this.lastMove.to, { x, y }))
    },

    onCellClicked(x, y) {
      this.$emit('cell-clicked', { x, y })
    },

    onPieceClicked(piece, x, y) {
      this.$emit('piece-clicked', piece, { x, y })
    },

    preAnimatePieceMoving(piece, from) {
      const pieceVm = this.pieceVm(piece, from.x, from.y)
      if (pieceVm != null) {
        this.movingPiecePrevBoundRects[piece.id] = pieceVm.$el.getBoundingClientRect()
      }
    },

    animatePieceMoving(piece, to) {
      if (this.movingPiecePrevBoundRects[piece.id] == null)
        return

      const pieceVm = this.pieceVm(piece, to.x, to.y)
      if (pieceVm != null) {
        const newBoundRect = pieceVm.$el.getBoundingClientRect()
        const left = this.movingPiecePrevBoundRects[piece.id].left - newBoundRect.left
        const top = this.movingPiecePrevBoundRects[piece.id].top - newBoundRect.top

        const frames = [
          { transform: `translate(${left}px,${top}px)` },
          { transform: 'translate(0,0)' }
        ]
        const timing = {
          duration: 125,
          easing: 'ease-in-out'
        }
        pieceVm.$el.animate(frames, timing)
      }

      this.movingPiecePrevBoundRects[piece.id] = null
    },

    preAnimatePieceCapturing(capture) {
      if (capture == null)
        return

      // Set "capture" to piece element so "captured-transitio" would animate it.
      for (const p of capture.pieces) {
        const pieceVm = this.pieceVm(p, capture.cell.x, capture.cell.y)
        if (pieceVm != null){
          pieceVm.$el.captured = true
        }
      }
    }
  }
}
</script>

<style module>
:root {
  --text-color: hsl(40, 40%, 77%);
  --board-color: hsl(32, 40%, 55%);
  --border-width: 4%;
  --border-width-in-cells: var(--border-width) * 8;
  --inner-border-width: 2px;
  --inner-border: var(--inner-border-width) solid var(--text-color);
}

.board {
  display: flex;
  background-color: var(--board-color);
  padding: var(--border-width);
  border-radius: 1%;
  width: 100%;
  height: 100%;
}

.column {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 100%;
  border-top: var(--inner-border);
  border-bottom: var(--inner-border);
}

.column:first-child {
  border-left: var(--inner-border);
}

.column:last-child {
  border-right: var(--inner-border);
}

.cell {
  display: flex;
  flex-basis: 100%;
  position: relative;
}

.column:first-child>.cell::before {
  content: attr(rank);
  color: var(--text-color);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: calc(var(--border-width-in-cells));
  left: calc(-var(--border-width-in-cells) - var(--inner-border-width));
}

.column:last-child>.cell::before {
  content: attr(rank);
  color: var(--text-color);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: calc(var(--border-width-in-cells));
  left: calc(100% + var(--inner-border-width));
}

.cell:first-child::after {
  content: attr(file);
  color: var(--text-color);
  position: absolute;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(var(--border-width-in-cells));
  left: 0;
  top: calc(-var(--border-width-in-cells) - 2*var(--inner-border-width));
}

.cell:last-child::after {
  content: attr(file);
  color: var(--text-color);
  position: absolute;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(var(--border-width-in-cells));
  left: 0;
  top: calc(100% + var(--inner-border-width));
}
</style>
