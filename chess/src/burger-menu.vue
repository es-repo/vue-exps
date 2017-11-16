<template>
  <nav class="wrapper"
       @transitionend.self="onMenuOpenedOrClosed($event)"
       onclick="void(0)">
    <div class="burger" ref="burger">
      <div class="burger-stroke"></div>
      <div class="burger-stroke"></div>
      <div class="burger-stroke"></div>
    </div>
    <ul class="menu">
      <li v-for="i in items"
          @click="onItemClick(i)"
          class="menu-item"
          :key="i.value">{{i.text}}</li>
    </ul>
  </nav>
</template>

<script>

function isElementHidden(el){
  //https://stackoverflow.com/a/21696585
  return el.offsetParent == null
}

export default {
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      isMenuOpened: false
    }
  },

  methods: {
    onItemClick(i) {
      if (!this.isMenuOpened)
        return

      this.$emit('item-click', i)
    },

    onMenuOpenedOrClosed(event) {
      if (event.propertyName !== 'background-color')
        return

      this.isMenuOpened = isElementHidden(this.$refs.burger)
    }
  }
}
</script>

<style scoped>
:root {
  --first-color: hsl(191, 70%, 60%);
  --second-color: white;
}

.wrapper {
  background-color: var(--first-color);
  min-width: 4em;
  min-height: 4em;
  width: 4em;
  height: 4em;
  border-radius: 50%;
  transition: all 0.15s;
  display: flex;
  justify-content: center;
  align-items: center;
  will-change: border-radius, background-color, width, height;
}

.burger-stroke {
  background: var(--second-color);
  width: 2em;
  height: 0.32em;
  margin-top: 0.4em;
  margin-bottom: 0.4em;
}

.wrapper:hover {
  background: var(--second-color);
  border-radius: 0.2em;
  width: auto;
  height: auto;
}

.wrapper:hover>.burger {
  display: none;
}

.menu {
  display: none;
  list-style-type: none;
  padding: 0;
  cursor: default;
}

.wrapper:hover>.menu {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-item {
  opacity: 0;
  transition: all 0.15s;
  height: 2em;
  padding-left: 1em;
  padding-right: 1em;
  color: #444;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

@media all and (pointer:coarse) {
  .menu-item {
    font-size: 2em;
  }
}

.wrapper:hover>.menu>.menu-item {
  opacity: 1;
}

.menu-item:hover {
  background: var(--first-color);
  color: white;
}
</style>
