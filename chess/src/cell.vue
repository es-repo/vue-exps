<template>
  <div :class="[$style.cell, $style[model.color], highlighted ? $style.highlighted : '']"
       :file="model.file"
       :rank="model.rank"
       @click="$emit('click', this)">
    <captured-transition>
      <piece v-for="p in model.pieces"
             :selected="isPieceSelected(p)"
             :key="p.id"
             :model="p"
             @click="onPieceClicked(p)"
             ref="pieces"
             :class="$style.piece" />
    </captured-transition>
  </div>
</template>

<script>
import Piece from './pieces/piece-svg.vue'
import CapturedTransition from './pieces/captured-transition.js'

export default {
  components: { Piece, CapturedTransition },

  props: {
    model: {
      required: true,
      type: Object
    },
    highlighted: {
      default: false,
      type: Boolean
    },
    selectedPiece: {
      default: null,
      type: Object
    }
  },

  methods: {
    isPieceSelected(piece) {
      return this.selectedPiece !== null && piece === this.selectedPiece
    },

    onPieceClicked(piece) {
      this.$emit('piece-clicked', piece)
    }
  }
}
</script>

<style module>
:root {
  --white-color: hsl(40, 40%, 77%);
  --black-color: hsl(32, 40%, 55%);
}

.black {
  background-color: var(--black-color);
}

.white {
  background-color: var(--white-color);
}

.highlighted {
  background-image: radial-gradient(circle at center, rgb(0, 0, 0, 0), rgb(100, 255, 0, 0.2) 0%);
}

.piece {
  position: absolute;
  z-index: 1;
}
</style>
