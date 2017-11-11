<template>
  <button :class="$style.container"
          ref="btn">
    <h1>{{message}}</h1>
  </button>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: null
    }
  },

  mounted(){
    this.bringToTopIfNonEmpty()
  },

  watch: {
    message() {
      this.bringToTopIfNonEmpty()
    }
  },

  methods:{
    bringToTopIfNonEmpty(){
      if (this.message != '') {
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
