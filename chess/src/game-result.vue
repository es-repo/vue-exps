<template>
  <button :class="$style.container"
          ref="btn">
    <h1>{{message}}</h1>
  </button>
</template>

<script>
export default {
  props: {
    result: {
      type: Object,
      default: null
    }
  },

  computed:{
    message(){
      return this.result == null ? '' : this.result.draw
        ? this.result.reason === 'stalemate'
          ? 'draw by stalemate!' : 'draw!'
        : this.result.winPlr.color + ' won!'
    }
  },

  watch: {
    result(v) {
      if (v != null) {
        console.log(this.message)
        this.$refs.btn.focus()
      }
    }
  }

}
</script>

<style module>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 22em;
  height: 5em;
  background-color: white;
  border-radius: 0.3em;
  color: #444;
  z-index:-1;
  outline: none;
  border: none;
}

.container:focus {
  z-index: 1;
}

.container>h1:first-letter {
  text-transform: uppercase;
}
</style>
