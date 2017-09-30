import Vue from 'vue'
import 'web-animations-js'

export default Vue.component('captured-transition', {
  functional: true,
  render: function (createElement, context) {
    const data = {
      props: {
        css: false,
        tag: 'div'
      },
      on: {
        leave: function (el, done) {
          if (!el.captured) {
            done()
            return
          }

          const transX = -50 + Math.random() * 100 | 0
          const transY = -50 + Math.random() * 100 | 0
          const rotAngle = -180 + Math.random() * 360 | 0

          const frames = [
            { transform: 'scale(1) rotate(0)', opacity: 1 },
            {
              transform: `scale(4)  rotate(${rotAngle}deg) translate(${transX}px, ${transY}px)`,
              opacity: 0
            }
          ]
          const timing = {
            duration: 350,
            easing: 'ease-in-out',
          }

          el.animate(frames, timing).addEventListener('finish', done)
          // to avoid flickering in FF
          setTimeout(() => { el.style.display = 'none' }, 350)
        }
      }
    }
    return createElement('transition-group', data, context.children)
  }
})
