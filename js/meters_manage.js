import {
  Vue, iView, axios,
  HEADER, hidePage
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
    lineStatusList: [
      {value: 1, label: '在线'},
      {value: 0, label: '离线'},
      {value: '', label: '全部'}
    ],

    // 添加/修改电表弹框数据
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
    // 相位
    phaseList: [
      {value: 'A', label: 'A'},
      {value: 'B', label: 'B'},
      {value: 'C', label: 'C'}
    ],
    selectedPhase: '',
    deviceStatus: [
      {value: 1, label: '使用'},
      {value: 0, label: '停用'}
    ],
    selectedStatus: '',
    // 预付费电表
    mkeys: '',
    usercode: '',
    username: '',
    phonenumber: '',
    ratio: '',
    inputError: false   // 所有输入校验都正确时才为真
  },
  methods: {
    // 获取树形图子组件数据
    getSonData (e) {
      this.location_id = e
      this.loadMeters(this.location_id)
    },
    // 加载电表表格
    loadMeters (lid, page) {
      let self = this
      let meter_type
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
        {
          if (self.meterType === 'publicMeter') {
            meter_type = 1
          }
          else if (self.meterType === 'userMeter') {
            meter_type = 2
          }
          else if (self.meterType === 'prePayMeter') {
            meter_type = 3
          }
        }
        axios({
          url: HEADER + '/meter/check_getMeterForPage.do',
          params: {
            meter_type: meter_type,
            location_id: lid,
            page: page
          }
        })
          .then(({data}) => {
            if (data.data) {
              self.metersArr = data.data.list
              self.allMeters = data.data.allRow
              hidePage(data.data.allRow)
              self.allRow = data.data.allRow
            }
          })
      }
    },
    getCurrentPage (e) {
      this.loadMeters(e)
    },

    toggleMeterType (e) {
      this.meterType = e.target.getAttribute('data-type')
      this.loadMeters(this.location_id)
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
          this.selectedStatus = ''
        }
      }
    },
    // 打开编辑电表弹窗
    openEditModal (code, reading, initValue, price, installAddr,
                   phase, type, status, building, room_number) {
      this.meterModal = true
      this.isAddModal = false
      this.getAddrLng()
      // 显示原本的值
      {
        this.meterCode = code
        this.meterReading = reading
        this.initValue = initValue
        this.electricPrice = price
        this.installAddr = installAddr
        this.selectedPhase = phase
        this.selectedStatus = status
        this.buildingNum = building
        this.roomNum = room_number
      }
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
        /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|(147))\\d{8}$/
      if (!reg.test(val)) {
        this.$Message.warning('请输入正确的手机号码')
        this.inputError = false
      } else {
        this.inputError = true
      }
    },
    // 显示地址, 查询并输入经纬度
    getAddrLng () {
      // 显示当前地址
      this.currentAddr = sessionStorage.getItem('currentLoc')
      let re = / /g
      let cAddrStr = this.currentAddr.replace(re, '')
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
            let resData = data.data
            self.meterLon = resData.lng
            self.meterLat = resData.lat
          }
        })
    },
    // 提交添加/编辑的电表信息
    submitMeter () {
      if (this.isAddModal) {
        if (this.inputError) {
          let self = this
          let userName = document.getElementById('user-name').innerText
          let mType = 1
          if (self.meterType === 'publicMeter') {
            mType = 1
          }
          else if (self.meterType === 'userMeter') {
            mType = 2
          }
          else if (self.meterType === 'prePayMeter') {
            mType = 3
          }

          if (self.isAddModal === true) {
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
                price: self.price,
                initval: self.initValue,
                phonenumber: self.phoneNumber,
                status: self.selectedStatus,
                longitude: self.meterLon,
                latitude: self.meterLat
              }
            })
              .then(({data}) => {
                console.log(data)
              })
          }
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
      else {

      }
    }
  },
  mounted () {
    hidePage(this.allRow)
  }
})