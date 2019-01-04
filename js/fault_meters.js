import {
  Vue, iView, axios,
  HEADER, hidePage,
  isShowBtn
} from './general.js'

import '../css/fault_meters.less'

let faultMetersVM = new Vue({
  el: '#fault-meters',
  data: {
    meterType: '1',   // 判断电表类型以显示相应页面
    faultMeters: [],
    allRow: 0,
    searchParams: '',

    checkStatus: [],
    mids: [],
    isLoadingArr: {'7': false, b: false}
  },
  computed: {
    exportUrl: function () {
      return HEADER + '/faultMeter/export_exportFaultMeters.do?' +
        'meter_type=' + this.meterType +
        '&sreachParams=' + this.searchParams
    }
  },
  methods: {
    // 检测按钮
    checkBtn (id, i) {
      //  如果没传 ID 就是批量处理
      if (!id) {
        id = this.mids.join(',')
      }
      axios({
        method: 'post',
        url: HEADER + '/faultMeter/detection_confirmFaultMeters.do',
        params: {
          ids: id
        }
      })
        .then(({data}) => {
          if (data.code === 1) {
            this.$Modal.success({
              content: data.msg
            })
            this.getFaultMeters()
          }
          else {
            this.$Modal.error({
              content: data.msg
            })
          }
        })
    },

    // 获取多选框数据
    getCheckboxes (e, id) {
      if (id) {
        if (e) {
          this.mids.push(id)
        }
        else {
          this.mids.splice(this.mids.indexOf(id), 1)
        }
      }
      else {   // 没传 id 就是全选/全不选的情况
        if (e) {
          this.checkStatus = []
          for (let item of this.faultMeters) {
            this.mids.push(item.id)
            this.checkStatus.push(true)
          }
        }
        else {
          this.checkStatus = []
          this.mids = []
        }
      }
    },
    getCurrentPage (e) {
      this.getFaultMeters(e)
      this.checkStatus = []
      this.mids = []
    },
    getFaultMeters (page) {
      let self = this
      axios({
        url: HEADER + '/faultMeter/check_getFaultMetersForPage.do',
        params: {
          meter_type: this.meterType,
          page: page,
          sreachParams: self.searchParams
        }
      })
        .then(({data}) => {
          self.faultMeters = data.data.list
          self.allRow = data.data.allRow
        })
    },

    toggleMeterType (e) {
      this.meterType = e.target.getAttribute('data-type')
      this.getFaultMeters()
    }
  },
  mounted () {
    this.getFaultMeters()
    window.onload = () => {
      hidePage(this.allRow)
      isShowBtn()
    }
  }
})