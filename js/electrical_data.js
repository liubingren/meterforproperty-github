import { Vue,HEADER, axios, hidePage } from './general.js'
import '../css/electrical.less'

let edVM = new Vue({
  el: '#electrical_data',
  data: {
    location_id:'',
    meterType: 'publicMeter',   // 判断电表类型以显示相应页面
    metertypeid:'1',
    startime:'',   //时间
    endtime:'',
    list:[],      //数据列表
    keywords:'',
    colorFalg:false,
    totalpage:0,//总条数
    totalP:0,
    pageCurrent:1, //当前页 
    //导出
    downUrl:''
  },
  mounted(){
    this.timeRange()
    this.getElectricaltData(1,this.keywords)
  },
  methods: {
    //获取用电数据
    getElectricaltData(page,params){
      let THIS = this
      let startDate = new Date(this.startime.replace(/\-/g, "\/"))
      let endDate = new Date(this.endtime.replace(/\-/g, "\/"))
      let dataArr 
      THIS.location_id = sessionStorage.getItem('areaId') 
      THIS.list = []
      if(startDate <= endDate){
        axios({
          url: HEADER + 'meterData/check_getMeterDataListByPage.do',
          params:{
            location_id:this.location_id,//小区编号
            meter_type:this.metertypeid,
            begindate:this.startime,
            enddate:this.endtime,
            pagesize:10,
            page:page,
            params:params
          }
        }).then(function(response){
          if(response.data.data){
            dataArr = response.data.data.list
            for(let i = 0; i < dataArr.length; i++){
              THIS.list.push({
                id:dataArr[i].id,
                location_name:dataArr[i].location_name, //小区名
                mid:dataArr[i].mid,//电表编号
                install_address:dataArr[i].install_address,//安装地址
                phase:dataArr[i].phase,//相位
                type:dataArr[i].type,//用电类型
                startw:dataArr[i].startw,//开始读数
                endw :dataArr[i].endw ,//结束读数
                w:dataArr[i].w,//用电量
                countw:dataArr[i].countw,//总用电量
                building:dataArr[i].building,//楼栋号
                room_number:dataArr[i].room_number,//房号
                usercode:dataArr[i].usercode,//用户编号
                username:dataArr[i].username,//用户名称
                ratio:dataArr[i].ratio//变比
              })
              if(dataArr[i].startw === null  || dataArr[i].endw  === null ){
                THIS.colorFalg = true
              }
            }
            THIS.totalpage = response.data.data.allRow
            THIS.totalP= response.data.data.allRow
            hidePage(THIS.totalpage)
          }
        })
      }
      else {
        this.instance('error','开始时间不能大于结束时间！')
      }
    },
    //生成列表，查询
    searchInfor(keywords){
      let newlist = []
       this.list.filter(item => {      
        if (item.mid.includes(keywords) || item.install_address.includes(keywords)) {
          newlist.push(item)
        }       
      })
       if(this.keywords !== ''){
         this.totalpage = newlist.length
         hidePage(newlist.length)
       }else{
        this.totalpage = this.totalP
        hidePage(this.totalP)
       }
      return newlist     
    },
    // 导出
    exportInfor(e){
        this.downUrl = HEADER + 'meterData/export_exportMeterData.do?location_id='+this.location_id+"&meter_type=" + this.metertypeid + "&begindate=" + this.startime + "&enddate=" + this.endtime + "&params=" + this.keywords
        e.target.setAttribute("href", this.downUrl)
    },
     //设置月初到到当前时间段
     timeRange(){
      let myDate = new Date()
      let year = myDate.getFullYear()
      let month = myDate.getMonth()+1
      let day = myDate.getDate()
      let HH = myDate.getHours()
      let mm = myDate.getMinutes()
      let ss = myDate.getSeconds()
      if (month<10)
      {
        month = "0" + month;
      }
      if (day >= 0 && day <= 9)
      {
        day = "0"+ day;
      }
      let firstDay = year + "-" + month + "-" + "01 00:00:00";
      let thisDay = year + "-" + month + "-" + day + " " + HH + ":" + mm + ":" +ss;

      this.startime = firstDay
      this.endtime = thisDay
    },

    //获取时间
    handleChange(e,type){
      let THIS = this
      if(type === 1){
        THIS.startime = e
      }
      if (type === 2) {
        THIS.endtime = e
      }
    },

    //切换
    toggleMeterType (e) {
      this.meterType = e.target.getAttribute('data-type')
      this.metertypeid = e.target.getAttribute('data-typeid')
      this.keywords = ''
      this.getElectricaltData(1,this.keywords)
    },
    //分页
    pageInfor(e){
      this.pageCurrent = e
      this.getElectricaltData(this.pageCurrent,this.keywords)
    },
    //提示框
    instance(type,contentData) {
      const title = '提示信息';
      const content = '<p>'+contentData+'</p>';
      switch (type) {
        case 'success':
          this.$Modal.success({
            title: title,
            content: content
          });
          break;
        case 'error':
          this.$Modal.error({
            title: title,
            content: content
          });
          break;
      }
    }
  }
})