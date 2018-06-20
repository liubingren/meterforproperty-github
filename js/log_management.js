import { Vue,HEADER, axios } from './general.js'
import '../css/log_management.less'

let edVM = new Vue({
  el: '#log_management',
  data:{
    keyword:'',
    list:[]
  },
  mounted(){
    this.getLogInfor()
  },
  methods:{
    //获取日志信息
    getLogInfor(){
      let THIS = this
      axios({
        url: HEADER + 'log/check_listLogs.do',
        params:{
          keywords: this.keyword
        }
      }).then(function(response){
        console.log(response.data)
        //THIS.list = []
      })
    }
  }
})