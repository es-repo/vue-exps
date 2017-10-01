<template>
  <component :is="expression"
             :class="[$style.face, colorClass]"
             :viewBox="viewBox" />
</template>

<script>
import Joy from './face-expressions/joy.svg'
import Laugh from './face-expressions/laugh.svg'
import Fear from './face-expressions/fear.svg'


export default {
  components: {
    Joy, Laugh, Fear
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
    expression: {
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
