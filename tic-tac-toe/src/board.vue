<template>
  <div class="board" :class="{'board-flip': sizeChanging}">
    <div class="row" v-for="x in size" :key="x">
      <div class="cell" v-for="y in size" :key="y" @click="cellClicked(x-1, y-1)">
        <piece v-for="(p, i) in cell(x-1, y-1)" :key="i" :type="p.type" :isAim="p.isAim" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Piece from './piece.vue'

export default {
  props: {
    size: {
      type: Number,
      default: 3
    }
  },

  components: { Piece },

  data() {
    return {
      cells: [],
      sizeChanging: false
    }
  },

  watch: {
    size() {
      this.sizeChanging = true
      this.initCells()
      const self = this
      setTimeout(()=>{self.sizeChanging = false}, 800)
    }
  },

  created() {
    this.initCells()
  },

  methods: {
    initCells() {
      this.cells = Array.apply(null, { length: this.size * this.size })
        .map(() => [])
    },

    cellClicked(x, y) {
      this.$emit('cell-clicked', x, y)
    },

    cell(x, y) {
      return this.cells[this.size * y + x]
    },

    putPiece(x, y, p) {
      const c = this.cell(x, y)
      Vue.set(c, 0, p)
    },

    clear() {
      this.initCells()
    }
  }
}
</script>


<style scoped>
:root {
  --bg-color: hsl(50, 100%, 75%);
  --cell-border-radius: 15%;
}

.board {
  display: flex;
  background-color: var(--bg-color);
  border-radius: 4%;
  padding: 1em;
  box-shadow: inset -0.25em -0.25em 0.5em hsl(40, 100%, 15%),
  inset 0.25em 0.25em 0.5em hsl(40, 100%, 100%),
  0 0.5em 5em black;
}

.board-flip {
  animation: flipInX 0.8s;
}

.row {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 100%;
}

.cell {
  display: flex;
  flex-grow: 1;
  flex-basis: 100%;
  border: 0.3em solid var(--bg-color);
  border-radius: var(--cell-border-radius);
  box-shadow: inset 0.5em 0.5em 0.5em hsl(45, 100%, 35%, 0.4),
  inset -0.5em -0.5em 0.5em hsl(45, 100%, 55%, 0.4);
}

</style>
