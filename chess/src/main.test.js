import {mount} from 'vue-test-utils'
import test from 'tape'
import Main from './main.vue'

test('test Vue component',
  t => {
    //console.log(Main)
    const wrapper = mount(Main)
    t.true(wrapper != null)
    //console.log(wrapper.html())
    t.end()
  })

