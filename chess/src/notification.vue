<template>
  <button :class="$style.container"
          ref="btn"
          v-if="!isEmpty">
    <h1>{{message}}</h1>
  </button>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: null
    },

    hideOnBlur: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    isEmpty() {
      return this.message == null || this.message == ''
    }
  }
}

</script>

<style module>
.container {
  width: 22em;
  min-height: 5em;
  height: auto;
  background-color: white;
  border-radius: 0.3em;
  color: #444;
  outline: none;
  border: none;
}

.container > h1:first-letter {
  text-transform: uppercase;
}
</style>
