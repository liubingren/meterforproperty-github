import polyfill from 'babel-polyfill';
import axios from 'axios';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import Vue from 'vue/dist/vue';
import '../css/general.less';
import { isRegExp } from 'util';
//引入基本模板
let echarts = require('echarts/lib/echarts')
 
// 引入折线图等组件
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')

// 引入提示框和title组件，图例
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')

const HEADER = 'http://172.16.31.217:8030/meterforproperty/'  // 吕梁锋IP
// const HEADER = 'http://172.16.31.229:8087/meterforproperty/'  // 詹幸禧ip

// const HEADER = 'http://varyagtech.com/meterforproperty/'    // 服务器地址

Vue.use(iView)
Vue.use(polyfill)

Vue.config.productionTip = false

let Event = new Vue()

// // 头部组件
// Vue.component("meter-header", {
//   template: `
// <header>
//       <div class="layout-logo">
//           <i class="logo"></i>
//           <a class="logo-name"
//           href="home_page.html">智慧能源管理平台</a>
//       </div>
//       <Menu class="nav-ul" mode="horizontal" :theme="theme1" active-name="1" accordion>
//           <!--无子页面-->
//           <MenuItem v-for="(item,index) of urls" :key="item.id"
//            :name="index" v-if="!item.children.length">
//               <Icon :type="item.styleclass"></Icon>
//               <a :href="item.url">{{item.name}}</a>
//           </MenuItem>
//           <!--有子页面时-->
//           <Submenu :key="item.id" :name="item.id"
//                     v-else>
//               <template slot="title">
//                   <Icon :type="item.styleclass"></Icon>
//                   <a :href="item.url">{{item.name}}</a>
//               </template>
//               <!--子页面-->
//               <MenuItem v-for="(page,index) of item.children" 
//                         :key="index" :name="item.model">
//                   <a :href="page.url">{{page.name}}</a>
//               </MenuItem>
//           </Submenu>
//       </Menu>
// </header>`,
//   data() {
//     return {
//       theme1: "light",
//       urls: []
//     };
//   },
//   mounted() {
//     axios({
//       url: HEADER + "/resources/check_getCurrentUserResources.do"
//     }).then(({ data }) => {
//       this.urls = data.data;
//       console.log(data.data)
//     });
//   },
//   methods: {

//   }
// });

// 头部组件(可拓展)
Vue.component("meter-header", {
  template: `
<header>
      <div class="layout-logo">
          <i class="logo"></i>
          <a class="logo-name"
          href="home_page.html">智慧能源管理平台</a>
      </div>
      <div class='left' @click="showPage2HeaderItem" v-if="urls.length>8">
          <Icon type="ios-arrow-back" size="24"/>     
      </div>
      <Menu class="nav-ul" mode="horizontal" 
      :theme="theme1" active-name="1" accordion>
          <!--无子页面-->
          <MenuItem v-for="(item,index) of urls" :key="item.id" :class="{hide:(index>7?page2:!page2)}"
           :name="index" v-if="!item.children.length">
              <Icon :type="item.styleclass"></Icon>
              <a :href="item.url">{{item.name}}</a>
          </MenuItem>
          <!--有子页面时-->
          <Submenu :key="item.id" :name="item.id" :class="{hide:(index>7?page2:!page2)}"
                    v-else>
              <template slot="title">
                  <Icon :type="item.styleclass"></Icon>
                  <a :href="item.url">{{item.name}}</a>
              </template>
              <!--子页面-->
              <MenuItem v-for="(page,index) of item.children" 
                        :key="index" :name="item.model">
                  <a :href="page.url">{{page.name}}</a>
              </MenuItem>
          </Submenu>
      </Menu>
      <div class='right' @click="showPage2HeaderItem" v-if="urls.length>8">
          <Icon type="ios-arrow-forward" size="24"/>     
      </div>
</header>`,
  data() {
    return {
      theme1: "light",
      urls: [],
      page2: true
    };
  },
  mounted() {
    axios({
      url: HEADER + "/resources/check_getCurrentUserResources.do"
    }).then(({ data }) => {
      if(sessionStorage.getItem('page2')!==null){
        if(sessionStorage.getItem('page2')==='false'){
          this.page2 = false
        }else{
          this.page2 = true
        }
      }
      this.urls = data.data
    });
  },
  methods: {
    showPage2HeaderItem() {
      this.page2 = !this.page2;
      sessionStorage.setItem('page2',this.page2)
    }
  }
});

