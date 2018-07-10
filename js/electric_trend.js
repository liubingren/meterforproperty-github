import { Vue, axios } from './general.js'
import echarts from 'echarts'
import '../css/electric_trend.less'

// const HEADER = 'http://172.16.31.241:8087/meterforproperty'

let eTrendVM = new Vue({
  el: '#electric-trend',
  data: {
    timeType: 'year',
    location_id: '',
    date: '2018'
  },
  methods: {
    getDate (e) {
      this.date = e
    },
    getSonData (e) {
      this.location_id = e
    },
    getTimeType (e) {
      this.timeType = e.target.getAttribute('data-type')
    },
    getChartData () {
      let self = this
      axios({
        url: HEADER + '/energyAnalysis/check_getLocationMeterData.do',
        params: {
          location_id: this.location_id,
          data: this.date,
          dataType: this.timeType
        }
      })
        .then(({data}) => {
          if (data.data) {
            let xDataArr = []
            let sDataArr = []
            if (this.timeType === 'year') {
              for (let item of data.data) {
                xDataArr.push(item.year)
                sDataArr.push(item.countw)
              }
            }
            else if (this.timeType === 'month') {
              for (let item of data.data) {
                xDataArr.push(item.yearDate)
                sDataArr.push(item.countw)
              }
            }
            self.drawBar(xDataArr, sDataArr)
          }
        })
    },
    drawBar (xData, seriesData) {
      let structureChart = echarts.init(document.getElementById('chart-wrapper'))
      let option = {
        title: {
          text: '用电趋势分析',
          left: 'center',
          textStyle: {
            fontSize: '24'
          }
        },
        tooltip: {
          formatter: '用电量: {c}(Kwh)'
        },
        xAxis: {
          data: xData
        },
        yAxis: {},
        series: [
          {
            type: 'bar',
            data: seriesData,
            itemStyle: {
              color: '#2d8cf0',
              opacity: 0.7
            }
          }
        ]
      }
      structureChart.setOption(option)
      window.onresize = function () {
        structureChart.resize()
      }
    }
  },
  mounted () {
    let unitId = sessionStorage.getItem('unitId')
    if (unitId) {
      this.location_id = unitId
      this.getChartData()
    }
  }
})