<template>
    <svg :class="$style.container"
         :viewBox="viewBox"
         @click="onClick">
      <component :is="model.type"
                 viewBox="-8 -8 116 116"
                 :class="[$style.piece, $style[model.color]]" :filter="svgFilterId" />
      <face :colorClass="$style[colorInv]"
            :viewBox="'-8 -8 116 116'" />
    </svg>
</template>

<script>
import Rook from './rook.svg'
import Knight from './knight.svg'
import Bishop from './bishop.svg'
import Pawn from './pawn.svg'
import Queen from './queen.svg'
import King from './king.svg'
import Face from './face.vue'

export default {
  components: { Rook, Knight, Bishop, Pawn, Queen, King, Face },
  props: {
    model: {
      required: true,
      type: Object
    },
    selected: {
      type: Boolean,
      default: false
    },
    svgFilterId: {
      type: String,
      default: 'url(#shadow)'
    }
  },

  computed: {
    colorInv() {
      return this.model.color == 'white' ? 'black' : 'white'
    },

    viewBox(){
      return this.selected ? '3 3 94 94' : '-5 -5 110 110'
    }
  },

  methods: {
    onClick(){
      this.$emit('click', this.model)
    }
  }
}
</script>

<style module>

.container {
  width: 100%;
  will-change: transform;
}

.white {
  stroke: #333;
  fill: white;
}

.black {
  stroke: white;
  fill: #222;
}

.piece {
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

</style>
