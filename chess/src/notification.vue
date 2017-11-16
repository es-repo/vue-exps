<template>
  <button :class="$style.container"
          ref="btn"
          v-if="!isEmpty && !hide"
          @blur="onBlur">
    <h1>{{message}}</h1>
  </button>
</template>

<script>
import Vue from 'vue'

export default {
  props: {
    message: {
      type: String,
      default: null
    },

    hideOnBlur: {
      type: Boolean,
      default: false
    }
  },

  data(){
    return {
      hide: false
    }
  },

  computed: {
    isEmpty() {
      return this.message == null || this.message == ''
    }
  },

  watch:{
    message(){
      // If message was updated then show notification if it was hidden.
      this.hide = false
      Vue.nextTick(() => {
        if (this.hideOnBlur && this.$refs.btn)
          this.$refs.btn.focus()
      })
    }
  },

  methods:{
    onBlur(){
      if (this.hideOnBlur)
        this.hide = true
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
