<template>
  <div :class="$style.container">
    {{name}}
  </div>
</template>

<script>
import Player from './model/player'

export default {
  props: {
    player: {
      type: Player,
      default: null
    }
  },

  computed:{
    name(){
      return this.player != null ? this.player.name : ' '
    }
  }
}
</script>

<style module>
.container {
  color: white;
  display: inline-block;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  text-shadow: 0 0 0.5em black;
  font-weight: bold;
  min-height: 2rem;
}

@media all and (pointer:coarse) {
  .container {
    font-size: 2rem;
  }
}

.container:first-letter {
  text-transform: uppercase;
}
</style>
