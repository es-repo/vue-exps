const hooks = require('require-extension-hooks')
// requestAnimationFrame polyfill
require('raf').polyfill()
require('browser-env')()
hooks('svg').plugin('vue-svg').push()
hooks('vue').plugin('vue').push()
hooks(['vue', 'js']).plugin('babel').push()
hooks('.mp3').push(() => '')
require('vue').config.productionTip = false
