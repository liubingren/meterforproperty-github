import { Vue } from './general.js'
import '../css/electrical.less'

let eaVM = new Vue({
  el: '#electrical_anonmaly',
  data: {
    meterType: 'publicMeter',   // 判断电表类型以显示相应页面
    meterModal: false,
    isAddModal: true,
  },
  methods: {
    // 打开添加电表弹窗
    openAddModal () {
      this.meterModal = true
      this.isAddModal = true
    },
    // 打开编辑电表弹窗
    openEditModal () {
      this.meterModal = true
      this.isAddModal = false
    },
    toggleMeterType (e) {
      this.meterType = e.target.getAttribute('data-type')
    },
    searchInfor(){
      alert(1)
    }
  }
})