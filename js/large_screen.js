import { Vue, HEADER } from './general.js'
import echarts from 'echarts'
import '../css/large_screen.less'
import { axios } from './general'

let lsVM = new Vue({
  el: '#largeScreen',
  data: {
    //电表总数画图
    totalCharts: '',
    //电表数量柱状图
    countCharts: '',
    //用电量
    consumptCharts: ''
  },
  mounted() {
    this.getelectricTotal()
    this.getelectricCountTop()
    this.getelectricconsumptTop()
  },
  methods: {
    //电表总数信息
    getelectricTotal() {
      let THIS = this
      let datalist, dataArr
      axios({
        url: HEADER + 'bigScreen/check_getMeterCount.do',
      })
        .then(function (response) {
          if (response.data.data) {
            dataArr = response.data.data
            datalist = [
              { value: dataArr.MeterOn, name: '电表在线占比' },
              { value: dataArr.MeterOff, name: '电表离线线占比' },
            ]
            THIS.drawTotalCharts(datalist)
          }
        })
    },

    //电表数量top10信息
    getelectricCountTop() {
      let THIS = this
      let dataArr, dataAxis = [], data = [], yMax = 0
      axios({
        url: HEADER + 'bigScreen/check_getLocationMeterNum.do',
      })
        .then(function (response) {
          if (response.data.data) {
            dataArr = response.data.data
            for (let i = 0; i < dataArr.length; i++) {
              dataAxis.push(dataArr[i].name)
              data.push(dataArr[i].mcount)
              if (dataArr[i].mcount > yMax) {
                yMax = dataArr[i].mcount + 1
              }
            }
            THIS.drawemcCharts('emcCharts', data, dataAxis, yMax)
          }
        })
    },
    //用电量top10信息
    getelectricconsumptTop() {
      let THIS = this
      let dataArr, dataAxis = [], data = [], yMax = 0
      axios({
        url: HEADER + 'bigScreen/check_getLocationMeterRecor.do',
      })
        .then(function (response) {
          if (response.data.data) {
            dataArr = response.data.data
            for (let i = 0; i < dataArr.length; i++) {
              dataAxis.push(dataArr[i].lname)
              data.push(dataArr[i].sum)
              if (dataArr[i].sum > yMax) {
                yMax = dataArr[i].sum + 1
              }
            }
            THIS.drawemcCharts('ecCharts', data, dataAxis, yMax)
          }
        })
    },

    //电表总数画图
    drawTotalCharts(datalist) {
      this.totalCharts = echarts.init(document.getElementById('emtCharts'))
      let option = {
        color: ['#25f3e6', '#f5c847'], 
        tooltip : {
          trigger: 'item',
          formatter: '{b} : {c}个',
          extraCssText:'width:160px;height:30px; ' 
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: '10%',
          textStyle: {
            color: '#fff'
          },
          data: ['电表在线占比', '电表离线线占比'],
        },
        series: [
          {
            type: 'pie',
            radius: '55%',
            label: {
              show: true,
              position: 'outside',
              color: '#fff',
              fontSize: '14',
              formatter: '{d|{d}%}',
              rich: {
                d: {
                  fontSize: 20,
                  color: '#fff',
                  fontWeight: '700'
                },
              }
            },
            labelLine: {
              length: 20
            },
            center: ['50%', '56%'],
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
    },

    //电表数量柱状图/用电量柱状图
    drawemcCharts(dom, data, dataAxis, yMax) {
      let dataShadow = []
      let yAxisName, barColor, barBorderR, barHoverColor, barW,unitType
      for (let i = 0; i < data.length; i++) {
        dataShadow.push(yMax);
      }
      if (dom === 'emcCharts') {
        this.countCharts = echarts.init(document.getElementById(dom))
        yAxisName = '电表（个）'
        unitType = '个'
        barColor = [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' }
        ]

        barHoverColor = [
          { offset: 0, color: '#2378f7' },
          { offset: 0.7, color: '#2378f7' },
          { offset: 1, color: '#83bff6' }
        ]
        barW = 18
        barBorderR = [10, 10, 0, 0]

      } else if (dom === 'ecCharts') {
        this.consumptCharts = echarts.init(document.getElementById(dom))
        yAxisName = '用电量（kWh）'
        unitType = 'kWh'
        barColor = [
          { offset: 0, color: '#b3e2e0' },
          { offset: 0.5, color: '#8fd4d5' },
          { offset: 1, color: '#62d2d5' }
        ]

        barHoverColor = [
          { offset: 0, color: '#77d4d5' },
          { offset: 0.7, color: '#9ad4d5' },
          { offset: 1, color: '#c5e2e1' }
        ]
        barW = 20
        barBorderR = [0, 0, 0, 0]
      }

      let option = {
        textStyle: {
          color: '#c2c2c2'
        },
       tooltip : {
          trigger: 'axis',
          formatter: '{b} : {c1}' + unitType,
          extraCssText:'width:180px;height:30px; ' 
        },
        calculable: true,
        grid: {
          bottom: '2%',
          containLabel: true
        },
        xAxis: {
          name: '小区',
          data: dataAxis,
          axisLabel: {
            /*interval:0,
            rotate:"40",*/
            textStyle: {
              color: '#fff'
            },
            formatter: function (params) {
              let newParamsName = "";// 最终拼接成的字符串
              let paramsNameNumber = params.length;// 实际标签的个数
              let provideNumber = 2;// 每行能显示的字的个数
              let rowNumber = Math.ceil(paramsNameNumber / provideNumber);// 换行的话，需要显示几行，向上取整
              /**
               * 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
               */
              // 条件等同于rowNumber>1
              if (paramsNameNumber > provideNumber) {
                /** 循环每一行,p表示行 */
                for (let p = 0; p < rowNumber; p++) {
                  let tempStr = "";// 表示每一次截取的字符串
                  let start = p * provideNumber;// 开始截取的位置
                  let end = start + provideNumber;// 结束截取的位置
                  // 此处特殊处理最后一行的索引值
                  if (p == rowNumber - 1) {
                    // 最后一次不换行
                    tempStr = params.substring(start, paramsNameNumber);
                  } else {
                    // 每一次拼接字符串并换行
                    tempStr = params.substring(start, end) + "\n";
                  }
                  newParamsName += tempStr;// 最终拼成的字符串
                }

              } else {
                // 将旧标签的值赋给新标签
                newParamsName = params;
              }
              //将最终的字符串返回
              return newParamsName
            }
          },
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#fff'
            }
          },
          z: 10
        },
        yAxis: {
          name: yAxisName,//'电表（个）',
          splitLine: {
            show: true,
            lineStyle: {
              color: '#99999942'
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            textStyle: {
              color: '#fff'
            }
          }
        },

        series: [
          { // For shadow
            type: 'bar',
            barWidth: barW,
            itemStyle: {
              normal: {
                color: '#99999942'
              }
            },
            barGap: '-100%',
            barCategoryGap: '40%',
            data: dataShadow,
            animation: false
          },
          {
            type: 'bar',
            barWidth: barW,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, barColor),
                //柱形图圆角，初始化效果
                barBorderRadius: barBorderR,
                //顶部数据
                label: {
                  show: true,//是否展示
                  position: 'top',
                  textStyle: {
                    fontWeight: 'bolder',
                    fontSize: '12',
                    color: '#fff'
                  }
                }
              },
              emphasis: {
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1, barHoverColor
                )
              }
            },
            data: data
          }
        ]
      }
      if (dom === 'emcCharts') {
        this.countCharts.setOption(option)

      } else if (dom === 'ecCharts') {
        this.consumptCharts.setOption(option)
      }

    }
  }
})
// 设置当前时间
const setCurrentTime = () => {
  let today = new Date()
  let year = today.getFullYear()
  let month = today.getMonth() + 1
  let date = today.getDate()
  let hour = today.getHours()
  let minute = today.getMinutes()
  let second = today.getSeconds()
  let currentTime
  // 时分秒小于十则在前面加0
  {
    if (hour < 10) {
      hour = '0' + hour
    }
    if (minute < 10) {
      minute = '0' + minute
    }
    if (second < 10) {
      second = '0' + second
    }
  }
  currentTime = year + '年' + month + '月' + date + '日 ' + hour + ':' + minute + ':' + second
  document.getElementById('nowDate').innerText = currentTime
}

