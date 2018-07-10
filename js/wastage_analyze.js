import { Vue, axios, HEADER } from './general.js'
import echarts from 'echarts'
import '../css/wastage_analyze.less'

// const HEADER = 'http://172.16.31.241:8087/meterforproperty'

let wastageAnalyzeVM = new Vue({
  el: '#wastage-analyze',
  data: {
    whichTab: 'relation',
    inputCode: '',
    midArr: [],
    startDate: '2018-6-20',
    endDate: '2018-6-20',
    location_id: '',
    tableData: [],
    allRow: 0,

    // 计量关系页面
    chartData: {
      name: "",
      children: []
    },
    clickedName: '',   // 点击到的图表节点的名字
    showRMenu: false    // 显示右键菜单
  },
  methods: {
    // 获取计量关系数据
    getChartData () {
      let self = this
      axios({
        url: HEADER + '/energyAnalysis/check_getMeterTreeData.do',
        params: {
          location_id: this.location_id
        }
      })
        .then(({data}) => {
          let dataList = data.data
          let uName = sessionStorage.getItem('unitName')
          if (dataList.length &&
            this.chartData.name !== uName) {

            this.chartData.name = uName

            for (let item of dataList) {
              let cItem = {
                name: ''
              }
              cItem.name = item.meterId.toString()
              self.chartData.children.push(cItem)
            }

            self.drawTree(self.chartData)
          }
          else {
            this.chartData.name = uName
            this.chartData.children = []
            self.drawTree(self.chartData)
          }
        })
    },
    drawTree (data) {
      let myChart = echarts.init(document.getElementById('chart-wrapper'))
      let option = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          position: 'bottom',
          padding: [9, 5, 5, 5]
        },
        series: [
          {
            type: 'tree',
            data: [data],

            top: '1%',
            left: '7%',
            bottom: '1%',
            right: '20%',
            symbolSize: 7,
            label: {
              normal: {
                position: 'left',
                verticalAlign: 'middle',
                align: 'right',
                fontSize: 9
              }
            },
            leaves: {
              label: {
                normal: {
                  position: 'right',
                  verticalAlign: 'right',
                  align: 'left'
                }
              }
            }
          }
        ]
      }
      myChart.setOption(option)
      window.onresize = function () {
        myChart.resize()
      }
      myChart.on('click', (params) => {
        if (this.clickedName !== params.name) {   // 判断跟上次点击的是不是同一个节点
          this.clickedName = params.name
          this.drawTree(this.chartData)
        }
        this.showRMenu = false
      })
    },

    // 获取表格数据
    getTableData (page) {
      let self = this
      axios({
        url: HEADER + '/energyAnalysis/check_getMeterTreeData1.do',
        params: {
          location_id: this.location_id,
          beginDate: this.startDate,
          endDate: this.endDate,
          meterId: this.inputCode,
          page: page
        }
      })
        .then(({data}) => {
          this.tableData = data.data.list
          this.allRow = data.data.allRow
        })
    },
    // 比较起始和结束时间
    compareDte () {
      let sDate = new Date(this.startDate.replace(/-/g, '/'))
      let eDate = new Date(this.endDate.replace(/-/g, '/'))
      if (sDate > eDate) {
        this.$Modal.warning({
          content: '起始时间不能大于结束时间'
        })
        setTimeout(() => {
          this.startDate = ''
          this.endDate = ''
        }, 10)
      }
    },
    getSDate (e) {
      this.startDate = e
      this.compareDte()
      sessionStorage.setItem('wastageSTime', e)
    },
    getEDate (e) {
      this.endDate = e
      this.compareDte()
      sessionStorage.setItem('wastageETime', e)
    },

    // 获取电表编号列表
    getMidList () {
      let self = this
      axios({
        url: HEADER + '/energyAnalysis/check_getMeterTreeData.do',
        params: {
          location_id: this.location_id
        }
      })
        .then(({data}) => {
          for (let item of data.data) {
            self.midArr.push({value: item.meterId, label: item.meterId})
          }
        })
    },

    selectTab (e) {
      this.whichTab = e.target.getAttribute('data-tab')
      if (this.whichTab === 'list') {
        this.location_id = sessionStorage.getItem('unitId')
        if (this.location_id) {
          this.getMidList()
          this.getTableData()
        }
      }
    },

    getSonData (e) {
      this.location_id = e
      if (this.location_id) {
        if (this.whichTab === 'list') {
          this.getMidList()
        } else {
          this.getChartData()
        }
      }
    },

    // 分页
    getCurrentPage (e) {
      this.getTableData(e)
    }
  },
  mounted () {
    let self = this

    this.location_id = sessionStorage.getItem('unitId')
    if (this.location_id) {
      this.getTableData()
      this.getChartData()
    }

    // 右击事件
    document.getElementById('chart-wrapper').oncontextmenu = function (e) {
      e.preventDefault()
      if (this.lastChild.style.display === 'block') {
        console.log(this.lastChild.innerText)
        self.showRMenu = true
        setTimeout(() => {
          let menu = document.getElementById('right-menu')
          menu.style.left = e.clientX - 334 + 'px'
          menu.style.top = e.clientY - 334 + 'px'
        }, 1)
      }
      else {
        self.showRMenu = false
      }
    }
    document.getElementById('chart-wrapper').onclick = function () {
      self.showRMenu = false
    }
  }
})