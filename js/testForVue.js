import { Vue } from './general.js'
import App from '../vue/testForVue.vue'

new Vue({
  el: '#root',
  template:'<App />',
  components:{App}
})