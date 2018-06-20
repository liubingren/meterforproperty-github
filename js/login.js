import { Vue, iView, HEADER,axios } from './general.js'
import '../css/login.less'

//const HEADER = 'http://172.16.31.217:8030/meterforproperty/'

let loginVm = new Vue({
  el: '#loginForm',
  data: {
    userInfor:{
      userName:'',
      passWord:''
    },
    flag:false,
    checkCode:'',
    picLyanzhengma:''
  },
  mounted(){
    this.createCode()
  },
  methods:{
    //验证码
    createCode(){
      //先清空验证码的输入
      this.code = "";
      this.checkCode = "";
      this.picLyanzhengma = "";
      //验证码的长度
      let codeLength = 4;
      //随机数
      let random = new Array( 1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
      )
      for(let i = 0; i < codeLength; i++) {
        //取得随机数的索引（0~35）
        let index = Math.floor(Math.random()*36);
        //根据索引取得随机数加到code上
        this.code += random[index];
      }
      //把code值赋给验证码
      this.checkCode = this.code;
    },
    //提交登录信息校验
    postUserInfor(){
      let THIS = this
      if (this.userInfor.userName === '') {
        this.showmag('false','用户名不能为空！')
        document.getElementById('userName').focus()
        this.flag = false
        return false

      }
      if (this.userInfor.passWord === '') {
        this.showmag('false','密码不能为空！')
        document.getElementById('passWord').focus()
        this.flag = false
        return false
      }
      if (this.picLyanzhengma === '') {
        this.showmag('false','验证码不能为空！')
        document.getElementById('yanzhengma').focus()
        this.flag = false
        return false
      }else {
        if(this.picLyanzhengma.toLocaleLowerCase() === this.checkCode.toLocaleLowerCase()){
          this.flag = true
        }else{
          this.showmag('false','验证码错误！')
          this.flag = false
          return false
        }
      }
      if (this.flag){
        axios({
          method: 'post',
          url:HEADER +'login/login.do',
          params: {
            username: this.userInfor.userName,
            password: this.userInfor.passWord
          }
        }).then(function(res){
           if(res.data.code === 2){
             THIS.showmag('false','用户名或密码错误！')
           }else if(res.data.code === 1){
             THIS.showmag('true','登录成功！')
             localStorage.setItem('userName',THIS.userInfor.userName)
             window.location.href = './home_page.html'
           }
          })
      }
    },
    //信息提示
    showmag (arg,msg) {
      this.$Message.config({
        top: 30,
        duration: 1
      })
      if(arg === 'true'){
        this.$Message.success(msg)
      }else {
        this.$Message.error(msg);
      }
    }
  }
})

