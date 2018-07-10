import { Vue, HEADER, axios, hidePage } from './general.js'
import '../css/log_management.less'

let edVM = new Vue({
  el: '#log_management',
  data: {
    keyword: '',
    list: [],
    keywords: '',
    totalpage: 0,//总条数
    totalP: 0,
    pageCurrent: 1, //当前页 
  },
  mounted() {
    this.getLogInfor()
  },
  methods: {
    //获取日志信息
    getLogInfor(page) {
      let THIS = this
      
      axios({
        url: HEADER + 'log/check_listLogs.do',
        params: {
          page:page,
          keywords: this.keywords
        }
      }).then(function (response) {
        THIS.list = []
        if (response.data.data.list) {
          THIS.list = response.data.data.list
          THIS.totalpage = response.data.data.allRow
          THIS.totalP = response.data.data.allRow
          hidePage(THIS.totalpage)
        }
      })
    },
    //分页
    pageInfor(e) {
      this.pageCurrent = e
      this.getLogInfor(this.pageCurrent, this.keywords)
    },
  }
})