import { Vue, HEADER, axios, hidePage, isShowBtn} from './general.js'
import '../css/electrical.less'

let edVM = new Vue({
  el: '#electrical_data',
  data: {
    location_id: '',
    meterType: 'publicMeter',   // 判断电表类型以显示相应页面
    metertypeid: '1',
    startime: '',   //时间
    endtime: '',
    timeType:'',
    list: [],      //数据列表
    keywords: '',
    colorFalg: false,
    totalpage: 0,//总条数
    totalP: 0,
    pageCurrent: 1, //当前页 
    //导出
    downUrl: '',
    //日期类型
    dateList:[
      {
        value: 'year',
        label: '年'
      },
      {
        value: 'month',
        label: '月'
      },
      {
        value: 'day',
        label: '日'
      }
    ],
    dateTpye:'day',
    dateSelectType:'date',
    dataFormat:'yyyy-MM-dd'
  },
  mounted() {
    this.timeRange()
    this.getElectricaltData(1)
  },
  methods: {
    // 获取树形图子组件数据
    getSonData(e) {
      this.location_id = e
      if(this.metertypeid == '5'){
        this.getStatistics()
        }else{
        this.getElectricaltData(1)
        }
    },
    //获取用电数据
    getElectricaltData(page) {
      let THIS = this
      let startDate = new Date(this.startime.replace(/\-/g, "\/"))
      let endDate = new Date(this.endtime.replace(/\-/g, "\/"))
      if (!THIS.location_id) {
        THIS.location_id = sessionStorage.getItem('unitId')
      }
      if (THIS.location_id) {
        THIS.list = []
        if (startDate <= endDate) {
          axios({
            url: HEADER + 'meterData/check_getMeterDataListByPage.do',
            params: {
              location_id: this.location_id,//小区编号
              meter_type: this.metertypeid,
              begindate: this.startime,
              enddate: this.endtime,
              pagesize: 10,
              page: page,
              params: this.keywords
            }
          }).then(function (response) {
            if (response.data.data) {
              THIS.list = response.data.data.list
              THIS.totalpage = response.data.data.allRow
              THIS.totalP = response.data.data.allRow
              hidePage(THIS.totalpage)
            }
            else {
              THIS.totalpage = 0
              hidePage(THIS.totalpage)
              THIS.instance('warning', '暂无数据！')
            }
          })
        }
        else {
          THIS.totalpage = 0
          hidePage(THIS.totalpage)
          this.instance('warning', '开始时间不能大于结束时间！')
        }
      } else {
        this.instance('warning', '请选择小区！')
      }
    },

    //用电统计
    getStatistics() {
      let THIS = this
      if (!this.location_id) {
        this.location_id = sessionStorage.getItem('unitId')
      }
      if (this.location_id) {
        if(this.timeType !== ''){
          this.list = []
        axios({
          url: HEADER + '/meterData/check_getCountMeterData.do',
          params: {
            location_id: this.location_id,//小区编号
            dateType: this.dateTpye,
            date: this.timeType
          }
        }).then(function (response) {
          if (response.data.data) {
             THIS.list = response.data.data
          }
        })
        } else {
          this.instance('warning', '请选择时间！')
        }
      } else {
        this.instance('warning', '请选择小区！')
      }
    },

    // 导出
    exportInfor(e) {
      this.downUrl = HEADER + 'meterData/export_exportMeterData.do?location_id=' + this.location_id + "&meter_type=" + this.metertypeid + "&begindate=" + this.startime + "&enddate=" + this.endtime + "&params=" + this.keywords
      e.target.setAttribute("href", this.downUrl)
    },
    //设置月初到到当前时间段
    timeRange() {
      let myDate = new Date()
      let year = myDate.getFullYear()
      let month = myDate.getMonth() + 1
      let day = myDate.getDate()
      let HH = myDate.getHours()
      let mm = myDate.getMinutes()
      let ss = myDate.getSeconds()
      if (month < 10) {
        month = "0" + month;
      }
      if (day >= 0 && day <= 9) {
        day = "0" + day;
      }
      let firstDay = year + "-" + month + "-" + "01 00:00:00";
      let thisDay = year + "-" + month + "-" + day + " " + HH + ":" + mm + ":" + ss;

      this.startime = firstDay
      this.endtime = thisDay
      this.timeType = year + "-" + month + "-" + (day-1);
    },
    //日历年月日替换
    dataSelect(){ 
      if(this.dateTpye === 'day'){
        this.dateSelectType = 'date'
        this.dataFormat = 'yyyy-MM-dd'
      }
      else if(this.dateTpye === 'month'){
        this.dateSelectType = 'month'
        this.dataFormat = 'yyyy-MM'
        this.timeType = ''
      }else{
        this.dateSelectType = 'year'
        this.dataFormat = 'yyyy'
        this.timeType = ''
      }   
    },
    //获取时间
    handleChange(e, type) {
      if (type === 1) {
        this.startime = e
      }
      if (type === 2) {
        this.endtime = e
      }
      if(type === 3){
        this.timeType = e
      }
    },

    //切换
    toggleMeterType(e) {
      this.meterType = e.target.getAttribute('data-type')
      this.metertypeid = e.target.getAttribute('data-typeid')
      this.keywords = ''
      if(this.metertypeid == '5'){
      this.getStatistics()
      }else{
      this.getElectricaltData(1)
      }

      setTimeout(() =>{
        isShowBtn()
    },100)
    },
    //分页
    pageInfor(e) {
      this.pageCurrent = e
      this.getElectricaltData(this.pageCurrent)
      setTimeout(() =>{
        isShowBtn()
    },100)
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
          break
        case 'error':
          this.$Modal.error({
            title: title,
            content: content
          });
          break
          case 'warning':
          this.$Modal.warning({
            title: title,
            content: content
          })
          break
      }
    }
  }
})