<template>
  <div :class="$style.container">
    <h1>{{message}}</h1>
  </div>
</template>

<script>
export default {
  props: {
    result: {
      type: Object,
      required: true
    }
  },
  data(){
    return {
      message: this.result.draw
        ? this.result.reason === 'stalemate'
          ? 'draw by stalemate!' : 'draw!'
        : this.result.winPlr.color + ' won!'
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
}

.container>h1:first-letter {
    text-transform: uppercase;
}
</style>
