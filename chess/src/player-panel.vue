<template>
  <div v-if="player != null" :class="$style.container">
    {{player.name}}
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
  min-height: 1em;
}

.container:first-letter {
  text-transform: uppercase;
}
</style>
