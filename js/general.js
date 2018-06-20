import Vue from 'vue/dist/vue'
import iView from 'iview'
import axios from 'axios'
import 'iview/dist/styles/iview.css'
import '../css/general.less'

// const HEADER = 'http://172.16.31.235:8017/meterforproperty/'
const HEADER = 'http://172.16.31.217:8030/meterforproperty/'    // 梁锋IP

Vue.use(iView)

// 头部组件
Vue.component('meter-header', {
  template: `
<header>
      <div class="layout-logo">
          <i class="logo"></i>
          <a class="logo-name"
          href="home_page.html">智慧能源管理平台</a>
      </div>
      <Menu class="nav-ul" mode="horizontal" :theme="theme1" active-name="1">
          <MenuItem name="home-page">
              <Icon type="ios-home-outline"></Icon>
              <a href="home_page.html">首页</a>
          </MenuItem>
          <MenuItem name="big-screen">
              <Icon type="monitor"></Icon>
              <a href="large_screen.html">大屏幕</a>
          </MenuItem>
          <Submenu name="meters-manage">
              <template slot="title">
                  <Icon type="ios-calculator"></Icon>
                  <a href="meters_manage.html">电表管理</a>
              </template>
              <MenuItem name="meters-manage-item">
                  <a href="meters_manage.html">电表管理</a>
              </MenuItem>
              <MenuItem name="fault-meters">
                  <a href="fault_meters.html">故障电表</a>
              </MenuItem>
              <MenuItem name="online-meters">
                  <a href="online_manage.html">电表在线管理</a>
              </MenuItem>
          </Submenu>
          <Submenu name="electric-data">
              <template slot="title">
                  <Icon type="stats-bars"></Icon>
                  <a href="">用电数据</a>
              </template>
              <MenuItem name="electrical-data">
                  <a href="electrical_data.html">用电数据</a>
              </MenuItem>
              <MenuItem name="electrical_anomaly">                  
                  <a href="electrical_anomaly.html">用电异常</a>
              </MenuItem>
          </Submenu>
          <Submenu name="energy-analyze">
              <template slot="title">
                  <Icon type="ios-analytics-outline"></Icon>
                  能源分析
              </template>
              <MenuItem name="structure-analyze">
                  <a href="structure_analyze.html">用电结构分析</a>
              </MenuItem>
              <MenuItem name="tendency-analyze">
                  <a href="">用电趋势分析</a>
              </MenuItem>
              <MenuItem name="loss-analyze">
                  <a href="">用电损耗分析</a>
              </MenuItem>
          </Submenu>
          
          <MenuItem name="order-manage">
              <Icon type="ios-paper-outline"></Icon>
              <a href="">订单管理</a>
          </MenuItem>
          <MenuItem name="unit-manage">
              <Icon type="ios-location"></Icon>
              <a href="">单位管理</a>
          </MenuItem>
          <MenuItem name="user-manage">
              <Icon type="ios-people-outline"></Icon>
              <a href="">用户管理</a>
          </MenuItem>
          
          <Submenu name="system-manage">
              <template slot="title">
                  <Icon type="grid"></Icon>
                  系统管理
              </template>
              <MenuGroup title="使用">
                  <MenuItem name="3-1">新增和启动</MenuItem>
                  <MenuItem name="3-2">活跃分析</MenuItem>
                  <MenuItem name="3-3">时段分析</MenuItem>
              </MenuGroup>
              <MenuGroup title="留存">
                  <MenuItem name="3-4">用户留存</MenuItem>
                  <MenuItem name="3-5">流失用户</MenuItem>
              </MenuGroup>
          </Submenu>

          <MenuItem name="log-manage">
              <Icon type="calendar"></Icon>
              <a href="">日志管理</a>
          </MenuItem>
      </Menu>
  </header>`,
  data: function () {
    return {
      theme1: 'light'
    }
  }
})

