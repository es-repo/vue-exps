<template>
  <button :class="[$style.container, $style[severity]]"
          ref="btn"
          v-if="!isEmpty && !hide"
          @blur="onBlur">
    <h1>{{msg}}</h1>
  </button>
</template>

<script>
import Vue from 'vue'

export default {
  props: {
    message: {
      type: [String, Object],
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
      return this.msg == null || this.msg == ''
    },

    msg(){
      return this.message instanceof Object
        ? this.message.message
        : this.message
    },

    severity(){
      return this.message instanceof Object && this.message.severity
        ? this.message.severity
        : 'info'
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
  border-radius: 0.3em;
  outline: none;
  border: none;
}

.info {
  background-color: white;
  color: #444;
}

.error {
  background-color: hsl(0, 100%, 70%);
  color: white;
}

.container > h1:first-letter {
  text-transform: uppercase;
}
</style>
