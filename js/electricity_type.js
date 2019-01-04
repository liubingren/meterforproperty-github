import { Vue, HEADER, axios, hidePage, isShowBtn} from './general.js'
import '../css/electricity_type.less'

let edVM = new Vue({
  el: '#electricity_type',
  data: {
    keywords:'',
    list:[],
    //全选
    readMids: [],
    checkStatus: [],
    check : false,
    totalpage: 0,//总条数
    totalP: 0,
    pageCurrent: 1, //当前页 ,
    addrModal:false,
    editOradd:true,
    loading:true,
    electricityType:'',
    deleteSureModal: false,
    deleteSureModalall:false,
    deleteList:'',
    ids:''
  },
  mounted () {
    this.getTypeInfor(1)
  },
  methods: {
    //获取
    getTypeInfor(page) {
        let THIS = this
        THIS.readMids = []
        THIS.checkStatus = []
        axios({
          url: HEADER + 'useElectricityType/check_getUseElectricityTypeForPage.do',
          params: {
            pagesize:10,
            page:page,
            type: this.keywords
          }
        }).then(function (response) {
          THIS.list = []
          if (response.data.data.list) {
            THIS.list = response.data.data.list
            THIS.totalpage = response.data.data.allRow
            hidePage(THIS.totalpage)
          }
        })
      },
    postInfor(){
        if(this.editOradd){
            this.postAddInfor()
        }else{
            this.postEditInfor()
        }
    },
    //添加
    addType(){
        this.addrModal = true
        this.editOradd = true
        this.electricityType = ''
    },
    postAddInfor(){
        let THIS = this
        if(THIS.electricityType === ''){
            THIS.$Message.warning('请输入用电类型！')
            THIS.banSureBut()
            return false
        }
        axios({
            url: HEADER + 'useElectricityType/add_addUseElectricityType.do',
            method:"POST",
            params:{
                type: THIS.electricityType
            }
        }).then(function(response){
              if(response.data.code === 1){
                THIS.instance('success', '新建成功！')
                THIS.pageCurrent = 1
                THIS.getTypeInfor(THIS.pageCurrent)
              }else{
                THIS.instance('error', response.data.msg)
              }
              THIS.banSureBut()
              THIS.addrModal = false
        })
    },
    //编辑
    openEditModel(index){
        this.addrModal = true
        this.editOradd = false
        this.deleteList = JSON.parse(JSON.stringify(this.list[index]))
        this.electricityType = this.deleteList.type
    },
    postEditInfor(){
        let THIS = this
        if(THIS.electricityType === ''){
            THIS.$Message.warning('请输入用电类型！')
            THIS.banSureBut()
            return false
        }
        axios({
            url: HEADER + 'useElectricityType/update_updateUseElectricityType.do',
            method:"POST",
            params:{
                id:THIS.deleteList.id,
                type: THIS.electricityType
            }
        }).then(function(response){
              if(response.data.code === 1){
                THIS.instance('success', '编辑成功！')
                THIS.pageCurrent = 1
                THIS.getTypeInfor(THIS.pageCurrent)
              }else{
                THIS.instance('error', response.data.msg)
              }
              THIS.banSureBut()
              THIS.addrModal = false
        })
    },
    //删除
    //打开确认删除弹框
    openDeleteModelAll(){
        this.ids = ''
        if(this.readMids.length > 0){
            this.deleteSureModalall = true
        }else{
            this.instance('error', '请构选要删除的用电类型！')
            return false
        }
        
      },
     openDeleteModel(index){
        this.deleteSureModal = true
        this.deleteList = JSON.parse(JSON.stringify(this.list[index]))
      },
      deleteInfor(type){
          let THIS = this 
          if(type === 'batch'){

            for(let i = 0; i < THIS.readMids.length; i++){
                THIS.ids += THIS.readMids[i] +','
            }
          }else{
            THIS.ids = THIS.deleteList.id
          }
          axios({
            url: HEADER + 'useElectricityType/delete_deleteUseElectricityType.do',
            method:"POST",
              params:{
                id:THIS.ids
              }
          }).then(function(response){  
            if(response.data.code === 1){
              THIS.instance('success', '删除成功！')
              THIS.getTypeInfor(THIS.pageCurrent) 
            }else{
              THIS.instance('error', response.data.msg)
            }
            THIS.readMids = []
            THIS.checkStatus = []
          })
      },
    //分页
    pageInfor(e) {
        this.pageCurrent = e
        this.getTypeInfor(this.pageCurrent)
      },
    //多选
    getCheckboxes(e, mid) {
        if (mid) {
          if (e) {
            this.readMids.push(mid)
          }
          else {
            this.readMids.splice(this.readMids.indexOf(mid), 1)
          }
        }
        else {   // 没传 mid 就是全选/全不选的情况
          if (e) {
            
            this.checkStatus = []
            this.readMids = []
            for (let item of this.list) {
              this.readMids.push(item.id)
              this.checkStatus.push(true)
            }
          }
          else {
            this.checkStatus = []
            this.readMids = []
          }
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
            })
            break
        }
      },
       //禁止对话框’确定‘后关闭
    banSureBut(){
        setTimeout(() => {
            this.loading = false;
            this.$nextTick(() => {
                this.loading = true;
            });
          }, 1000);
     }
  }
})