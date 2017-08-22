<template>
  <section class="selector">
    <template v-for="i in items">
      <input class="value" type="radio" :name="name" :value="getItemValue(i)" :key="getItemValue(i)" :id="valueId(i)" :checked="getItemValue(i) == value" v-on:change="onSelected">
      <label :key="getItemValue(i)" :for="valueId(i)">
        {{getItemLabel(i)}}
      </label>
    </template>
  </section>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    value: {
    }
  },

  methods: {
    valueId(i) {
      return `${this.name}.${this.getItemValue(i)}`
    },

    getItemValue(i) {
      return i.value === undefined ? i : i.value
    },

    getItemLabel(i) {
      return i.label === undefined
        ? i.value === undefined
          ? i.toString()
          : i.value.toString()
        : i.label
    },

    onSelected(event) {
      const v = event.target.value
      const n = +v
      this.$emit('input', isNaN(n) ? v : n)
    },

    clicked() {
      alert('cl')
    }
  }
}
</script>

<style scoped>
:root {
  --color: hsl(50, 100%, 75%);
  --sel-color: hsl(250, 80%, 40%);
  --sel-back-color: var(--color);
}

.selector{
  display: flex;
}

.value+label {
  display: inline-block;
  padding: 0.3em;
  padding-left: 0.5em;
  padding-right: 0.5em;
  border-top: 1px solid var(--sel-back-color);
  border-bottom: 1px solid var(--sel-back-color);
}

.value:first-of-type+label {
  border-radius: 0.4em 0 0 0.4em;
  border-left: 1px solid var(--sel-back-color);
}

.value:last-of-type+label {
  border-radius: 0 0.4em 0.4em 0;
  border-right: 1px solid var(--sel-back-color);
}

.value:checked+label {
  background-color: var(--sel-back-color);
  color: var(--sel-color);
}

.value {
  display: none;
}
</style>
