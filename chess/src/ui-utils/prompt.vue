<template>
  <section :class="$style.container">
    <div>{{message}}</div>
    <div style="width:100%; display:flex;">
      <input type="text"
             ref="input"
             maxlength="32"
             v-model="value"
             :class="$style.input"
             @keyup.enter="onEnterPressed" />
      <button :class="$style.button"
              v-if="isValueValid"
              ref="button"
              @click="dismiss">
        OK
      </button>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      value: ''
    }
  },

  computed: {
    isValueValid() {
      return this.value.trim() != ''
    }
  },

  mounted() {
    this.$refs.input.focus()
  },

  methods: {
    onEnterPressed(){
      if (this.isValueValid)
        this.$refs.button.click()
    },

    dismiss(){
      this.$emit('value-entered', this.value)
    }
  }
}
</script>

<style module>
:root {
  --first-color: white;
  --second-color: hsl(191, 70%, 60%);
  --text-color: #444;
}

.container {
  width: 22em;
  min-height: 5em;
  height: auto;
  border-radius: 0.3em;
  outline: none;
  border: none;
  background-color: var(--first-color);
  display: flex;
  flex-direction: columns;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.5em;
  color: var(--text-color);
  font-size: 1.35rem;
}

.input {
  width: 100%;
  border: none;
  border-bottom: 2px solid var(--second-color);
  outline: none;
  background: transparent;
  font-size: 1.5em;
  color: var(--text-color);
}

.button {
  border: none;
  background-color: var(--second-color);
  color: var(--first-color);
  width: 4em;
  outline: none;
}

.button:active {
  color: var(--second-color);
  background-color: var(--first-color);
  border-bottom: 2px solid var(--second-color);
}
</style>
