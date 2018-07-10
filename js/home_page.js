import { Vue,HEADER, axios } from './general.js'
import echarts from 'echarts'
import '../css/home_page.less'

let hpVm = new Vue({
  el:'#home_page',
  data:{
    userName:'',
    role:'',
    company:'',
    companyAddress:'',
    contactPhone:'',
    contactEmail:'',
    accessUnit:'',
    total:'',
    //画图
    totalCharts:''
  },
  mounted(){
    this.getessentialInfor()
    this. getpersonalInfor()
  },
  methods:{
    //獲取個人信息
    getpersonalInfor(){
      let THIS = this
      let datalist
      axios({
        url: HEADER + '/home/get_userMessage.do',
      })
        .then(function(response){
          datalist = response.data.data
          THIS.userName = (!!datalist.username ? datalist.username : '')
          THIS.role = (!!datalist.rname ? datalist.rname : '')
          THIS.company = (!!datalist.companyname ? datalist.companyname : '')
          THIS.companyAddress = (!!datalist.companyaddr ? datalist.companyaddr : '')
          THIS.contactPhone = (!!datalist.phonenumber ? datalist.phonenumber : '')
          THIS.contactEmail = (!!datalist.email ? datalist.email : '')
          THIS.accessUnit = (!!datalist.unit ? datalist.unit : '')
        })
    },
    //获取基本信息
    getessentialInfor(){
      let THIS = this
      let datalist,dataArr
      axios({
        url: HEADER + '/home/get_countMeter.do',
      })
        .then(function(response){
          dataArr = response.data.data.count
          THIS.total = response.data.data.sum.sum
          datalist = [
              {value:(!!dataArr[0].count ? dataArr[0].count : 0), name:'瓦良格公共区域监控电表'},
              {value:(!!dataArr[1].count ? dataArr[1].count : 0), name:'瓦良格住户监控电表'},
              {value:(!!dataArr[2].count ? dataArr[2].count : 0), name:'瓦良格预付费电表'}
            ]
          THIS.drawLine(datalist)
        })
    },
    //画图
    drawLine(datalist){
      this.totalCharts = echarts.init(document.getElementById('total_charts'))
      let option = {
        color: ['#15c0e5', '#afe570','#E5D135'],
        tooltip: {
          trigger: 'item',
          formatter: "{b} : {c} ({d}%)"
        },
        legend: {
          x : 'center',
          y : 'bottom',
          itemGap: 20,
          textStyle: {
            color:'#80848f'
          },
          data: ['瓦良格公共区域监控电表','瓦良格住户监控电表','瓦良格预付费电表'],
        },
        series: [
          {
            type: 'pie',
            radius: '63%',
            label: {
              show: true,
              position: 'outside',
              color: '#fff',
              fontSize: '16',
              formatter: '{c|{c}个}\n\n' +'{d|{d}%}',
              rich: {
                d: {
                  fontSize: 20,
                  color: '#80848f',
                  fontWeight: '700'
                },
                c: {
                  fontSize: 30,
                  color: '#202133',
                  fontWeight: '600'
                }
              }
            },
            labelLine: {
              length: 35
            },
            center: ['46%', '45%'],
            data: datalist,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      // 使用刚指定的配置项和数据显示图表。
      this.totalCharts.setOption(option);
      this.totalCharts.on('click', function (params) {
        //jumpTo(params)
      })
    }
  }
})


/*--------------------执行方法--------------------*/

//柱状图和饼状图适配不同分辨率
window.onresize = function () {
  document.getElementById('total_charts').style.width="100%"
  hpVm.totalCharts.resize()
}

