import { Vue, iView } from './general.js'
import '../css/fault_meters.less'

let faultMetersVM = new Vue({
  el: '#fault-meters',
  data: {
    meterType: 'publicMeter'   // 判断电表类型以显示相应页面
  },
  methods: {
    toggleMeterType (e) {
      this.meterType = e.target.getAttribute('data-type')
    }
  }
})