// 侧边组件
Vue.component('meter-sider', {
  template: `
<sider class="meter-sider" hide-trigger>
<div class="user-info-bar">
<div :class="['user-avatar', {'woman-avatar': isactive}]"></div>
<div class="user-name" id="user-name">{{ userList.username }}</div>
<div class="user-role">{{ userList.role_name }}</div>
</div>
<div class="user-btn-group">
<div class="user-config" @click="sendusermsg">
<Icon type="gear-a"></Icon>
个人设置
</div>
<div class="pwd-config" @click="sendpwdrmsg">
<Icon type="locked"></Icon>
密码修改
</div>
<i-button class="quit-btn" @click="signOut()">退出</i-button>
</div>
<!--个人设置, 密码弹窗-->
<user-config></user-config>
<pwd-config></pwd-config>
</sider>`,
  mounted() {
    this.getUserList()
  },
  methods: {
    //获取登录人信息
    getUserList() {
      let THIS = this
      axios({
        url: HEADER + '/user/check_getPrincipalUser.do'
      }).then(({
        data
      }) => {
        if (data.data) {
          THIS.userList = data.data
          if (THIS.userList.sex === '女') {
            THIS.isactive = true
          }
        }
      })
    },
    //退出
    signOut() {
      let THIS = this
      axios({
        url: HEADER + '/login/logout.do',
        method: "POST"
      }).then(({
        data
      }) => {
        if (data.code === 1) {
          window.location.href = "login.html"
        }
      })
    },
    sendusermsg() {
      Event.$emit("usermsg", this.userConfigModal, this.userList)
    },
    sendpwdrmsg() {
      Event.$emit("pwdrmsg", this.pwdConfigModal, this.userList)
    }
  },
  data() {
    return {
      userConfigModal: true,
      pwdConfigModal: true,
      userList: [],
      isactive: false
    }
  }
})

