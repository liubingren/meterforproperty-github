import { Vue, HEADER, axios, hidePage } from './general.js'
import '../css/user_management.less'

let edVM = new Vue({
  el: '#user_management',
  data: {
    list: [],
    selectedlist:'',
    selected:'',
    userModal: false,//弹窗
    loading:true,
    isAddModal: true,
    isUpateModal: false,
    isAddUpdateModal:true,
    importModal: false,
    id:'',
    userstatus: '启用',
    userName:'',
    passWord:'',
    fullName:'',
    sex:'男',
    phoneNumber:'',
    email:'',
    role:'',
    rid:'',
    roleList:[],
    companyName:'',
    companyAddr:'',
    //模板下载
    downUrl:'',
    file: null,
    importUrl: 'user/import_importUser.do',
    //总条数
    totalpage:0,
    //当前页 
    pageCurrent:1,  
    //邮箱
    reg: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
    //电话
    regphone: /^1[34578]\d{9}$/
  },
  mounted() {
     this.getUserInfor(10, 1),
     this.getRoleInfor(),
     this.downUrl = HEADER + 'user/check_downImportUserDemo.do'   
  },
  methods: {
    //获取用户列表信息
    getUserInfor(pagesize, page) {
      let THIS = this
      let dataArr
      this.list = []
      axios({
        url: HEADER + 'user/check_UserForPage.do',
        params: {
          pagesize: pagesize,
          page: page
        }
      }).then(function (response) {
        dataArr = response.data.list
        THIS.totalpage = response.data.allRow
        hidePage(THIS.totalpage)
        for (let i = 0; i < dataArr.length; i++) {
          THIS.list.push({
            id: dataArr[i].id,
            username: dataArr[i].username,
            name: dataArr[i].name,
            sex: dataArr[i].sex,
            phonenumber: dataArr[i].phonenumber,
            email: dataArr[i].email,
            rname: dataArr[i].rname,
            rid:dataArr[i].roleid,
            status: (dataArr[i].status === 1 ? '启用' : '禁用'),
            password:dataArr[i].password,
            companyname:dataArr[i].companyname,
            companyaddr:dataArr[i].companyaddr,
          })
        }
      })
    },
    //获取用户角色
    getRoleInfor(){
      let THIS = this
      let dataArr
      axios({
        url: HEADER + 'user/check_RoleList.do',
      }).then(function(response){
        dataArr = response.data.data
        for(let i = 0 ; i < dataArr.length; i++){
          THIS.roleList.push(
            {roleId:dataArr[i].id,roleName:dataArr[i].remark,rn:dataArr[i].name}
          )
        }
      })
    },
    // 打开添加弹窗
    openAddModal() {
      this.userModal = true
      this.isAddModal = true
      this.isUpateModal = false
      this.isAddUpdateModal=true
      this.importModal = false 
      //清空
      this.userName = this.fullName = this.phoneNumber = this.email = this.rid = this.companyName = this.companyAddr = this.passWord = ""
      this.sex = '男'
      this.userstatus = "启用"
    },
    // 打开编辑弹窗
    openEditModal(e,index) {
      this.selectedlist = JSON.parse(JSON.stringify(this.list[index]))
      this.selected = index
      this.userModal = true
      this.isAddModal = false
      this.isUpateModal = true
      this.isAddUpdateModal=true
      this.importModal = false
      //获取对应信息
      this.id = e.target.parentNode.getAttribute('data-id')
      this.userName = this.selectedlist.username
      this.fullName = this.selectedlist.name
      this.sex = this.selectedlist.sex
      this.phoneNumber =  this.selectedlist.phonenumber
      this.email =  this.selectedlist.email
      this.rid = this.selectedlist.rid
      this.userstatus = this.selectedlist.status
      this.companyName =  this.selectedlist.companyname
      this.companyAddr =  this.selectedlist.companyaddr
      this.passWord = e.target.parentNode.getAttribute('data-psd')
    },
    // 打开导入弹窗
    openImportModal() {
      this.userModal = true    
      this.isAddModal = false 
      this.isUpateModal = false
      this.isAddUpdateModal=false
      this.importModal = true
    },
   
    //提交信息
    postInfor(){
      //新建
      if(this.isAddModal === true){
        let THIS = this
        let flag = true
        if(this.userName === ''){
          this.$Message.error('用户名不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.passWord === ''){
          this.$Message.error('密码不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.fullName === ''){
          this.$Message.error('姓名不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.sex === ''){
          this.$Message.error('性别不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.phoneNumber === ''){
          this.$Message.error('手机号不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(!this.regphone.test(this.phoneNumber)){
          this.$Message.error('请输入正确手机号！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.email === ''){
          this.$Message.error('邮件不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.rid === ''){
          this.$Message.error('请选择角色！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.companyname === ''){
          this.$Message.error('公司名称不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.companyAddr === ''){
          this.$Message.error('公司地址不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(!this.reg.test(this.email)){
          this.$Message.error('请输入正确邮件格式！')
          flag = false
          this.banSureBut()
          return false
        }
        
        if(flag){
          let dataList = {
            id:this.id,
            username:this.userName,
            name:this.fullName,
            password:this.passWord,
            phonenumber:this.phoneNumber,
            sex:this.sex,
            email:this.email,
            rid:this.rid,
            status:(this.userstatus === '启用' ? 1 : 0),
            companyname:this.companyName,
            companyaddr:this.companyAddr
          }
          axios({
            url: HEADER + 'user/add_User.do',
            method:"POST",
            params:dataList
          }).then(function(response){
              if(response.data.code === 1){
                THIS.instance('success', '新建成功！')
                THIS.list.unshift(dataList)//在头部添加元素
                THIS.pageCurrent = 1
                THIS.getUserInfor(10, THIS.pageCurrent)
              }else{
                THIS.instance('error', response.data.msg)
              }
              THIS.loading = false
              THIS.userModal = false
          }) 
        }
        
      }
      // 编辑
      if(this.isUpateModal === true){
        let THIS = this
        let flag = true
        if(this.userName === ''){
          this.$Message.error('用户名不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.passWord === ''){
          this.$Message.error('密码不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.fullName === ''){
          this.$Message.error('姓名不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.sex === ''){
          this.$Message.error('性别不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.phoneNumber === ''){
          this.$Message.error('手机号不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(!this.regphone.test(this.phoneNumber)){
          this.$Message.error('请输入正确手机号！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.email === ''){
          this.$Message.error('邮件不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.rid === ''){
          this.$Message.error('请选择角色！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.companyname === ''){
          this.$Message.error('公司名称不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(this.companyAddr === ''){
          this.$Message.error('公司地址不能为空！')
          flag = false
          this.banSureBut()
          return false
        }
        if(!this.reg.test(this.email)){
          this.$Message.error('请输入正确邮件格式！')
          flag = false
          this.banSureBut()
          return false
        }
        if(flag){
          axios({
            url: HEADER + 'user/update_User.do',
            method:"POST",
            params:{
              id:this.id,
              username:this.userName,
              name:this.fullName,
              password:this.passWord,
              phonenumber:this.phoneNumber,
              sex:this.sex,
              email:this.email,
              rid:this.rid,
              status:(this.userstatus === '启用' ? 1 : 0),
              companyname:this.companyName,
              companyaddr:this.companyAddr
            }
          }).then(function(response){  
            if(response.data.code === 1){
              THIS.instance('success', '修改成功！')
              THIS.getUserInfor(10, THIS.pageCurrent)              
            }else{
              THIS.instance('error', response.data.msg)
            }
            THIS.loading = false
            THIS.userModal = false 
          })
        }
      }
      // 导入
      if(this.importModal === true){
        let THIS = this
        if(this.file !== null){
          let formData = new FormData()
          let url = HEADER + this.importUrl
          formData.append('file', this.file)
          axios.post(url, formData).then(function (res) {
            if (res.data.code === 1) {
              THIS.instance('success', '上传成功！')
              THIS.pageCurrent = 1
              THIS.getUserInfor(10, THIS.pageCurrent)
            }else{
              THIS.instance('error', res.data.msg)
            }
            THIS.file = null
            THIS.loading = false
            THIS.userModal = false
          })
        }else{
          this.$Message.error('请选择上传文件！')
          THIS.loading = false
        }
      }
    },
    //打开文件，获取文件
    handleUpload (file) {
      this.file = file   
      return false
      },
    //删除
    deleteInfor(index){
        let THIS = this
        let dataArr = JSON.parse(JSON.stringify(this.list[index]))
        axios({
          url: HEADER + 'user/delete_User.do',
          method:"POST",
            params:{
              id:dataArr.id
            }
        }).then(function(response){  
          if(response.data.code === 1){
            THIS.instance('success', '删除成功！')
            THIS.getUserInfor(10, THIS.pageCurrent)
          }else{
            THIS.instance('error', response.data.msg)
          }
        })
    },
    //分页
    pageInfor(e){
        this.pageCurrent = e
        this.getUserInfor(10, this.pageCurrent)
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
          });
          break;
        case 'error':
          this.$Modal.error({
            title: title,
            content: content
          });
          break;
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
    },
  }
})