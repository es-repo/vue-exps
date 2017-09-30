<template>
  <div :class="[$style.piece, $style[model.color]]"
       v-html="pieceChar" />
</template>

<script>

const pieceChars = {
  'pawn': {
    'white': '&#9817;',
    'black': '&#9823;'
  },
  'king': {
    'white': '&#9812;',
    'black': '&#9818;'
  },
  'queen': {
    'white': '&#9813;',
    'black': '&#9819;'
  },
  'rook': {
    'white': '&#9814;',
    'black': '&#9820;'
  },
  'bishop': {
    'white': '&#9815;',
    'black': '&#9821;'
  },
  'knight': {
    'white': '&#9816;',
    'black': '&#9822;'
  }
}

export default {

  props: {
    model: {
      type: Object,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      pieceChar: pieceChars[this.model.type]['black']
    }
  }

}
</script>

<style module>
.piece {
  display: flex;
  justify-content: center;
  flex-basis: 100%;
  background: transparent;
  font-size: 3.5em;
  font-family: sans-serif;
  cursor: default;
  user-select: none;
}

.white {
  color: white;
  text-shadow: 0.03em 0.03em #444,
  -0.03em 0.03em #444,
  0.03em -0.03em #444,
  -0.03em -0.03em #444,
  0 0 0.1em rgb(0, 0, 0, 0.5);
}

.black {
  color: #222;
  text-shadow: 0.03em 0.03em rgb(255, 255, 255),
  -0.03em 0.03em rgb(255, 255, 255),
  0.03em -0.03em rgb(255, 255, 255),
  -0.03em -0.03em rgb(255, 255, 255),
  0 0 0.1em rgb(0, 0, 0, 0.5);
}
</style>
