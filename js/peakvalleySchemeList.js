import {
    Vue,
    HEADER,
    axios,
    hidePage,
    isShowBtn
} from './general.js'
import '../css/peakvalleySchemeList.less'

let edVM = new Vue({
    el: '#peakvalleySchemeList',
    data: {
        totalpage: 0, //总条数
        pageCurrent: 1, //当前页 

        schemeList: [], //方案列表
        keywords: '', //搜索的input框
        searchParam: '', //传递的搜索的内容

        model_add: false,
        model_edit: false,

        edit_id: '',
        batch: false,

        input_add: '', //添加的input框
        input_edit: '', //编辑的input框

        checkAll: false,
        checkStatus: [],
        noresult: false,
        delete_ids: ''

    },
    mounted() {
        this.getPeakvalleySchemeList(1)
    },
    methods: {

        doCheckAll(e) {
            for (let i = 0; i < this.checkStatus.length; i++) {
                this.checkStatus[i] = this.checkAll
            }
        },

        //选中
        doCheckOne(id, index) {
            if (this.checkAll) {
                for (let i = 0; i < this.checkStatus.length; i++) {
                    if (this.checkStatus[i] == false) {
                        this.checkAll = false
                        break
                    }
                }
            } else {
                let flag = 0
                for (let i = 0; i < this.checkStatus.length; i++) {
                    if (this.checkStatus[i] == true) {
                        flag++
                    }
                }
                if (flag == this.checkStatus.length) {
                    this.checkAll = true
                }
            }
        },

        //获取页面内容
        getPeakvalleySchemeList(page) {
            let THIS = this
            THIS.schemeList = []
            THIS.checkStatus = []
            axios({
                method: 'get',
                url: HEADER + '/peakLevelValley/check_getPeakLevelValleyProgramListByPage.do',
                params: {
                    pagesize: 10,
                    page: page,
                    name: THIS.searchParam
                }
            }).then(function (res) {
                if (res.data.data.list.length > 0) {
                    THIS.schemeList = res.data.data.list
                    for (let i = 0; i < THIS.schemeList.length; i++) {
                        THIS.checkStatus.push(false)
                    }
                    THIS.totalpage = res.data.data.allRow
                    hidePage(THIS.totalpage)
                    setTimeout(() => {
                        isShowBtn()
                    }, 300)
                    THIS.noresult = false
                } else {
                    THIS.noresult = true
                    console.log(THIS.noresult)
                    THIS.totalpage = 0
                    hidePage(THIS.totalpage)

                }
            })
        },

        // 打开新增
        openAdd() {
            this.model_add = true
            this.input_add = ""
        },

        // 提交新建方案
        addScheme() {
            let THIS = this
            axios({
                method: 'post',
                url: HEADER + '/peakLevelValley/add_PeakLevelValleyProgram.do',
                params: {
                    name: THIS.input_add
                }
            }).then(function (res) {
                console.log(res)
                if (res.data.code === 1) {
                    THIS.getPeakvalleySchemeList(1)
                    THIS.instance('success', "添加成功")
                } else {
                    THIS.instance('error', res.data.msg)
                }
            })
        },

        //点击编辑或删除
        operate(id, type) {
            if (type === 'delete') {
                this.$Modal.confirm({
                    content: '确认删除改峰平谷方案?',
                    onOk: () => {
                        setTimeout(() => {
                            this.deleteScheme(id)
                        }, 300)
                    }
                })
            } else {
                this.edit_id = id
                this.input_edit = type
                this.model_edit = true
            }
        },

        // 编辑峰平谷方案
        editScheme() {
            let THIS = this
            if (THIS.edit_id) {
                axios({
                    method: 'post',
                    url: HEADER + '/peakLevelValley/update_updatePeakLevelValleyProgramName.do',
                    params: {
                        id: THIS.edit_id,
                        name: THIS.input_edit
                    }
                }).then(function (res) {
                    if (res.data.code === 1) {
                        THIS.getPeakvalleySchemeList(THIS.pageCurrent)
                        THIS.instance('success', "修改成功")
                    } else {
                        THIS.instance('error', res.data.msg)
                    }
                })
            }
        },

        // 删除峰平谷方案
        deleteScheme(id) {
            let THIS = this
            axios({
                method: 'post',
                url: HEADER + '/peakLevelValley/delete_deletePeakLevelValleyProgram.do',
                params: {
                    id: id
                }
            }).then(function (res) {
                if (res.data.code === 1) {
                    THIS.checkAll = false
                    THIS.getPeakvalleySchemeList(THIS.pageCurrent)
                    THIS.instance('success', "删除成功")
                } else {
                    THIS.instance('error', res.data.msg)
                }
            })
        },

        // 批量删除
        batchDelete(e) {
            let THIS = this
            let flag = false
            for (let i = 0; i < THIS.checkStatus.length; i++) {
                if (THIS.checkStatus[i] === true) {
                    flag = true
                    break
                }
            }
            setTimeout(function () {
                if (flag) {
                    THIS.delete_ids = ''
                    let ids = ''
                    for (let i = 0; i < THIS.schemeList.length; i++) {
                        if (THIS.checkStatus[i]) {
                            ids += THIS.schemeList[i].id + ','
                        }
                    }
                    ids = ids.slice(0, ids.length - 1)
                    THIS.$Modal.confirm({
                        content: '确认删除选中的峰平谷方案?',
                        onOk: () => {
                            setTimeout(() => {
                                THIS.deleteScheme(ids)
                            }, 300)
                        }
                    })
                } else {
                    THIS.instance('warning', "请先勾选想要删除的方案!")
                }
            }, 300)
        },

        // 搜索
        doSearch() {
            this.searchParam = this.keywords
            this.getPeakvalleySchemeList(1)
        },

        //分页
        pageInfor(e, type) {
            this.pageCurrent = e
            this.getPeakvalleySchemeList(this.pageCurrent)
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
                    break
                case 'error':
                    this.$Modal.error({
                        title: title,
                        content: content
                    });
                    break
                case 'warning':
                    this.$Modal.warning({
                        title: title,
                        content: content
                    })
                    break
            }
        }
    }
})