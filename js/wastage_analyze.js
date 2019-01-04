import {
  Vue,
  axios,
  HEADER
} from './general.js'
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
      level: 0,
      children: []
    },
    clickedName: '', // 点击到的图表节点的名字(当前点击的电表ID, 添加电表时的父ID)
    showRMenu: false, // 显示右键菜单
    addModal: false,
    modelLoading: false,
    inputMId: '',
    mId: '', // 当前电表ID, 删除/升级时用
    pId: '', // 删除子电表时的父电表ID
    freeMeters: [], // 未分配计量关系的电表
    selectedFM: '', // 选中的未分配的电表
    mType: '', // 用电类型
    clickedNodes: [] // 点击过的节点
  },
  methods: {
    // 升级子电表
    updateMeter() {
      this.showRMenu = false
      this.$Modal.confirm({
        onOk: () => {
          axios({
              method: 'post',
              url: HEADER + '/energyWasteAnalysis/update_upgradeMeterTreeLevel.do',
              params: {
                pid: this.pId,
                id: this.mId,
                type: 0
              }
            })
            .then(({
              data
            }) => {
              if (data.code === 1) {
                this.$Message.success(data.msg)
                this.getChartData(1)
              } else {
                this.$Message.error(data.msg)
              }
            })
        }
      })
    },

    // 删除
    deleteMeter(id) {
      this.showRMenu = false
      this.$Modal.confirm({
        content: '确认删除此子电表?',
        onOk: () => {
          axios({
              method: 'post',
              url: HEADER + '/energyWasteAnalysis/delete_delMeterTreeChild.do',
              params: {
                id: this.mId,
                pid: this.pId
              }
            })
            .then(({
              data
            }) => {
              if (data.code === 1) {
                this.$Message.success(data.msg)
                this.getChartData(1)
              } else {
                this.$Message.error(data.msg)
              }
            })
        }
      })
    },

    // 添加子电表
    // 打开弹窗
    openAdd() {
      this.addModal = true
      this.showRMenu = false
      this.getFreeMeters()
    },
    // 加载未分配的电表列表
    getFreeMeters() {
      axios({
          url: HEADER +
            '/energyWasteAnalysis/check_getMeterNotUesd.do?location_id=' +
            this.location_id
        })
        .then(({
          data
        }) => {
          let arr = data.data
          this.mType = arr[0].type
          for (let item of arr) {
            this.freeMeters.push({
              value: item.meterId,
              label: item.meterId
            })
          }
        })
    },

    submitAdd(id) {
      axios({
          method: 'post',
          url: HEADER + '/energyWasteAnalysis/add_addMeterTreeChild.do',
          params: {
            id: id,
            pid: this.clickedName,
            type: 0
          }
        })
        .then(({
          data
        }) => {
          if (data.code === 1) {
            this.$Modal.success({
              content: data.msg
            })
            this.getChartData(2)
          } else {
            this.$Modal.error({
              content: data.msg
            })
            setTimeout(() => {
              this.modelLoading = false
              this.$nextTick(() => {
                this.modelLoading = true
              })
            }, 500)
          }
        })
    },

    // 不能为空
    noEmpty(val) {
      if (val === '') {
        this.$Message.success('此处不能为空!')
      }
    },

    // 获取计量关系数据
    getChartData(isReload) {
      let self = this
      axios({
          url: HEADER + '/energyWasteAnalysis/check_getMeterTreeData.do',
          params: {
            location_id: this.location_id
          }
        })
        .then(({
          data
        }) => {
          let dataList = data.data
          let uName = sessionStorage.getItem('unitName')
          if (dataList.length &&
            this.chartData.name !== uName) { // 避免重复加载同一小区
            this.chartData.name = uName

            this.tranData(dataList, this.chartData.children)
            this.drawTree(this.chartData)
          } else if (isReload) { // 升级/删除节点后重载
            this.chartData.children = []
            this.tranData(dataList, this.chartData.children)
            this.drawTree(this.chartData)
          }
          // else if (isReload === 2) {    // 添加后刷新页面
          //   window.location.reload()
          // }
          else {
            this.chartData.name = uName
            this.chartData.children = []
            this.drawTree(this.chartData)
          }
        })
    },

    // 将后台数据转换为树状图适用的数据
    tranData(bData, tData) {
      for (let item of bData) {
        let tItem = {
          name: '',
          level: 0,
          type: '',
          pId: '',
          children: []
        }
        tItem.name = item.meterId
        tItem.level = item.level
        tItem.type = item.type
        tItem.pId = item.pid
        tData.push(tItem)
      }
    },

    // 渲染图表
    drawTree(data) {
      let self = this
      let myChart = echarts.init(document.getElementById('chart-wrapper'))
      let option = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          position: 'bottom',
          padding: [9, 5, 5, 5]
        },
        series: [{
          type: 'tree',
          data: [data],
          initialTreeDepth: -1, // 默认打开所有节点

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
        }]
      }
      myChart.setOption(option)
      window.onresize = function () {
        myChart.resize()
      }

      // 鼠标移入节点时获取数据
      myChart.on('mouseover', (params) => {
        this.mId = params.name
        this.pId = params.data.pId
      })

      // 树状图点击事件
      myChart.on('click', (params) => {
        let level = params.data.level
        let name = params.name
        let pId = params.data.pId
        if (this.clickedName !== name) { // 判断跟上次点击的是不是同一个节点
          this.clickedName = name
          // 获取子电表
          axios({
              url: HEADER + '/energyWasteAnalysis/check_getMeterTreeDataByMid.do',
              params: {
                location_id: this.location_id,
                meterId: name
              }
            })
            .then(({
              data
            }) => {
              let arr = data.data
              if (arr.length) {
                if (level === '1') { // 如果是第一层电表
                  for (let item of self.chartData.children) {
                    if (item.name === name) { // 匹配当前点击的节点
                      if (!item.children.length) { // 如果已经加载过了则不必重载
                        self.tranData(arr, item.children)
                        myChart.dispose() // 销毁原来的实例
                        self.drawTree(self.chartData)
                        break
                      }
                    }
                  }
                } else if (level === '2') { // 如果是第二层电表
                  for (let item of self.chartData.children) {
                    if (item.name === pId) {
                      for (let i of item.children) {
                        if (i.name === name) {
                          if (!i.children.length) {
                            self.tranData(arr, i.children)
                            myChart.dispose()
                            setTimeout(() => {
                              self.drawTree(self.chartData)
                            }, 300)
                            break
                          }
                        }
                      }
                    }
                  }
                }
                // 如果还有更深层的电表，可到时添加代码……
              }
            })
        }
        this.showRMenu = false
      })
    },

    // 显示搜索的电表
    getSelectedNodes(id) {
      for (let item of this.chartData.children) {
        if (item.name === id) { // 根据 id 匹配
          // 匹配后，调整其样式
          item.label = {
            fontWeight: 'bold',
            backgroundColor: '#dddee1',
            fontSize: 14,
            padding: [6, 2, 2, 2]
          }
          this.drawTree(this.chartData)
          break
        }
      }
    },

    // 获取表格数据
    getTableData(page) {
      let self = this
      axios({
          url: HEADER + '/energyWasteAnalysis/check_getMeterTreeData1.do',
          params: {
            location_id: this.location_id,
            beginDate: this.startDate,
            endDate: this.endDate,
            meterId: this.inputCode,
            page: page
          }
        })
        .then(({
          data
        }) => {
          this.tableData = data.data.list
          this.allRow = data.data.allRow
        })
    },
    // 比较起始和结束时间
    compareDte() {
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
    getSDate(e) {
      this.startDate = e
      this.compareDte()
      sessionStorage.setItem('wastageSTime', e)
    },
    getEDate(e) {
      this.endDate = e
      this.compareDte()
      sessionStorage.setItem('wastageETime', e)
    },

    // 获取电表编号列表
    getMidList() {
      let self = this
      axios({
          url: HEADER + '/energyWasteAnalysis/check_getMeterTreeData.do',
          params: {
            location_id: this.location_id
          }
        })
        .then(({
          data
        }) => {
          for (let item of data.data) {
            self.midArr.push({
              value: item.meterId,
              label: item.meterId
            })
          }
        })
    },

    selectTab(e) {
      this.whichTab = e.target.getAttribute('data-tab')
      if (this.whichTab === 'list') {
        this.location_id = sessionStorage.getItem('unitId')
        if (this.location_id) {
          this.getMidList()
          this.getTableData()
        }
      }
    },

    getSonData(e) {
      this.location_id = e
      if (this.location_id) {
        this.getMidList()
        if (this.whichTab === 'list') {
          this.getTableData()
        } else {
          this.getChartData()
        }
      }
    },

    // 分页
    getCurrentPage(e) {
      this.getTableData(e)
    }
  },
  mounted() {
    let self = this

    this.location_id = sessionStorage.getItem('unitId')
    if (this.location_id) {
      this.getMidList()
      if (this.whichTab === 'list') {
        this.getTableData()
      } else {
        this.getChartData()
      }
    }

    // 右击事件
    document.getElementById('chart-wrapper').oncontextmenu = function (e) {
      e.preventDefault()

      // 如果鼠标在电表节点上右击，则显示右键菜单
      // this.lastChild 是指鼠标悬浮在电表节点上时显示的 tooltip
      if (this.lastChild.style.display === 'block') {
        let thisText = this.lastChild.innerText
        let txtArr = thisText.split('.')
        // 当前表号
        self.clickedName = txtArr[txtArr.length - 1]

        self.showRMenu = true
        setTimeout(() => {
          let menu = document.getElementById('right-menu')
          menu.style.left = e.clientX - 334 + 'px'
          menu.style.top = e.clientY - 334 + 'px'
        }, 1)
      } else {
        self.showRMenu = false // 在其他地方点击鼠标则隐藏右键菜单
      }
    }
    document.getElementById('chart-wrapper').onclick = function () {
      self.showRMenu = false
    }
  }
})