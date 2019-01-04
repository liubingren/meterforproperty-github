import {
  Vue, iView, axios,
  HEADER, hidePage
} from './general.js'
import '../css/permission_manage.less'

let onlineManageVM = new Vue({
  el: '#permission-manage',
  data: {
    perArr: [],
    allRow: 0,

    perModal: false,
    modelLoading: true,
    isAddModal: true,
    modelName: '',
    perName: '',
    perValue: '',
    emptyNum: [1, 1],
    rId: ''
  },
  methods: {
    // 删除
    deletePer (id) {
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
    openAddModal (ifAdd, id, index) {
      this.perModal = true
      if (ifAdd) {
        this.isAddModal = true
        this.modelName = ''
        this.perName = ''

        this.emptyNum = [1, 1]
      }
      else {
        this.isAddModal = false
        this.rId = id
        this.modelName = this.perArr[index].rname
        this.perName = this.perArr[index].name
        this.perValue = this.perArr[index].perValue

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
    submitPer () {
      let url = HEADER + '/role/add_Role.do'
      let params = {
        name: this.modelName,
        rname: this.perName,
        perValue: this.perValue
      }

      // 如果是编辑
      if (!this.isAddModal) {
        url = HEADER + '/role/update_Role.do'
        params.id = this.rId
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
              this.perModal = false
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
    getPer (page) {
      let self = this
      axios({
        url: HEADER + '/role/check_RoleForPage.do',
        params: {
          page: page
        }
      })
        .then(({data}) => {
          self.perArr = data.data.list
          self.allRow = data.data.allRow
        })
    },

    // 分页
    getCurrentPage (e) {
      this.getRoles(e)
    }
  },
  mounted () {
  }
})