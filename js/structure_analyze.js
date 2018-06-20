import { Vue, axios } from './general.js'
import echarts from 'echarts'
import '../css/structure_analyze.less'

let structureAnalyzeVM = new Vue({
  el: '#structure-analyze',
  data: {},
  methods: {
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
          right: '10%',
          top: 'middle'
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
          position: ['46%', '39%'],
          textStyle: {
            fontSize: 45,
            fontWeight: '700',
            color: '#202133'
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['35%', '55%'],
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
    this.drawDoughnut([
      {value: 333, name: '水泵系统'},
      {value: 444, name: '空调系统'},
      {value: 555, name: '电梯系统'},
      {value: 555, name: '公共照明'},
      {value: 555, name: '其他'}
    ])
  }
})