<template>
  <svg :class="$style.container"
       :viewBox="viewBox"
       @click="onClick">
    <component :is="model.type"
               viewBox="-8 -8 116 116"
               :class="[$style.piece, $style[model.color]]"
               :filter="svgFilterId" />
    <face :colorClass="$style[colorInv]"
          :viewBox="'-8 -8 116 116'"
          :expression="faceExpressionEff"
          :x="faceX"
          :y="faceY" />
  </svg>
</template>

<script>
import wait from '../utils/wait'
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
    },
    faceExpr: {
      type: String,
      default: 'joy'
    }
  },

  data() {
    return {
      faceX: 0,
      faceY: 0,
      faceExpression: this.faceExpr,
      stickToFearExpresion: false
    }
  },

  computed: {
    colorInv() {
      return this.model.color == 'white' ? 'black' : 'white'
    },

    viewBox() {
      return this.selected ? '3 3 94 94' : '-5 -5 110 110'
    },

    faceExpressionEff() {
      return this.selected
        ? 'laugh' :
          this.stickToFearExpresion
            ? 'fear'
            : this.faceExpression
    }
  },

  async mounted() {
    await wait(5000)
    this.animateFace()
  },

  methods: {
    onClick() {
      this.$emit('click', this.model)
    },

    async animateFace() {

      const rnd = Math.random()
      if (!this.stickToFearExpresion)
        this.faceExpression = rnd < 0.2 ? 'laugh' : rnd < 0.3 ? 'fear' : 'joy'
      if (rnd < 0.8) {
        this.faceX = 0
        await wait(Math.random() * 5000 + 2000)
        this.animateFace()
        return
      }

      const turnX = rnd > 0.9 ? -4 : 4
      this.faceX = turnX
      await wait(250)
      this.animateFace()
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
