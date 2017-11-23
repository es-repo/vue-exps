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
      if (this.result == null)
        return ''

      const byreason = this.result.reason != null ? ' by ' + this.result.reason : ''
      const what = this.result.draw ? 'draw' : `${this.result.winPlr.name} won`
      return `${what}${byreason}!`
    }
  }
}
</script>
