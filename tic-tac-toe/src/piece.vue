<template>
  <transition name="out">
    <div :class="[type, 'piece', {isAim:isAim}]">
      <span class="icon"></span>
    </div>
  </transition>
</template>

<script>

export default {
  props: {
    type: {
      type: String,
      required: true
    },
    isAim: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
:root {
  --border-radius: 15%;
  --convex-radius: 0.5em;
  --x-bg-color: hsl(10 100% 50%);
  --o-bg-color: hsl(110 100% 50%);
}

.piece {
  flex-grow: 1;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: inset var(--convex-radius) var(--convex-radius) var(--convex-radius) color(white alpha(50%)),
  inset -var(--convex-radius) -var(--convex-radius) var(--convex-radius) color(black alpha(35%)),
  0 0 0.3em hsl(40, 100%, 25%);
  animation: bounceIn 0.5s;
  color: white;
}

.isAim {
  animation: pulse 0.4s 3;
  box-shadow: inset var(--convex-radius) var(--convex-radius) var(--convex-radius) color(white alpha(50%)),
  inset -var(--convex-radius) -var(--convex-radius) var(--convex-radius) color(white alpha(35%)),
  0 0 0.3em hsl(40, 100%, 25%);
}

.x {
  background: var(--x-bg-color);
  background-image: linear-gradient(-45deg, var(--x-bg-color) 50%, color(white alpha(50%)));
}

.x>.icon::after {
  content: '\0E5CD';
}

.o {
  background: var(--o-bg-color);
  background-image: linear-gradient(-45deg, var(--o-bg-color) 50%, color(white alpha(50%)));
}

.o>.icon::after {
  content: '\0E836';
}

.icon {
  font-family: 'icons';
  font-size: 3.5em;
  font-weight: bold;
  text-shadow: 0 0 0.4rem white;
}

.out-leave-active{
  animation: bounceOut 0.5s;
}
</style>
