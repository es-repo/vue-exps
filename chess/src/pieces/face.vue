<template>
  <face-svg :class="[$style.face, colorClass]"
            :viewBox="viewBox" />
</template>

<script>
import FaceSvg from './face.svg'

export default {
  components: {
    FaceSvg
  },

  props: {
    colorClass: {
      type: String,
      required: true
    },
    viewBox: {
      type: String,
      required: true
    },
    expression:{
      type: String,
      default: 'joy'
    }
  }
}
</script>

<style module>
.face {
  stroke: none;
}
</style>
