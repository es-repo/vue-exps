<template>
  <notification :message="message" :hideOnBlur="true"></notification>
</template>

<script>
import Notification from './ui-utils/notification.vue'

export default {
  components: {
    Notification
  },

  props: {
    result: {
      type: Object,
      default: null
    }
  },

  computed: {
    message() {
      return this.result == null ? '' : this.result.draw
        ? this.result.reason === 'stalemate'
          ? 'draw by stalemate!' : 'draw!'
        : this.result.winPlr.color + ' won!'
    }
  }
}
</script>
