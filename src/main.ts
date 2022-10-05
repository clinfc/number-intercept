import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import { numberInterceptDirective } from './direactive/number-intercept'

createApp(App)
  .use(Antd)
  .directive('demo', {
    created(el: HTMLElement, binding, vnode) {
      console.log(el)
      console.log(binding)
      console.log(vnode)

      el.addEventListener('compositionstart', (e) => {
        console.log(e.type, e)
      })
      el.addEventListener('beforeinput', (e) => {
        console.log(e.type, e)
      })
      // el.addEventListener('input', (e) => {
      //   console.log(e.type, e)
      // })
      el.addEventListener('compositionend', (e) => {
        console.log(e.type, e)
      })
    },
  })
  .use(numberInterceptDirective)
  .mount('#app')