let map = new AMap.Map('distribution-map', {
  resizeEnable: true,
  zoom: 5,
  center: [108.06, 33.67],
  mapStyle: 'amap://styles/65b1609efabe4005806f5335071ac00c'
})
// 清除地图覆盖物
// map.clearMap()
//获取地图数据
const getMapMeterInfo = () => {
  let dataArr
  axios({
    url: HEADER + 'bigScreen/check_getMeterCount.do',
  }).then(function (response) {
    if (response.data.data) {
      dataArr = response.data.data.meter
      for (let i = 0; i < dataArr.length; i++) {
        let content
        if (dataArr[i].longitude && dataArr[i].latitude) {
          if (dataArr[i].online_status) {
            content = `<div class="onlineCircle"></div> `
          } else {
            content = `<div class="outlineCircle"></div>`
          }
          constructStateMark(dataArr[i].longitude, dataArr[i].latitude, content)
        }
      }
    }
  })
}

// 构建电表地图标记
const constructStateMark = (long, lat, content) => {
  if (long !== '' && lat !== '') {
    let newMarker = new AMap.Marker({
      map: map,
      position: [long, lat],   //静态数据
      offset: new AMap.Pixel(0, 0),
      content: content         //自定义点标记覆盖物内容
    })
  }
}

/*--------------------执行方法--------------------*/
getMapMeterInfo()
//日期
setCurrentTime()
setInterval(function () {
  setCurrentTime()
}, 1000)

//柱状图和饼状图适配不同分辨率
window.onresize = function () {
  lsVM.totalCharts.resize()
  lsVM.countCharts.resize()
  lsVM.consumptCharts.resize()
}