// 个人设置组件
Vue.component('user-config', {
  template: `
<modal v-model="userConfigModal" class="set-modal"
title="个人设置" @on-ok="postUserSet()" :loading="loading"
>
<div class="input-bar">
<span><i>*</i>用户名：</span>
<label>{{ userInfor.username }}</label>
</div>
<div class="input-bar">
<span><i>*</i>姓名：</span>
<i-input placeholder="请输入姓名" size="large" v-model="userInfor.name"></i-input>
</div>
<div class="input-bar">
<span><i>*</i>手机：</span>
<i-input placeholder="请输入手机" size="large"v-model="userInfor.phonenumber"></i-input>
</div>
<div class="input-bar">
<span><i>*</i>邮箱：</span>
<i-input placeholder="请输入邮箱" size="large" v-model="userInfor.email"></i-input>
</div>
<div class="input-bar">
<span><i>*</i>角色：</span>
<label>{{ userInfor.role_name }}</label>
</div>
</modal>
`,
  mounted() {
    //接收侧边组件的数据
    Event.$on("usermsg", function (userConfigModal, userInfor) {
      this.userConfigModal = userConfigModal
      this.userInfor = userInfor
    }.bind(this));
  },
  data() {
    return {
      userConfigModal: false,
      userInfor: [],
      reg: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/, //邮箱
      regphone: /^1[34578]\d{9}$/, //电话
      loading: true
    }
  },
  methods: {
    //提交个人设置
    postUserSet() {
      let flag = true
      let THIS = this
      if (this.userInfor.name === '') {
        this.$Message.warning('姓名不能为空！')
        flag = false
        this.banSureBut()
        return false
      }
      if (this.userInfor.phonenumber === '') {
        this.$Message.warning('手机不能为空！')
        flag = false
        this.banSureBut()
        return false
      }
      if (!this.regphone.test(this.userInfor.phonenumber)) {
        this.$Message.warning('请输入正确手机号！')
        flag = false
        this.banSureBut()
        return false
      }
      if (this.userInfor.email === '') {
        this.$Message.warning('邮箱不能为空！')
        flag = false
        this.banSureBut()
        return false
      }
      if (!this.reg.test(this.userInfor.email)) {
        this.$Message.warning('请输入正确邮件格式！')
        flag = false
        this.banSureBut()
        return false
      }
      if (flag) {
        axios({
          url: HEADER + '/user/update_UserByself.do',
          method: "POST",
          params: {
            username: this.userInfor.username,
            name: this.userInfor.name,
            phonenumber: this.userInfor.phonenumber,
            email: this.userInfor.email,
            role_name: this.userInfor.role_name
          }
        }).then(({
          data
        }) => {
          if (data.code === 1) {
            THIS.banSureBut()
            THIS.userConfigModal = false
            THIS.$Modal.success({
              title: '提示信息',
              content: '设置成功！'
            })
          } else {
            THIS.banSureBut()
            THIS.$Modal.error({
              title: '提示信息',
              content: data.msg
            })
          }
        })
      }
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

// 密码设置组件
Vue.component('pwd-config', {
  template: `
<modal v-model="pwdConfigModal" class="set-modal"
title="密码修改" @on-ok="postPwdSet()" :loading="loading"
>
<div class="input-bar">
<span><i>*</i>旧密码：</span>
<i-input type="password" placeholder="请输入旧密码" size="large" v-model="oldPwd"></i-input>
</div>
<div class="input-bar">
<span><i>*</i>新密码：</span>
<i-input type="password" placeholder="请输入新密码" size="large" v-model="newPwd"></i-input>
</div>
<div class="input-bar">
<span><i>*</i>确认密码：</span>
<i-input type="password" placeholder="请再次输入新密码" size="large" v-model="surePwd"></i-input>
</div>
</modal>
`,
  mounted() {
    //接收侧边组件的数据
    Event.$on("pwdrmsg", function (pwdConfigModal, userInfor) {
      this.pwdConfigModal = pwdConfigModal
      this.username = userInfor
    }.bind(this));
  },
  data() {
    return {
      pwdConfigModal: false,
      username: '',
      loading: true,
      oldPwd: '',
      newPwd: '',
      surePwd: ''
    }
  },
  methods: {
    //提交密码设置
    postPwdSet() {
      let flag = true
      let THIS = this
      if (this.oldPwd === '') {
        this.$Message.warning('旧密码不能为空！')
        flag = false
        this.banSureBut()
        return false
      }
      if (this.newPwd === '') {
        this.$Message.warning('新密码不能为空！')
        flag = false
        this.banSureBut()
        return false
      }
      if (this.surePwd === '') {
        this.$Message.warning('请再输入新密码！')
        flag = false
        this.banSureBut()
        return false
      }
      if (this.surePwd !== this.newPwd) {
        this.$Message.warning('确认密码和新密码不一致！')
        flag = false
        this.banSureBut()
        return false
      }
      if (flag) {
        axios({
          url: HEADER + '/user/update_UserPassword.do',
          method: "POST",
          params: {
            username: this.username.username,
            password: this.newPwd,
            comfirmpwd: this.surePwd,
            oldpwd: this.oldPwd
          }
        }).then(({
          data
        }) => {
          if (data.code === 1) {
            THIS.banSureBut()
            THIS.pwdConfigModal = false
            THIS.$Modal.success({
              title: '提示信息',
              content: '修改成功！'
            })
            THIS.oldPwd = ''
            THIS.newPwd = ''
            THIS.surePwd = ''
          } else {
            THIS.banSureBut()
            THIS.$Modal.error({
              title: '提示信息',
              content: data.msg
            })
          }
        })
      }
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

// 树形控件组件
Vue.component('vrg-tree', {
  template: `
    <div>
        <Select class="search-area" v-model="inputArea" 
                filterable clearable 
                :loading="areaLoading"
                @on-query-change="searchUnit($event)"
                @on-change="returnSonData($event,1)">
            <Option v-for="(unit,index) in relatedUnits"
                    :value="unit.value" :key="index">
                        {{unit.label}}
            </Option>
        </Select>
        <Tree class="area-tree"
              :data="treeData"
              :load-data="loadTree"
              @on-select-change="returnSonData($event)">
        </Tree>
    </div>`,
  data() {
    return {
      // 渲染组件的数组
      treeData: [{
        title: '全国',
        expand: true,
        loading: false,
        children: []
      }],
      // 下面五个都是储存区域数据的数组
      areaData: [],
      provincesArr: [],
      citiesArr: [],
      districtsArr: [],
      unitsArr: [],

      inputArea: '',
      relatedUnits: [],
      areaLoading: false,
      // 储存当前各级地址
      currentPro: '',
      currentCity: '',
      currentDis: '',
      currentLocation: ''
    }
  },
  methods: {
    // 向外部返回数据
    returnSonData(e, isInput) {
      if (isInput) {
        this.getInputArea(e, 1)
        this.$emit('father-event', e)
        // 输出的数据存储在 sessionStorage 里
        sessionStorage.setItem('unitId', e)
      } else {
        this.getSelectedArea(e[0])
        this.$emit('father-event', e[0].id)
        sessionStorage.setItem('unitId', e[0].id)
      }
    },

    // 初始化区域树结构
    // isInput 为 true 表示从搜索框获取数据,
    initTree(selectedProvince, selectedCity,
      selectedDistrict, selectedUnit, isInput) {
      let self = this
      axios({
          url: HEADER + '/location/check_getAllLocationByUser.do'
        })
        .then(({
          data
        }) => {
          if (data.data) {
            self.areaData = data.data
            if (isInput) { // 如果是搜索
              let selectedC = []
              let selectedD = []
              let selectedU = []
              // 找出搜索的地名相关的父级区域
              // 并加入它的子节点
              // 开始寻找
              // 一、寻找省节点
              for (let item of this.provincesArr) {
                if (item.id === selectedProvince) {
                  // 二、寻找城节点
                  for (let city of this.citiesArr) {
                    if (city.pId === selectedProvince) {
                      selectedC.push(city)
                    }
                    if (city.id === selectedCity) {
                      // 三、寻找区节点
                      for (let dis of this.districtsArr) {
                        if (dis.pId === selectedCity) {
                          selectedD.push(dis)
                        }
                        if (dis.id === selectedDistrict) {
                          // 四、寻找单位节点
                          for (let unit of this.unitsArr) {
                            if (unit.pId === selectedDistrict) {
                              selectedU.push(unit)
                            }
                            if (unit.id === selectedUnit) {
                              unit.selected = true
                            }
                          }
                          // 寻找结束，开始按层级组合地址
                          // 一、将单位节点数组加到对应的区节点上
                          dis.expand = true
                          dis.children = selectedU
                          break
                        }
                      }
                      // 二、将区节点数组加到对应的城节点上
                      city.expand = true
                      city.children = selectedD
                      break
                    }
                  }
                  // 三、将城节点数组加到对应的省节点上
                  item.expand = true
                  item.children = selectedC
                  break
                }
              }
              // 配置完的树形控件数据
              this.treeData = [{
                title: '全国',
                expand: true,
                loading: false,
                children: this.provincesArr
              }]
            } else {  // 默认初始化
              // 按层级保存各级区域数据
              // 储存被搜索到的单位级的所有父级区域的对象
              for (let item of self.areaData) {
                if (item.type === 1) {
                  let provinceItem = {
                    id: item.id,
                    pId: item.pId,
                    title: item.name,
                    type: item.type,
                    expand: false,
                    loading: false,
                    children: []
                  }
                  self.treeData[0].children.push(provinceItem)
                  self.provincesArr.push(provinceItem)
                }
                else if (item.type === 2) {
                  let cityItem = {
                    id: item.id,
                    pId: item.pId,
                    title: item.name,
                    type: item.type,
                    loading: false,
                    expand: false,
                    children: []
                  }
                  self.citiesArr.push(cityItem)
                }
                else if (item.type === 3) {
                  let districtItem = {
                    id: item.id,
                    pId: item.pId,
                    title: item.name,
                    type: item.type,
                    loading: false,
                    expand: false,
                    children: []
                  }
                  self.districtsArr.push(districtItem)
                }
                else if (item.type === 4) {
                  let unitItem = {
                    id: item.id,
                    pId: item.pId,
                    title: item.name,
                    type: item.type,
                    loading: false,
                    selected: false,
                    children: []
                  }
                  self.unitsArr.push(unitItem)
                }
              }
              // 储存被搜索到的单位级的所有父级区域的对象
              let selectedC = []
              let selectedD = []
              let selectedU = []
              // 找出搜索的地名相关的父级区域
              // 并加入它的子节点
              // 寻找省节点
              for (let item of this.provincesArr) {
                if (item.id === selectedProvince) {
                  // 寻找城节点
                  for (let city of this.citiesArr) {
                    if (city.pId === selectedProvince) {
                      selectedC.push(city)
                    }
                    if (city.id === selectedCity) {
                      // 寻找区节点
                      for (let dis of this.districtsArr) {
                        if (dis.pId === selectedCity) {
                          selectedD.push(dis)
                        }
                        if (dis.id === selectedDistrict) {
                          // 寻找单位节点
                          for (let unit of this.unitsArr) {
                            if (unit.pId === selectedDistrict) {
                              selectedU.push(unit)
                            }
                            if (unit.id === selectedUnit) {
                              unit.selected = true
                            }
                          }
                          // 将单位节点数组加到对应的区节点上
                          dis.expand = true
                          dis.children = selectedU
                          // break
                        }
                      }
                      // 将区节点数组加到对应的城节点上
                      city.expand = true
                      city.children = selectedD
                      // break
                    }
                  }
                  // 将城节点数组加到对应的省节点上
                  item.expand = true
                  item.children = selectedC
                  break
                }
              }
              // 配置完的树形控件数据
              this.treeData = [{
                title: '全国',
                expand: true,
                loading: false,
                children: this.provincesArr
              }]
            }
          }
        })
    },

    // 点击加载并展开下一级树结构
    loadTree(item, fn) {
      let itemName = item.title
      let parentId = item.id
      let childrenArea = []
      // 匹配并加载点击节点的数据
      for (let area of this.areaData) {
        if (area.pId === parentId) {
          let childrenItem = {
            id: area.id,
            pId: area.pId,
            title: area.name,
            type: area.type,
            loading: false,
            children: []
          }
          childrenArea.push(childrenItem)
        }
      }
      setTimeout(() => {
        fn(childrenArea)
      }, 200)

      // 将点过的地名保存, 后面显示在添加电表弹窗里
      if (item.type === 1) {
        this.currentPro = item.title
        sessionStorage.setItem('proName', this.currentPro)
        sessionStorage.setItem('provinceId', item.id)
      } else if (item.type === 2) {
        this.currentCity = item.title
        sessionStorage.setItem('cityName', this.currentCity)
        sessionStorage.setItem('cityId', item.id)
      } else if (item.type === 3) {
        this.currentDis = item.title
        sessionStorage.setItem('disName', this.currentDis)
        sessionStorage.setItem('districtId', item.id)
      }
    },

    // 获取输入的地址并加载
    getInputArea(uid, isInput) {
      if (uid) {
        let unitId = uid
        let unitName = ''
        let districtId, disName = ''
        let cityId, cityName = ''
        let provinceId, proName = ''
        // 追溯上级行政区域
        {
          for (let item of this.unitsArr) {
            if (item.id === unitId) {
              districtId = item.pId
              unitName = item.title
              break
            }
          }
          for (let item of this.districtsArr) {
            if (item.id === districtId) {
              cityId = item.pId
              disName = item.title
              break
            }
          }
          for (let item of this.citiesArr) {
            if (item.id === cityId) {
              provinceId = item.pId
              cityName = item.title
              break
            }
          }
          for (let item of this.provincesArr) {
            if (item.id === provinceId) {
              proName = item.title
              break
            }
          }
        }

        // 使刷新后仍然回到该节点上
        if (provinceId) {
          sessionStorage.setItem('provinceId', provinceId)
          sessionStorage.setItem('proName', proName)
          sessionStorage.setItem('cityId', cityId)
          sessionStorage.setItem('cityName', cityName)
          sessionStorage.setItem('districtId', districtId)
          sessionStorage.setItem('disName', disName)
          sessionStorage.setItem('unitId', unitId)
          sessionStorage.setItem('unitName', unitName)
        } else {
          provinceId = sessionStorage.getItem('provinceId')
          proName = sessionStorage.getItem('proName')
          cityId = sessionStorage.getItem('cityId')
          cityName = sessionStorage.getItem('cityName')
          districtId = sessionStorage.getItem('districtId')
          disName = sessionStorage.getItem('disName')
          unitId = sessionStorage.getItem('unitId')
          unitName = sessionStorage.getItem('unitName')
        }

        // 重新初始化树形控件，并加载相应的树状图
        this.initTree(provinceId, cityId, districtId, unitId, isInput)

        this.currentPro = proName
        this.currentCity = cityName
        this.currentDis = disName
        this.currentLocation = unitName

        // 保存当前地址
        sessionStorage.setItem('areaLevel', 4)
        sessionStorage.setItem('currentLoc',
          this.currentPro + ' ' + this.currentCity + ' ' +
          this.currentDis + ' ' + this.currentLocation)
      }
    },

    // 模糊查询
    searchUnit(query) {
      query = query.trim()
      if (query !== '') {
        this.areaLoading = true;
        setTimeout(() => {
          this.relatedUnits = []
          this.areaLoading = false;
          const list = this.unitsArr.map(item => {
            return {
              value: item.id,
              label: item.title
            }
          })
          for (let item of list) {
            if (item.label.indexOf(query) > -1) {
              this.relatedUnits.push(item)
            }
          }
        }, 200)
      } else {
        this.relatedUnits = []
      }
    },

    // 从模糊查询的下拉菜单选择地址
    getSelectedArea(e) {
      if (e.type === 4) {
        this.currentLocation = e.title
        sessionStorage.setItem('areaLevel', e.type)
        sessionStorage.setItem('unitId', e.id)
        sessionStorage.setItem('unitName', e.title)
        sessionStorage.setItem('currentLoc',
          this.currentPro + ' ' + this.currentCity + ' ' +
          this.currentDis + ' ' + this.currentLocation)
      }
    }
  },
  mounted() {
    let unitId = sessionStorage.getItem('unitId')
    if (unitId) {
      this.getInputArea(unitId)
    } else {
      this.initTree()
    }
  }
})

// 如果数据数量小于10, 则隐藏分页栏
const hidePage = (counts) => {
  if (counts) {
    if (counts < 10) {
      document.querySelector('.page-bar').style.display = 'none'
    } else {
      document.querySelector('.page-bar').style.display = 'block'
    }
  } else {
    if (document.querySelector('.page-bar')) {
      document.querySelector('.page-bar').style.display = 'none'
    }
  }
}

// 显示相应的操作按钮
const isShowBtn = () => {
  axios({
      url: HEADER + '/permission/check_getCurrentUserPermission.do'
    })
    .then(({
      data
    }) => {
      for (let item of data.data) {
        if (document.querySelectorAll('.' + item)) {
          let eles = document.querySelectorAll('.' + item)
          for (let i of eles) {
            i.classList.remove(item)
          }
        }
      }
    })
}

window.onload = () => {
  isShowBtn()
  // hidePage()
}

export {
  polyfill,
  Vue,
  iView,
  axios,
  HEADER,
  hidePage,
  isShowBtn,
  echarts
};