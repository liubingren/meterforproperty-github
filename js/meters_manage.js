import {
  Vue, iView, axios,
  HEADER, hidePage,
  isShowBtn
} from './general.js'
import '../css/meters_manage.less'

let metersManageVM = new Vue({
  el: '#meter-manage',
  data: {
    meterType: 'publicMeter',   // 判断电表类型以显示相应页面
    meterModal: false,
    isAddModal: true,
    location_id: '',
    metersArr: [],
    countMeters: [],   // 电表安装统计
    allMeters: 0,
    allRow: 0,    // 数据总条数
    currentPage:1,
    lineStatusList: [
      {value: 1, label: '在线'},
      {value: 0, label: '离线'},
      {value: ' ', label: '全部'}
    ],
    lineStatus: ' ',
    codeOrAddr: '',
    placeholder: '请输入电表编号/安装位置',
    exportUrl: 'javascript:void(0)',
    importUrl: HEADER + '/meter/import_importMeters.do',

    // 添加/修改/删除电表
    recordId: '',
    meterCode: '',
    meterReading: '',
    initValue: 0,
    electricPrice: 0,
    currentAddr: '',
    installAddr: '',
    meterLon: '',    // 经度
    meterLat: '',    // 纬度
    buildingNum: '',
    roomNum: '',
    modelLoading: true,
    elecType: '',    // 用电类型
    elecTypeArr:[],   // 用电类型下拉数组
    peakLevelValleyProgramType: '',    // 峰平谷方案类型
    peakLevelValleyProgramArr:[], //峰平谷方案列表下拉数组
    // 相位
    selectedPhase: '',
    selectedStatus: '',
    // 预付费电表
    mkeys: '',
    usercode: '',
    username: '',
    phonenumber: '',
    ratio: '',
    inputError: false,   // 所有输入校验都正确时才为真

    // 抄表数据
    checkStatus: [],
    readModal: false,
    readModelTitle: '实时抄表',
    readMids: [],
    readMeters: [],
    readAddr: '',
    exportRUrl: 'javascript:void(0)',
    lastMonth: '',    // 上月抄表时间
    isMonth: false,

    meterIdArr: []    // 电表记录ID数组
  },
  computed: {
    currentTime: function () {
      let today = new Date()
      let year = today.getFullYear()
      let month = today.getMonth() + 1
      let date = today.getDate()
      let hour = today.getHours()
      let minute = today.getMinutes()
      let second = today.getSeconds()
      let currentTime
      // 小于十则在前面加0
      {
        if (month < 10) {
          month = '0' + month
        }
        if (date < 10) {
          date = '0' + date
        }
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
      return currentTime = year + '.' + month + '.' + date + ' ' +
        hour + ':' + minute + ':' + second
    },
    // 随时拼接模板下载 url
    modelUrl: function () {
      return HEADER + '/meter/templatedown_downImportMeterDemo.do?meter_type=' +
        this.tranType(this.meterType)
    }
  },
  methods: {
    // 绑定电表
    bindMeters () {
      if (this.meterIdArr.length > 3) {
        this.$Modal.warning({
          content: '最多只能只绑定三个电表'
        })
      }
      else if (this.meterIdArr.length < 2) {
        this.$Modal.warning({
          content: '至少要绑定两个电表'
        })
      }
      else {
        let self = this
        axios({
          method: 'post',
          url: HEADER + '/meter/bindingmeter_bindMeterToGroup.do',
          params: {meterids: this.meterIdArr.join(',')}
        })
          .then(({data}) => {
            if (data.code === 1) {
              this.$Modal.success({
                content: data.msg
              })
              self.checkStatus = []
              self.meterIdArr = []
              self.loadMeters(self.location_id)
            }
            else {
              this.$Modal.error({
                content: data.msg
              })
            }
          })
      }
    },
    // 解绑电表
    unBindMeters () {
      axios({
        method: 'post',
        url: HEADER + '/meter/untiedmeter_delBindMeterToGroup.do',
        params: {
          meterids: this.meterIdArr.join(',')
        }
      })
        .then(({data}) => {
          if (data.code === 1) {
            let self = this
            this.$Modal.success({
              content: data.msg
            })
            self.checkStatus = []
            self.meterIdArr = []
            self.loadMeters(self.location_id)
          }
          else {
            this.$Modal.error({
              content: data.msg
            })
          }
        })
    },

    // 导入文件/批量更新
    importMeters (e, isUpdate) {
      let formData = new FormData()
      formData.append('meter_type', this.tranType(this.meterType))
      formData.append('file', e.target.files[0])
      let url = ''
      if (isUpdate) {   // 批量更新
        url = HEADER + '/meter/importupdate_importUpateMeters.do'
      }
      else {
        url = HEADER + '/meter/import_importMeters.do'
      }
      console.log('lllllllll')
      axios.post(
        url,
        formData)
        .then(({data}) => {
          if (data.code === 1) {
            this.$Modal.success({
              content: data.msg
            })
            this.loadMeters(this.location_id)
          }
          else {
            this.$Modal.error({
              content: data.msg
            })
          }
          e.target.value=''
        })
    },

    // 将字符串表达的电表类型转换成后台接收的参数
    tranType (meter_type) {
      {
        if (meter_type === 'publicMeter') {
          meter_type = 1
        }
        else if (meter_type === 'userMeter') {
          meter_type = 2
        }
        else if (meter_type === 'prePayMeter') {
          meter_type = 3
        }
        else if (meter_type === 'AGMeter') {
          meter_type = 4
        }
      }
      return meter_type
    },

    // 拼接导出电表列表数据链接
    exportMeters () {
      if (this.location_id) {
        this.exportUrl =
          HEADER + '/meter/export_exportMeter.do?' +
          'meter_type=' + this.tranType(this.meterType) +
          '&location_id=' + this.location_id +
          '&params=' + this.codeOrAddr +
          '&online_status=' + this.lineStatus
      }
      else {
        this.$Modal.warning({
          content: '请先选择小区'
        })
      }
    },

    // 获取多选框数据
    getCheckboxes (e, id, mid) {
      if (mid) {
        if (e) {
          this.readMids.push(mid)
          this.meterIdArr.push(id)
        }
        else {
          this.readMids.splice(this.readMids.indexOf(mid), 1)
          this.meterIdArr.splice(this.meterIdArr.indexOf(id), 1)
        }
      }
      else {   // 没传 mid 就是全选/全不选的情况
        if (e) {
          this.checkStatus = []
          this.readMids = []
          for (let item of this.metersArr) {
            this.readMids.push(item.mid)
            this.meterIdArr.push(item.id)
            this.checkStatus.push(true)
          }
        }
        else {
          this.checkStatus = []
          this.meterIdArr = []
          this.readMids = []
        }
      }
    },

    // 获取抄表数据, 打开抄表弹窗
    getReadData (isMonth) {
      let self = this
      self.isMonth = isMonth
      if (this.readMids.length) {
        self.readModal = true
        let url = ''

        if (isMonth) {   // 月度抄表
          url = HEADER + '/meter/monthrm_countMeterMonthlyReading.do'
        }
        else {
          url = HEADER + '/meter/nowrm_countMeterNowReading.do'
        }

        // 拼接导出链接
        this.exportReadData()

        axios({
          url: url,
          params: {
            mids: self.readMids.join(',')
          }
        })
          .then(({data}) => {
            if (isMonth) {
              self.readMeters = data.data.list
              self.lastMonth = data.data.lastmonth.substr(0)
            }
            else {
              self.readMeters = data.data.list
            }

            let currentLoc = sessionStorage.getItem('currentLoc')
            self.readAddr = currentLoc.substr(currentLoc.lastIndexOf(' ') + 1)
          })
      }
      else {
        this.$Modal.warning({
          content: '请先选择电表'
        })
      }

    },
    // 拼接导出抄表数据链接
    exportReadData () {
      if (this.isMonth) {
        this.exportRUrl = HEADER +
          '/meter/export_exportMeterMonthlyReading.do?mids=' + this.readMids.join()
      } else {
        this.exportRUrl = HEADER +
          '/meter/export_exportMeterNowReading.do?mids=' + this.readMids.join()
      }
    },

    // 获取树形图子组件数据
    getSonData (e) {
      this.location_id = e
      this.loadMeters(this.location_id)
      // 拼接好导出链接
      this.exportMeters()
    },
    // 加载电表表格
    loadMeters (lid, page, lStatus, codeAddr) {
      let self = this
      let meter_type

      // 拼接导出链接
      if (lStatus) {
        this.exportMeters()
      }
      if (codeAddr) {
        codeAddr = codeAddr.trim()
        this.exportMeters()
      }

      // 电表安装统计数据
      if (self.meterType === 'metersStatistics') {
        axios({
          url: HEADER + '/meter/check_countMeter.do',
          params: {
            location_id: lid
          }
        })
          .then(({data}) => {
            self.countMeters = data.data
          })
      }
      else {
        meter_type = self.tranType(self.meterType)
        axios({
          url: HEADER + '/meter/check_getMeterForPage.do',
          params: {
            meter_type: meter_type,
            location_id: lid,
            page: page||this.currentPage,
            online_status: lStatus,
            params: codeAddr
          }
        })
          .then(({data}) => {
            if (data.data) {
              self.metersArr = data.data.list
              self.allMeters = data.data.allRow
              this.currentPage=data.data.currentPage
              hidePage(data.data.allRow)
              self.allRow = data.data.allRow
            }
          })
      }

      // 根据权限隐藏或显示按钮
      setTimeout(() => {
        isShowBtn()
      }, 300)
    },

    // 分页
    getCurrentPage (e) {
      this.loadMeters(this.location_id, e)
      this.currentPage=e
      this.checkStatus = []
      this.meterIdArr = []
      this.readMids = []
    },

    // 切换电表类型 tab，并显示相应的页面内容
    toggleMeterType (e) {
      this.meterType = e.target.getAttribute('data-type')
      this.loadMeters(this.location_id)
      sessionStorage.setItem('mType', this.meterType)
      this.exportMeters()     // 拼接导出链接
      // 清空勾选项
      this.checkStatus = []
      this.meterIdArr = []
      this.readMids = []
      this.codeOrAddr = ''
      switch (this.meterType) {
        case 'publicMeter':
          this.placeholder = '请输入电表编号/安装位置'
          break
        case 'userMeter'||'AGMeter':
          this.placeholder = '请输入电表编号/楼栋号/房号'
          break
        case 'prePayMeter':
          this.placeholder = '请输入电表编号/用户名称/用户编号'
          break
      }
    },

    // 打开添加电表弹窗
    openAddModal () {
      let areaLevel = sessionStorage.getItem('areaLevel')
      if (areaLevel !== '4') {
        this.$Modal.warning({
          title: '提示',
          content: '请先进入小区或单位层级'
        })
      }
      else {
        this.meterModal = true
        this.isAddModal = true
        this.getAddrLng()
        // 清空输入项
        {
          this.meterCode = ''
          this.meterReading = ''
          this.initValue = ''
          this.electricPrice = ''
          this.installAddr = ''
          this.selectedPhase = ''
          this.selectedStatus = undefined
          this.buildingNum = ''
          this.roomNum = ''
          this.mkeys = ''
          this.usercode = ''
          this.username = ''
          this.phonenumber = ''
          this.ratio = ''
          this.elecType = ''
          this.peakLevelValleyProgramType = ''
          this.meterLon=''
          this.meterLat=''
        }
        switch (this.meterType) {
          case 'userMeter':
            this.elecType = '居民住宅'
            break
          case 'prePayMeter':
            this.elecType = '商铺'
            break
        }
      }
    },
    // 打开编辑电表弹窗
    openEditModal (rId, code, reading, initValue, price, installAddr,
                   phase, type, status, building, room_number,
                   mkeys, usercode, username, phonenumber, ratio, use_electricity_type_id,plv_id) {
      this.recordId = rId
      // 显示原本的值
      if (status === '启用') {
        this.selectedStatus = '1'
      } else {
        this.selectedStatus = '0'
      }
      {
        this.meterCode = code
        this.meterReading = reading
        this.initValue = initValue
        this.electricPrice = price
        this.installAddr = installAddr
        this.selectedPhase = phase
        this.buildingNum = building
        this.roomNum = room_number
        this.mkeys = mkeys
        this.usercode = usercode
        this.username = username
        this.phonenumber = phonenumber
        this.ratio = ratio
        this.elecType = use_electricity_type_id
        this.peakLevelValleyProgramType = plv_id
      }
      this.getAddrLng('edit')
    },
    // 数字校验
    isNum (val) {
      let reg = /^(-?\d+)(\.\d+)?$/
      if (!reg.test(val)) {
        this.$Message.warning('请输入数字')
        this.inputError = false
      } else {
        this.inputError = true
      }
    },
    // 手机号校验
    isPhoneNum (val) {
      let reg =
        /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
      if (!reg.test(val)) {
        this.$Message.warning('请输入正确的手机号码')
        this.inputError = false
      } else {
        this.inputError = true
      }
    },
    // 显示地址, 查询并输入经纬度
    getAddrLng (type) {
      // 显示当前地址
      this.currentAddr = sessionStorage.getItem('currentLoc')
      let re = / /g
      let cAddrStr = this.currentAddr.replace(re, '')+this.installAddr
      let self = this
      axios({
        url: HEADER + '/location/check_getAddressLatLon.do',
        params: {
          address: cAddrStr,
          ak: 'oIlwMrZYdYeZL8CH1pH6vm8KYR3C9TLe'
        }
      })
        .then(({data}) => {
          if (data.data) {
            let resData = JSON.parse(data.data)
            self.meterLon = resData.lng
            self.meterLat = resData.lat
            if(type==='edit'){
              this.meterModal = true
              this.isAddModal = false
              this.inputError = true
            }
          }
        })
    },

    // 提交添加/编辑的电表信息
    submitMeter () {
      let self = this
      // 添加
      if (self.isAddModal) {
        if (self.inputError) {
          let userName = document.getElementById('user-name').innerText
          let mType = self.tranType(self.meterType)
          axios({
            method: 'post',
            url: HEADER + '/meter/add_addMeter.do',
            params: {
              meter_type: mType,
              mid: self.meterCode,
              location_id: self.location_id,
              username: userName,
              usercode: self.usercode,
              install_address: self.installAddr,
              mkeys: this.mkeys,
              building: self.buildingNum,
              room_number: self.roomNum,
              ratio: self.ratio,
              phase: self.selectedPhase,
              price: self.electricPrice,
              initval: self.initValue,
              phonenumber: self.phonenumber,
              status: parseInt(self.selectedStatus),
              longitude: self.meterLon,
              latitude: self.meterLat,
              use_electricity_type_id: self.elecType,
              plv_id: self.peakLevelValleyProgramType
            }
          })
            .then(({data}) => {
              if (data.code === 1) {
                this.$Modal.success({
                  content: data.msg
                })
                this.loadMeters(this.location_id)
                this.meterModal = false
              }
              else {
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
        }
        else {
          this.$Message.error('输入有误')
          setTimeout(() => {
            this.modelLoading = false
            this.$nextTick(() => {
              this.modelLoading = true
            })
          }, 500)
        }
      }
      // 编辑
      else {
        if (self.inputError) {
          let userName = document.getElementById('user-name').innerText
          let mType = self.tranType(self.meterType)
          axios({
            method: 'post',
            url: HEADER + '/meter/update_updateMeter.do',
            params: {
              id: self.recordId,
              meter_type: mType,
              mid: self.meterCode,
              location_id: self.location_id,
              username: userName,
              usercode: self.usercode,
              install_address: self.installAddr,
              mkeys: this.mkeys,
              building: self.buildingNum,
              room_number: self.roomNum,
              ratio: self.ratio,
              phase: self.selectedPhase,
              price: self.electricPrice,
              initval: self.initValue,
              phonenumber: self.phonenumber,
              status: parseInt(self.selectedStatus),
              longitude: self.meterLon,
              latitude: self.meterLat,
              use_electricity_type_id: self.elecType,
              plv_id: self.peakLevelValleyProgramType
            }
          })
            .then(({data}) => {
              if (data.code === 1) {
                this.$Modal.success({
                  content: data.msg
                })
                this.loadMeters(this.location_id)
                this.meterModal = false
              }
              else {
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
        }
        else {
          this.$Message.info('输入有误')
          setTimeout(() => {
            this.modelLoading = false
            this.$nextTick(() => {
              this.modelLoading = true
            })
          }, 500)
        }
      }
    },

    // 删除电表
    deleteMeter (id) {
      this.recordId = id
      this.$Modal.confirm({
        content: '确认删除此电表?',
        onOk: () => {
          axios({
            method: 'post',
            url: HEADER + '/meter/delete_deleteMeter.do',
            params: {
              id: id
            }
          })
            .then(({data}) => {
              if (data.code === 1) {
                this.loadMeters(this.location_id)
              }
              else {
                setTimeout(() => {
                  this.$Modal.remove()
                  this.$Modal.error({
                    content: data.msg
                  }, 2000)
                })
              }
            })
        }
      })
    }
  },
  mounted () {
    // 隐藏分页
    hidePage(this.allRow)

    let uId = sessionStorage.getItem('unitId')
    let mt = sessionStorage.getItem('mType')
    if (mt) {
      this.meterType = mt
    }
    if (uId) {
      this.location_id = uId
      this.loadMeters(uId)
      this.exportMeters()
    }
    axios.get(HEADER+'meter/check_getUseElectricityTypeList.do')
    .then((response) => {
        this.elecTypeArr=response.data.data
    })
    .catch(function (error) {
        console.log(error)
    });

    axios.get(HEADER+'meter/check_getPeakLevelValleyProgramList.do')
    .then((response) => {
        this.peakLevelValleyProgramArr=response.data.data
    })
    .catch(function (error) {
        console.log(error)
    });
  }
})