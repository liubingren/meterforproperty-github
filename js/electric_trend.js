import {
  Vue,
  axios,
  HEADER
} from './general.js'
import echarts from 'echarts'
import '../css/electric_trend.less'

// const HEADER = 'http://172.16.31.199:8087/meterforproperty'

let eTrendVM = new Vue({
  el: '#electric-trend',
  data: {
    timeType: 'year',
    location_id: '',
    date: '2018'
  },
  methods: {
    getDate(e) {
      this.date = e
    },
    getSonData(e) {
      this.location_id = e
    },
    getTimeType(e) {
      let thisTxt = e.target.innerText
      if (thisTxt === '年视图') {
        this.timeType = 'year'
      } else {
        this.timeType = 'month'
      }
      this.getChartData()
    },
    getChartData() {
      let self = this
      axios({
          url: HEADER + '/energyCurrentAnalysis/check_getLocationMeterData.do',
          params: {
            location_id: this.location_id,
            data: this.date,
            dataType: this.timeType
          }
        })
        .then(({
          data
        }) => {
          if (data.data) {
            let xDataArr = []
            let sDataArr = []
            let lastWArr = []
            let nowWArr = []
            if (this.timeType === 'year') {
              for (let item of data.data) {
                xDataArr.push(item.year)
                sDataArr.push(item.countw)
              }
              // 先销毁原来的图表，再重新创建一个，以免配置覆盖
              let structureChart = echarts.init(document.getElementById('chart-wrapper'))
              structureChart.dispose()
              let secondChart = echarts.init(document.getElementById('chart-wrapper'))
              self.drawBar(secondChart, xDataArr, sDataArr)
            } else if (this.timeType === 'month') {
              for (let item of data.data) {
                nowWArr.push(item.nowW)
                lastWArr.push(item.lastW)
                let month = item.month.substr(0, 2)
                xDataArr.push(month)
              }
              let structureChart = echarts.init(document.getElementById('chart-wrapper'))
              self.drawBar(structureChart, xDataArr, sDataArr, lastWArr, nowWArr)
            }
          }
        })
    },
    drawBar(structureChart, xData, seriesData, lw, nw) {
      let option = {
        title: {
          text: '用电趋势分析',
          left: 'center',
          textStyle: {
            fontSize: '24'
          }
        },
        tooltip: {
          formatter: '用电量: {c}(kWh)'
        },
        xAxis: {
          data: xData
        },
        yAxis: {},
        legend: {
          data: ['去年', '今年'],
          top: 10,
          right: 100
        }
      }
      if (this.timeType === 'month') {
        option.series = [{
            name: '去年',
            type: 'bar',
            data: lw,
            itemStyle: {
              color: 'red',
              opacity: 0.7
            }
          },
          {
            name: '今年',
            type: 'bar',
            data: nw,
            barGap: '5%',
            itemStyle: {
              color: 'blue',
              opacity: 0.7
            }
          }
        ]
      } else {
        option.series = [{
          type: 'bar',
          data: seriesData,
          barMaxWidth: 140,
          itemStyle: {
            color: '#2d8cf0',
            opacity: 0.7
          }
        }]
      }

      structureChart.setOption(option)
      window.onresize = function () {
        structureChart.resize()
      }
    }
    
  },
  mounted() {
    let unitId = sessionStorage.getItem('unitId')
    if (unitId) {
      this.location_id = unitId
      this.getChartData()
    }
  }
})