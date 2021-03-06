import { Vue, HEADER, axios,isShowBtn } from './general.js'
import '../css/unit_management.less'

let edVM = new Vue({
  el: '#unit_management',
  data: {
    showModal: false,
    addFlag: true,
    addModal: false,
    unitModal: false,
    file: null,
    downUrl: HEADER + '/location/templatedown_downImportLocationDemo.do',//模板下载
    importUrl: '/location/import_importLocation.do',
    loading: true,
    deleteSureModal: false,
    location_id: '',
    list: [],
    //添加
    pname: '',
    pnameId: '',
    name: sessionStorage.getItem('unitName'),
    newName: '',
    principal: '',
    phonenumber: '',
    email: '',
    address: '',
    longitude: '',
    latitude: '',
    flag: true,
    areaLevel:4,//小区
    //邮箱
    reg: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
    //电话
    regphone: /^1[34578]\d{9}$/,
    addBtn:false,
    editBtn:false,
    delBtn:false,
    expBtn:false,
    thisE:''
  },
  mounted() {
    this.showSelectInfor(this.location_id)
  },
  methods: {
    // 获取树形图子组件数据
    getSonData(e) {
        this.location_id = e
        this.showSelectInfor(this.location_id)
        this.name = sessionStorage.getItem('unitName') 
        this.thisE = e
        isShowBtn()
    },

    //显示选中的区域的信息
    showSelectInfor(id) {
      if (!id) {
        id = sessionStorage.getItem('unitId')
      }
      let THIS = this
      THIS.addModal = false
      if (id) {
        axios({
          url: HEADER + '/location/check_getLocationByID.do',
          params: {
            id: id//小区编号
          }
        }).then(function (response) {
          if (response.data.data) {
            if(response.data.data.type === 4){
              THIS.showModal = true
              THIS.addFlag = true
              THIS.addModal = false
              
              THIS.addBtn = false
              THIS.editBtn = true
              THIS.delBtn = true
              THIS.expBtn = false
            }else{
              THIS.showModal = false
            }
            if(response.data.data.type === 3){
              THIS.addBtn = true
              THIS.delBtn = false
              THIS.editBtn = false
              THIS.expBtn = true
            }
            if(response.data.data.type <= 2){
              THIS.addModal = false

              THIS.addBtn = false
              THIS.delBtn = false
              THIS.editBtn = false
              THIS.expBtn = false
            }
            THIS.list = response.data.data
            THIS.areaLevel = response.data.data.type
          }
        })
      } else {
        this.instance('warning', '请选择小区单位！')
      }
    },
    //显示新建
    addModelInfor() {
        let id = sessionStorage.getItem('unitId')
        if (id) {
          this.addModal = true
          this.showModal = false
          this.pname = this.list.name
          this.pnameId = this.list.id
        }
    },

    //提交添加信息
    postAddInfor() {
      let THIS = this
      this.flag = true
      if (this.newName === '') {
        this.inputTip('单位名称不能为空！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (this.principal === '') {
        this.inputTip('联系人不能为空！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (this.phonenumber === '') {
        this.inputTip('联系电话不能为空！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (!this.regphone.test(this.phonenumber)) {
        this.inputTip('请输入正确的联系电话！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (this.email === '') {
        this.inputTip('联系邮箱不能为空！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (!this.reg.test(this.email)) {
        this.inputTip('请输入正确的联系邮箱格式！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (this.address === '') {
        this.inputTip('联系地址不能为空！')
        this.flag = false
        this.banSureBut()
        return false
      }
       if (this.longitude === '') {
        this.inputTip('请输入准确的联系地址！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (this.flag) {
        axios({
          url: HEADER + '/location/add_addLocation.do',
          method: "post",
          params: {
            pid: this.pnameId,
            name: this.newName,
            principal: this.principal,
            phonenumber: this.phonenumber,
            email: this.email,
            address: this.address,
            longitude: this.longitude,
            latitude: this.latitude,
          }
        }).then(function (response) {
          if (response.data.code === 1) {
            THIS.instance('success', '新建成功！')
            let id = sessionStorage.getItem('unitId')
            THIS.$refs.treeChild.treeData[0].children = []
            THIS.$refs.treeChild.provincesArr = []
            THIS.$refs.treeChild.citiesArr = []
            THIS.$refs.treeChild.districtsArr = []
            THIS.$refs.treeChild.unitsArr = []
            THIS.$refs.treeChild.getInputArea(id)

            THIS.addModal = false
            THIS.showModal = true
            THIS.addFlag = true
          } else {
            THIS.instance('error', response.data.msg)
          }
        })
      }
    },

    //点击编辑
    updateModel() {
        let id = sessionStorage.getItem('unitId')
        if (id) {
          this.showModal = true
          this.addFlag = false
          this.addModal = false
        }
    },
    //提交编辑
    updateInfor() {
      let id = sessionStorage.getItem('unitId')
      let THIS = this
      this.flag = true
      if (this.list.name === '') {
        this.inputTip('单位名称不能为空！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (this.list.principal === '') {
        this.inputTip('联系人不能为空！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (this.list.phonenumber === '') {
        this.inputTip('联系电话不能为空！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (!this.regphone.test(this.list.phonenumber)) {
        this.inputTip('请输入正确的联系电话！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (this.list.email === '') {
        this.inputTip('联系邮箱不能为空！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (!this.reg.test(this.list.email)) {
        this.inputTip('请输入正确的联系邮箱格式！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (this.list.address === '') {
        this.inputTip('联系地址不能为空！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (this.list.longitude === '') {
        this.inputTip('请输入准确的联系地址！')
        this.flag = false
        this.banSureBut()
        return false
      }
      if (this.flag) {
        axios({
          url: HEADER + '/location/update_updateLocation.do',
          method: "post",
          params: {
            id: id,
            pid: this.list.pnameId,
            name: this.list.name,
            principal: this.list.principal,
            phonenumber: this.list.phonenumber,
            email: this.list.email,
            address: this.list.address,
            longitude: this.list.longitude,
            latitude: this.list.latitude,
          }
        }).then(function (response) {
          if (response.data.code === 1) {
            THIS.instance('success', '编辑成功！')
            THIS.addFlag = true
            sessionStorage.setItem('unitName', THIS.list.name)
            THIS.name = THIS.list.name
          } else {
            THIS.instance('error', '编辑失败！')
          }
        })
      }
    },

    //确认删除弹窗
    sureDelete() {
        let id = sessionStorage.getItem('unitId')
        if (id) {
          this.deleteSureModal = true
        }   
    },
    //提交删除
    deleteInfor() {
      let id = sessionStorage.getItem('unitId')
      let THIS = this
      axios({
        url: HEADER + '/location/delete_delLocation.do',
        method: "post",
        params: {
          id: id
        }
      }).then(function (response) {
        if (response.data.code === 1) {
          THIS.instance('success', '删除成功！')
          sessionStorage.clear()
          THIS.$refs.treeChild.treeData[0].children = []
          THIS.$refs.treeChild.provincesArr = []
          THIS.$refs.treeChild.citiesArr = []
          THIS.$refs.treeChild.districtsArr = []
          THIS.$refs.treeChild.unitsArr = []
          THIS.$refs.treeChild.initTree()

          THIS.addBtn = false
          THIS.delBtn = false
          THIS.editBtn = false
          THIS.expBtn = false

          THIS.showModal = false

        } else {
          THIS.instance('error', '删除失败！')
        }
      })
    },
    //导入弹窗
    importModel() {
        let id = sessionStorage.getItem('districtId')
        if (id) {
          this.unitModal = true
        }
    },
    handleUpload(file) {
      this.file = file
      return false
    },
    postImportInfor() {
      let THIS = this
      let id = sessionStorage.getItem('districtId')
      if (this.file !== null) {
        let formData = new FormData()
        let url = HEADER + this.importUrl
        formData.append('file', this.file)
        formData.append('pid', id)
        axios.post(url, formData).then(function (res) {
          if (res.data.code === 1) {
            THIS.instance('success', '导入成功！')
            let id = sessionStorage.getItem('unitId')
            THIS.$refs.treeChild.treeData[0].children = []
            THIS.$refs.treeChild.provincesArr = []
            THIS.$refs.treeChild.citiesArr = []
            THIS.$refs.treeChild.districtsArr = []
            THIS.$refs.treeChild.unitsArr = []
            THIS.$refs.treeChild.getInputArea(id)
            THIS.addFlag = true
          } else {
            THIS.instance('error', res.data.msg)
          }
          THIS.file = null
          THIS.banSureBut()
          THIS.unitModal = false
        })
      } else {
        this.$Message.warning('请选择上传文件！')
        THIS.banSureBut()
      }

    },

    //获取经纬度
    getLongLat(type) {
      let THIS = this
      let address
      if (type === 1) {
        address = this.address
      } else {
        address = this.list.address
      }
      axios({
        url: HEADER + '/location/check_getAddressLatLon.do',
        params: {
          address: address,
          ak: 'oIlwMrZYdYeZL8CH1pH6vm8KYR3C9TLe'
        }
      }).then(function (response) {
        if (response.data.data) {
          if (type === 1) {
            THIS.longitude = response.data.data.lng
            THIS.latitude = response.data.data.lat
          } else {
            THIS.list.longitude = response.data.data.lng
            THIS.list.latitude = response.data.data.lat
          }
          THIS.flag = true
        }else{
          THIS.instance('warning', '请填写明确的联系地址！')
        }
      })
    },

    //取消按钮
    cancel(type) {
      if(type === 1){//编辑
        this.showModal = true
        this.addFlag = true
        this.addModal = false
      }else{
        this.showModal = false
        this.addFlag = false
        this.addModal = false
      }
    },
    //提示框
    instance(type, contentData) {
      const title = '提示信息';
      const content = '<p>' + contentData + '</p>';
      switch (type) {
        case 'success':
          this.$Modal.success({
            title: title,
            content: content
          })
          break
        case 'error':
          this.$Modal.warning({
            title: title,
            content: content
          });
          break
          case 'warning':
          this.$Modal.warning({
            title: title,
            content: content
          });
          break
      }
    },
    //输入提示框
    inputTip(msg){
      this.$Message.config({
        top: 150
      })
      this.$Message.warning(msg)
    },
    //禁止对话框’确定‘后关闭
    banSureBut() {
      setTimeout(() => {
        this.loading = false;
        this.$nextTick(() => {
          this.loading = true;
        });
      }, 1000);
    }
  }
})