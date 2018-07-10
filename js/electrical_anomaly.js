import { Vue, HEADER, axios, hidePage } from './general.js'
import '../css/electrical.less'
import { join } from 'path';

let eaVM = new Vue({
  el: '#electrical_anonmaly',
  data: {
    meterType: 'publicMeter',   // 判断电表类型以显示相应页面
    meterModal: false,
    isAddModal: true,
    list: [],      //数据列表
    keywords: '',
    totalpage: 0,//总条数
    totalP: 0,
    pageCurrent: 1, //当前页 
    location_id: '123',
    metertypeid: '1',
    handleCount: 0,
    downUrl: '',//导出
    processTime: 'false',
    //全选
    readMids: [],
    checkStatus: [],
  },
  mounted() {
    this.getAnomalyData(1)
    this.gethandleCount()
  },
  methods: {
    //获取异常数据
    getAnomalyData(page) {
      let THIS = this
      THIS.list = []
      axios({
        url: HEADER + '/abnormalMeter/check_getAbnormalMeterForPage.do',
        params: {
          meter_type: this.metertypeid,
          pagesize: 10,
          page: page,
          sreachParam: this.keywords
        }
      }).then(function (response) {
        if (response.data.data) {
          THIS.list = response.data.data.list
          THIS.totalpage = response.data.data.allRow
          THIS.totalP = response.data.data.allRow
          hidePage(THIS.totalpage)
        } else {
          THIS.totalpage = 0
          hidePage(THIS.totalpage)
        }
      })
    },
    //获取没处理总数
    gethandleCount() {
      let THIS = this
      axios({
        method: 'get',
        url: HEADER + '/abnormalMeter/check_countAbnormalMeterOrders.do',
        params: {
          meter_type: this.metertypeid
        }
      }).then(function (response) {
        if (response.data.code === 1) {
          THIS.handleCount = response.data.data.counts
        }
      })
    },
    // 标记处理
    handleDo(e, batch) {
      let THIS = this
      let ids, id = []
      if (!batch) {
        id.push(e.target.getAttribute('data-itemId'))
        ids = id
      } else {
        ids = this.readMids
      }
     if(ids){
      axios({
        method: 'post',
        url: HEADER + '/abnormalMeter/update_confirmAbnormalMeter.do',
        params: {
          ids: ids
        }
      }).then(function (response) {
        if (response.data.code === 1) {
          THIS.getAnomalyData(THIS.pageCurrent)
          THIS.gethandleCount()
          THIS.readMids = []
          THIS.checkStatus = []
        }
      })
     }else{
       this.instance('warning','请勾选要处理的小区！')
     }
    },
    // 获取多选框数据
    getCheckboxes(e, mid) {
      if (mid) {
        if (e) {
          this.readMids.push(mid)
        }
        else {
          this.readMids.splice(this.readMids.indexOf(mid), 1)
        }
      }
      else {   // 没传 mid 就是全选/全不选的情况
        if (e) {
          this.checkStatus = []
          this.readMids = []
          for (let item of this.list) {
            this.readMids.push(item.id)
            this.checkStatus.push(true)
          }
        }
        else {
          this.checkStatus = []
          this.readMids = []
        }
      }
    },
    // 导出
    exportInfor(e) {
      this.downUrl = HEADER + '/abnormalMeter/export_exportAbnormalMeter.do?meter_type=' + this.metertypeid + "&sreachParam=" + this.keywords
      e.target.setAttribute("href", this.downUrl)
    },
    //切换
    toggleMeterType(e) {
      this.readMids = []
      this.checkStatus = []
      this.meterType = e.target.getAttribute('data-type')
      this.metertypeid = e.target.getAttribute('data-typeid')
      this.keywords = ''
      this.pageCurrent = 1
      this.getAnomalyData(this.pageCurrent)
      this.gethandleCount()
    },
    //分页
    pageInfor(e) {
      this.pageCurrent = e
      this.getAnomalyData(this.pageCurrent)
    },
    //提示框
    instance(type, contentData) {
      const title = '提示信息';
      const content = '<p>' + contentData + '</p>';
      switch (type) {
        case 'success':
          this.$Modal.success({
            title: title,
            content: content
          });
          break;
        case 'error':
          this.$Modal.warning({
            title: title,
            content: content
          });
          break
          case 'warning':
          this.$Modal.warning({
            title: title,
            content: content
          });
          break
      }
    }
  }
})