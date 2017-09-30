<template>
  <svg v-once
       width="0"
       height="0">
    <defs>
      <filter :id="filterId">
        <feOffset result="offOut"
                  in="SourceAlpha" />
        <feGaussianBlur result="blurOut"
                        in="offOut"
                        :stdDeviation="radius" />
        <feBlend in="SourceGraphic"
                 in2="blurOut"
                 mode="normal" />
      </filter>
    </defs>
  </svg>
</template>

<script>
export default {
  props: {
    filterId: {
      type: String,
      default: 'shadow'
    },
    radius: {
      type: Number,
      default: 2
    }
  }
}
</script>
