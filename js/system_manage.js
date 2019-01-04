import {
  Vue,
  iView,
  axios,
  HEADER,
  hidePage
} from './general.js'
import '../css/system_manage.less'

// const HEADER = 'http://172.16.31.241:8087/meterforproperty'

let roleManagmVM = new Vue({
  el: '#role-manage',
  data: {
    allRow: 0,
    whichTab: 'role',
    addModal: false,
    modelLoading: true,
    isAddModal: true,
    secondArr: [], // 二级页面
    treeData: [{
      title: '主菜单',
      expand: true,
      loading: false,
      children: []
    }],
    isShowTab: '',
    isShowTab1: '',
    isShowTab2: '',
    isShowTab3: '',

    // 角色管理
    rm: {
      roles: [],
      roleName: '',
      roleValue: '',
      remark: '',
      emptyNum: [1, 1],
      roleId: ''
    },

    // 权限管理
    pm: {
      rId: '',
      perList: [],
      recordId: '',
      modelName: '',
      perName: '',
      perValue: '',
      modalPerList: []
    },

    // 资源管理
    res: {
      rId: '', // 资源ID
      resList: [],
      pName: '',
      resName: '',
      mValue: '',
      rUrl: '',
      resIndex: '',
      emptyNum: [1, 1, 1, 1],
      recordId: '',
      resTotalPage: 0,
      resCurrentPage: 1
    },

    // 角色权限管理
    rpm: {
      roleNames: [],
      selectedRole: '',
      rpmList: [],
      checkedList: [], // 被勾选的权限
      pageList: [] // 二级页面
    }
  },
  methods: {
    // 是否为正整数
    isInt(val) {
      let reg = /^[1-9]\d*$/
      if (reg.test(val)) {
        return true
      } else {
        this.$Modal.error({
          content: '请输入正整数!'
        })
      }
    },

    // 删除
    deleteModal(id) {
      this.$Modal.confirm({
        content: '确认删除此数据?',
        onOk: () => {
          let url = ''
          if (this.whichTab === 'role') {
            url = HEADER + '/role/delete_Role.do'
          } else if (this.whichTab === 'per') {
            url = HEADER + '/permission/delete_Permission.do'
          } else if (this.whichTab === 'res') {
            url = HEADER + '/resources/delete_Resources.do'
          }

          axios({
              method: 'post',
              url: url,
              params: {
                id: id
              }
            })
            .then(({
              data
            }) => {
              if (data.code === 1) {
                this.whichTable(this.whichTab)
                // 刷新树形图
                this.treeData[0].children = []
                this.initTree()
              } else {
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
    },

    // 打开添加/编辑弹窗
    openModal(ifAdd, id, index) {
      this.addModal = true
      if (ifAdd) { // 如果是添加
        this.isAddModal = true
        if (this.whichTab === 'role') {
          this.rm.roleName = ''
          this.rm.roleValue = ''
          this.rm.remark = ''
          this.rm.emptyNum = [1, 1]
        } else if (this.whichTab === 'per') {
          if (this.pm.modelName) {
            this.pm.perValue = ''
            this.getMPerList()
          } else {
            this.$Message.warning('请先选择左侧资源!')
            this.addModal = false
          }
        } else if (this.whichTab === 'res') {
          if (this.res.pName) {
            this.res.resName = ''
            this.res.mValue = ''
            this.res.rUrl = ''
            this.res.resIndex = ''
          } else {
            this.$Message.warning('请先选择左侧资源!')
            this.addModal = false
          }
        }
      } else { // 如果是编辑
        this.isAddModal = false
        if (this.whichTab === 'role') {
          this.rm.roleId = id
          this.rm.roleName = this.rm.roles[index].rname
          this.rm.roleValue = this.rm.roles[index].name
          this.rm.remark = this.rm.roles[index].remark
          this.rm.emptyNum = []
        } else if (this.whichTab === 'per') {
          this.getMPerList()

          this.pm.modelName = this.pm.perList[0].modelname
          this.pm.perName = this.pm.perList[index].operatingname
          this.pm.perValue = this.pm.perList[index].operating
          this.pm.recordId = this.pm.perList[index].id
        } else if (this.whichTab === 'res') {
          this.res.resName = this.res.resList[index].name
          this.res.mValue = this.res.resList[index].model
          this.res.rUrl = this.res.resList[index].url
          this.res.resIndex = this.res.resList[index].number
          this.res.recordId = this.res.resList[index].id
        }
      }
    },

    // 提交信息
    submitRole() {
      let url = ''
      let params = {}
      let emptyLen = 0

      if (this.whichTab === 'role') {
        url = HEADER + '/role/add_Role.do'
        params = {
          name: this.rm.roleName,
          rname: this.rm.roleValue,
          remark: this.rm.remark
        }
        // 如果是编辑
        if (!this.isAddModal) {
          url = HEADER + '/role/update_Role.do'
          params.id = this.rm.roleId
        }
        emptyLen = this.rm.emptyNum.length
      } else if (this.whichTab === 'per') {
        params = {
          resourcesid: this.pm.rId,
          operating: this.pm.perValue,
          operatingname: this.pm.perName,
          model: this.pm.modelName
        }
        if (this.isAddModal) {
          url = HEADER + '/permission/add_Permission.do'
        } else {
          url = HEADER + '/permission/update_Permission.do'
          params.id = this.pm.recordId
        }
      } else if (this.whichTab === 'res') {
        params = {
          name: this.res.resName,
          url: this.res.rUrl,
          parentid: this.res.rId,
          number: this.res.resIndex,
          model: this.res.mValue
        }
        if (this.isAddModal) {
          url = HEADER + '/resources/add_Resources.do'
        } else {
          url = HEADER + '/resources/update_Resources.do'
          params.id = this.res.recordId
        }
      }

      // 如果全部不为空
      if (emptyLen === 0) {
        axios({
            method: 'post',
            url: url,
            params: params
          })
          .then(({
            data
          }) => {
            if (data.code === 1) {
              this.addModal = false
              this.$Modal.success({
                content: data.msg
              })
              this.whichTable(this.whichTab)
              // 刷新树状图
              if (this.whichTab === 'res') {
                this.treeData[0].children = []
                this.initTree()
              }
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
      } else {
        this.$Message.error('输入信息不完整!')
        setTimeout(() => {
          this.modelLoading = false
          this.$nextTick(() => {
            this.modelLoading = true
          })
        }, 500)
      }
    },

    // 获取树形图节点ID
    getNodeId(e) {
      this.res.pName = e[0].title
      this.pm.modelName = e[0].title
      this.pm.rId = e[0].id
      if (this.res.pName === '主菜单') {
        this.res.rId = 1
      } else {
        this.res.rId = e[0].id
      }
      this.whichTable(this.whichTab)
    },

    // 加载树形图
    initTree() {
      axios({
          url: HEADER + '/resources/check_getResourcesTree.do'
        })
        .then(({
          data
        }) => {
          let rlist = data.data[0].children

          // 找模块单位
          for (let item of rlist) {
            let mItem = {
              title: item.name,
              id: item.id,
              children: []
            }
            if (item.children.length) {
              for (let i of item.children) {
                let sItem = {
                  title: i.name,
                  id: i.id
                }
                mItem.children.push(sItem)
              }
            }
            this.treeData[0].children.push(mItem)
          }
        })
    },

    // 加载哪个列表
    whichTable(tab) {
      if (tab === 'role') {
        this.getRoles()
      } else if (tab === 'per') {
        this.getPer(this.pm.rId)
      } else if (tab === 'res') {
        this.getRes(this.res.rId)
      } else if (tab === 'rpm') {
        this.getRpm()
      }
    },

    // 获取权限列表
    getPer(id) {
      axios({
          url: HEADER + '/permission/check_PermissionForPage.do' +
            '?resourcesid=' + id
        })
        .then(({
          data
        }) => {
          let arr = data.data.list
          this.pm.perList = data.data.list
        })
    },

    // 切换主页面
    toggleTab(e) {
      this.whichTab = e.target.getAttribute('data-type')
      this.whichTable(this.whichTab)
      sessionStorage.setItem('tab', this.whichTab)
    },

    // 获取资源列表
    getRes(id,page) {
      axios({
          url: HEADER + '/resources/check_listResourcesById.do',
          params: {
            page:page||1,
            pagesize:10,
            id: id
          }
        })
        .then(({
          data
        }) => {
          this.res.resList = data.data.list
          this.res.resCurrentPage = data.data.currentPage 
          this.res.resTotalPage = data.data.allRow 
        })
    },

    getSelectPer(e) {
      setTimeout(() => {
        this.pm.perName =
          document.querySelector('.ivu-select-selected-value').innerText
      }, 1)
      this.pm.perValue = e
    },

    // 分页
    getCurrentPage(type,e) {
      // this.getRoles(e)
      if(type==='RES'){
        this.getRes(this.res.rId,e)
      }
    },
    // 不能为空
    noEmpty(val) {
      if (val === '') {
        this.$Message.success('此处不能为空!')
      } else {
        if (this.whichTab === 'role') {
          this.rm.emptyNum.shift(1)
        } else if (this.whichTab === 'res') {
          this.res.emptyNum.shift(1)
        }
      }
    },

    // 加载弹窗权限下拉列表
    getMPerList() {
      axios({
          url: HEADER + '/permission/check_check_getPermissionDictionaryList.do'
        })
        .then(({
          data
        }) => {
          this.pm.modalPerList = data.data
        })
    },


    // 获取角色表格数据
    getRoles(page) {
      let self = this
      axios({
          url: HEADER + '/role/check_RoleForPage.do',
          params: {
            page: page
          }
        })
        .then(({
          data
        }) => {
          self.rm.roles = data.data.list
          self.allRow = data.data.allRow
        })
    },


    // 角色权限管理的方法-------------------------------------

    // 提交角色权限
    submitPer() {
      axios({
          method: 'post',
          url: HEADER + '/permissionRole/update_RolePermission.do',
          params: {
            roleid: this.rpm.selectedRole,
            permissionIds: this.rpm.checkedList.join(',')
          }
        })
        .then(({
          data
        }) => {
          if (data.status === 1) {
            this.$Modal.success({
              content: '操作成功!'
            })
          } else {
            this.$Modal.error({
              content: '操作失败!'
            })
          }
        })
    },

    // 全选/全不选(模块)
    getAllChecked(e, index) {
      if (e) {
        // 如果没有子页面
        if (!this.rpm.rpmList[index].children.length) {
          for (let item of this.rpm.rpmList[index].permissions) {
            item.checked = e
            this.rpm.checkedList.push(item.permissionid)
          }
        } else { // 如果有子页面
          for (let page of this.rpm.rpmList[index].children) {
            page.checked = e
            for (let item of page.permissions) {
              item.checked = e
              this.rpm.checkedList.push(item.permissionid)
            }
          }
        }
      } else {
        if (!this.rpm.rpmList[index].children.length) {
          for (let item of this.rpm.rpmList[index].permissions) {
            item.checked = e
            this.rpm.checkedList.splice(
              this.rpm.checkedList.indexOf(item.permissionid), 1)
          }
        } else {
          for (let page of this.rpm.rpmList[index].children) {
            page.checked = e
            for (let item of page.permissions) {
              item.checked = e
              this.rpm.checkedList.splice(
                this.rpm.checkedList.indexOf(item.permissionid), 1)
            }
          }
        }
      }
    },

    // 全选/全不选(子页面)
    getPageChecked(e, name) {
      for (let page of this.rpm.pageList) {
        if (name === page.name) {
          if (e) { // 全选
            for (let item of page.permissions) {
              item.checked = e
              // 只加入原来没勾选的权限
              if (!this.rpm.checkedList.includes(item.permissionid)) {
                this.rpm.checkedList.push(item.permissionid)
              }
            }
          } else { // 全不选
            for (let item of page.permissions) {
              item.checked = e
              this.rpm.checkedList.splice(this.rpm.checkedList.indexOf(item.permissionid), 1)
            }
          }
        }
      }
    },

    // 获取勾选ID(角色权限管理)
    getCheckboxes(e, id) {
      if (this.rpm.selectedRole) {
        // 推入或删除勾选的权限ID
        if (e) {
          this.rpm.checkedList.push(id)
        } else {
          this.rpm.checkedList.splice(
            this.rpm.checkedList.indexOf(id), 1)
        }
      } else {
        this.$Modal.info({
          content: '请先选择角色!'
        })
      }
    },

    // 获取选择的角色id
    getSelectedRole(id) {
      this.rpm.selectedRole = id
      this.rpm.checkedList = []
      this.getRpm()
    },

    // 获取角色名称列表
    getRoleNames() {
      axios({
          url: HEADER + '/role/check_RoleList.do'
        })
        .then(({
          data
        }) => {
          this.rpm.roleNames = data.data
        })
    },

    // 获取角色权限列表
    getRpm() {
      this.getRoleNames()
      axios({
          url: HEADER + '/permissionRole/check_getPermissionTree.do',
          params: {
            roleid: this.rpm.selectedRole
          }
        })
        .then(({
          data
        }) => {
          this.rpm.rpmList = data
          this.rpm.pageList = []
          // 本来已经具有的权限, 一开始就要加入到数组中
          for (let item of this.rpm.rpmList) {
            if (item.children.length) { // 如果模块下有子页面
              let truePages = 0 // 用来记录子页面是否全选
              this.rpm.pageList = this.rpm.pageList.concat(item.children)
              for (let i of item.children) { // 遍历二级页面
                let trueNum = 0 // 用来记录获得权限的数量
                for (let j of i.permissions) { // 遍历页面下的权限
                  if (j.checked) {
                    this.rpm.checkedList.push(j.permissionid)
                    trueNum += 1
                  }
                  // 让二级页面显示为全选
                  if (trueNum === i.permissions.length) {
                    i.checked = true
                    truePages += 1
                  }
                }
              }
              if (truePages === item.children.length) {
                item.checked = true
              }
            } else {
              let trueNum = 0
              for (let i of item.permissions) {
                if (i.checked) {
                  this.rpm.checkedList.push(i.permissionid)
                  trueNum += 1
                }
              }
              if (trueNum === item.permissions.length) {
                item.checked = true
              }
            }
          }
        })
    }
  },
  mounted() {
    hidePage(this.allRow)

    let tabType = sessionStorage.getItem('tab')
    if (tabType) {
      this.whichTab = tabType
      this.whichTable(this.whichTab)
    } else {
      this.getRoles()
    }

    this.initTree()

    // 根据权限隐藏或显示某些页面
    axios({
        url: HEADER + '/permission/check_getCurrentUserPermission.do'
      })
      .then(({
        data
      }) => {
        let perData = data.data
        for (let item of perData) {
          if (item.includes('role-')) {
            this.isShowTab = 'rm'
          }
          if (item.includes('permission-')) {
            this.isShowTab1 = 'pm'
          }
          if (item.includes('resources-')) {
            this.isShowTab2 = 'res'
          }
          if (item.includes('permissionRole-')) {
            this.isShowTab3 = 'rpm'
          }
        }
      })
  }
})