// 侧边组件
Vue.component('meter-sider', {
  template: `
<sider class="meter-sider" hide-trigger>
       <div class="user-info-bar">
          <div class="user-avatar"></div>
          <div class="user-name" 
          id="user-name">李小安</div>
          <div class="user-role">系统管理员</div>
       </div>
      <div class="user-btn-group">
          <div class="user-config">
              <Icon type="gear-a"></Icon>
              个人设置
          </div>
          <div class="pwd-config">
              <Icon type="locked"></Icon>
              密码修改
          </div>
          <i-button class="quit-btn">退出</i-button>
      </div>
  </sider>`
})

// 个人设置组件
Vue.component('user-config', {
  template: ``
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
  data: function () {
    return {
      areaData: [],
      treeData: [
        {
          title: '全国',
          expand: true,
          loading: false,
          children: []
        }],
      provincesArr: [],
      citiesArr: [],
      districtsArr: [],
      unitsArr: [],

      inputArea: '',
      relatedUnits: [],
      areaLoading: false,
      currentPro: '',
      currentCity: '',
      currentDis: '',
      currentLocation: ''
    }
  },
  methods: {
    returnSonData (e, isInput) {
      if (isInput) {
        this.getInputArea(e)
        this.$emit('father-event', e)
      }
      else {
        this.getSelectedArea(e[0])
        this.$emit('father-event', e[0].id)
      }
    },

    // 初始化区域树结构
    initTree (selectedProvince, selectedCity,
              selectedDistrict, selectedUnit) {
      let self = this
      axios({
        url: HEADER + '/location/check_getAllLocationByUser.do'
      })
        .then(({data}) => {
          if (data.data) {
            self.areaData = data.data
            if (!selectedProvince) {
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
            }
            else {
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
                          break
                        }
                      }
                      // 将区节点数组加到对应的城节点上
                      city.expand = true
                      city.children = selectedD
                      break
                    }
                  }
                  // 将城节点数组加到对应的省节点上
                  item.expand = true
                  item.children = selectedC
                  break
                }
              }
              // 配置完的树形控件数据
              this.treeData = [
                {
                  title: '全国',
                  expand: true,
                  loading: false,
                  children: this.provincesArr
                }]
            }
          }
        })
    },

    // 加载并展开下一级树结构
    loadTree (item, fn) {
      let itemName = item.title
      let parentId = item.id
      let childrenArea = []
      for (let item of this.areaData) {
        if (item.pId === parentId) {
          let childrenItem = {
            id: item.id,
            pId: item.pId,
            title: item.name,
            type: item.type,
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
      }
      else if (item.type === 2) {
        this.currentCity = item.title
      }
      else if (item.type === 3) {
        this.currentDis = item.title
      }
      else if (item.type === 4) {

      }

    },

    getInputArea (e) {
      if (e) {
        let unitId = e
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
        // 重新初始化树形控件
        this.initTree(provinceId, cityId, districtId, unitId)

        this.currentPro = proName
        this.currentCity = cityName
        this.currentDis = disName
        this.currentLocation = unitName
        sessionStorage.setItem('currentLoc',
          this.currentPro + ' ' + this.currentCity + ' ' +
          this.currentDis + ' ' + this.currentLocation)
      }
    },

    searchUnit (query) {
      if (query !== '') {
        this.areaLoading = true;
        setTimeout(() => {
          this.areaLoading = false;
          const list = this.unitsArr.map(item => {
            return {
              value: item.id,
              label: item.title
            };
          });
          for (let item of list) {
            if (item.label.indexOf(query) > -1) {
              this.relatedUnits.push(item)
            }
          }
        }, 200);
      } else {
        this.relatedUnits = [];
      }
    },

    getSelectedArea (e) {
      if (e.type === 4) {
        this.currentLocation = e.title
        sessionStorage.setItem('currentLoc',
          this.currentPro + ' ' + this.currentCity + ' ' +
          this.currentDis + ' ' + this.currentLocation)
      }
    }
  },
  mounted () {
    this.initTree()
    sessionStorage.removeItem('currentLoc')
  }
})

// 如果数据数量小于10, 则隐藏分页栏
const hidePage = (counts) => {
  if (counts < 10) {
    document.querySelector('.page-bar').style.display = 'none'
  } else {
    document.querySelector('.page-bar').style.display = 'block'
  }
}

export {
  Vue, iView, axios,
  HEADER, hidePage
}