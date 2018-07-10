import { Vue, iView, axios,HEADER } from './general.js'
import echarts from 'echarts'
import '../css/electric_structure.less'

// const HEADER = 'http://172.16.31.241:8087/meterforproperty'

let eStructureVM = new Vue({
  el: '#structure-analyze',
  data: {
    timeType: 'date',
    timeList: [
      {value: 'year', label: '年'},
      {value: 'month', label: '月'},
      {value: 'date', label: '日'}
    ],
    location_id: '',
    date: '2018-02-01'
  },
  methods: {
    getDate (e) {
      this.date = e
    },
    getSonData (e) {
      this.location_id = e
    },
    getChartData () {
      axios({
        url: HEADER + '/energyAnalysis/check_getLocationStructureMeterData.do',
        params: {
          location_id: this.location_id,
          data: this.date,
          dataType: this.timeType
        }
      })
        .then(({data}) => {
          let chartData = [
            {value: data.data[0].WaterPumpSystem, name: '水泵系统'},
            {value: data.data[0].AirConditionerSystem, name: '空调系统'},
            {value: data.data[0].ElevatorSystem, name: '电梯系统'},
            {value: data.data[0].lightingSystem, name: '公共照明'},
            {value: data.data[0].other, name: '其他'}
          ]
          this.drawDoughnut(chartData)
        })
    },
    drawDoughnut (seriesData) {
      let structureChart = echarts.init(document.getElementById('chart-wrapper'))
      let p = '%'
      let option = {
        title: {
          text: '用电结构分析',
          left: 'center',
          textStyle: {
            fontSize: '24'
          }
        },
        legend: {
          orient: 'vertical',
          right: '8%',
          top: '70%'
        },
        color: [
          '#f8e268',
          '#e08197',
          '#92ccce',
          '#8abd6e',
          '#2c8cf0'
        ],
        tooltip: {
          backgroundColor: '#fff',
          formatter:
          '{c}<span ' +
          'style="font-size: 17px;font-weight: 300;width: 10px;"' +
          '>台</span>' +
          '<div ' +
          'style="font-size: 17px;font-weight: 300;color:#a4b5c7;letter-spacing: 10px">' +
          '{b}</div>',
          position: ['45%', '39%'],
          textStyle: {
            fontSize: 45,
            fontWeight: '700',
            color: '#202133'
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '65%'],
            label: {
              show: true,
              position: 'outside',
              color: '#fff',
              fontSize: '16',
              formatter: '{d|{d}%}\n' +
              '{b|{b}}',
              rich: {
                d: {
                  fontSize: 30,
                  color: '#202133',
                  fontWeight: '700'
                },
                b: {
                  fontSize: 15,
                  color: '#a4b5c7'
                }
              }
            },
            labelLine: {
              length: 30,
              lineStyle: {
                color: '#000'
              }
            },
            data: seriesData
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