import {
  Vue, iView, axios,
  HEADER, hidePage
} from './general.js'
import '../css/role_manage.less'

let roleManagmVM = new Vue({
  el: '#role-manage',
  data: {
    roles: [],
    allRow: 0,

    roleModal: false,
    modelLoading: true,
    isAddModal: true,
    roleName: '',
    roleValue: '',
    remark: '',
    emptyNum: [1, 1],
    roleId: ''
  },
  methods: {
    // 删除
    deleteRole (id) {
      this.recordId = id
      this.$Modal.confirm({
        content: '确认删除此角色数据?',
        onOk: () => {
          axios({
            method: 'post',
            url: HEADER + '/role/delete_Role.do',
            params: {
              id: id
            }
          })
            .then(({data}) => {
              if (data.code === 1) {
                this.getRoles()
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
    },

    // 打开添加/编辑弹窗
    openRoleModal (ifAdd, id, index) {
      this.roleModal = true
      if (ifAdd) {
        this.isAddModal = true
        this.roleName = ''
        this.roleValue = ''

        this.emptyNum = [1, 1]
      }
      else {
        this.isAddModal = false
        this.roleId = id
        this.roleName = this.roles[index].rname
        this.roleValue = this.roles[index].name
        this.remark = this.roles[index].remark

        this.emptyNum = []
      }
    },
    // 不能为空
    noEmpty (val) {
      if (val === '') {
        this.$Message.success('此处不能为空!')
      }
      else {
        this.emptyNum.shift(1)
      }
    },
    // 提交信息
    submitRole () {
      let url = HEADER + '/role/add_Role.do'
      let params = {
        name: this.roleName,
        rname: this.roleValue,
        remark: this.remark
      }

      // 如果是编辑
      if (!this.isAddModal) {
        url = HEADER + '/role/update_Role.do'
        params.id = this.roleId
      }
      // 如果全部不为空
      if (this.emptyNum.length === 0) {
        axios({
          method: 'post',
          url: url,
          params: params
        })
          .then(({data}) => {
            if (data.code === 1) {
              this.roleModal = false
              this.$Modal.success({
                content: data.msg
              })
              this.getRoles()
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
        this.$Message.error('输入信息不完整!')
        setTimeout(() => {
          this.modelLoading = false
          this.$nextTick(() => {
            this.modelLoading = true
          })
        }, 500)
      }
    },
    // 获取角色表格数据
    getRoles (page) {
      let self = this
      axios({
        url: HEADER + '/role/check_RoleForPage.do',
        params: {
          page: page
        }
      })
        .then(({data}) => {
          self.roles = data.data.list
          self.allRow = data.data.allRow
        })
    },

    // 分页
    getCurrentPage (e) {
      this.getRoles(e)
    }
  },
  mounted () {
    this.getRoles()
  }
})