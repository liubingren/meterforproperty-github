import {
  Vue, iView, axios,
  HEADER, hidePage
} from './general.js'
import '../css/online_manage.less'

let onlineManageVM = new Vue({
  el: '#online-manage',
  data: {
    location_id: '',
    meters: [],
    allRow: 0,
    lStatus: '',
    searchParams: '',
    showBtnArr: [],
    onlineCounts: 0,
    offlineCounts: 0,
    lineStatusList: [
      {value: 1, label: '在线'},
      {value: 0, label: '离线'},
      {value: ' ', label: '全部'}
    ]
  },
  methods: {
    // 获取最后通讯时间
    getLastTime (mid, i) {
      let self = this
      axios({
        url: HEADER + '/onLineMeter/getMeterLastReadTime.do',
        params: {
          mid: mid
        }
      })
        .then(({data}) => {
          let td = document.getElementById('td' + i)
          let time = data.data.createtime
          td.innerText = time
          td.setAttribute('title', time)
        })
    },
    // 分页
    getCurrentPage (e) {
      this.loadMeters(this.location_id, e)
    },
    // 获取搜索参数
    getSearchParams (param) {
      this.loadMeters(this.location_id, 1, '', param.trim())
    },
    // 获取在线/离线状态
    getLineStatus (ls) {
      this.loadMeters(this.location_id, 1, ls)
    },
    getSonData (e) {
      this.location_id = e
      this.loadMeters(this.location_id)
    },

    loadMeters (lid, page, lineStatus, searchParams) {
      axios({
        url: HEADER + '/onLineMeter/check_getOnLineMeterListByPage.do',
        params: {
          location_id: lid,
          page: page,
          online_status: lineStatus,
          params: searchParams
        }
      })
        .then(({data}) => {
          this.meters = data.data.res.list

          this.allRow = data.data.res.allRow

          this.offlineCounts = data.data.offline_num
          this.onlineCounts = data.data.online_num
        })
    }
  },
  mounted () {
    let uId = sessionStorage.getItem('unitId')
    if (uId) {
      this.location_id = uId
      this.loadMeters(uId)
    }
  }
})