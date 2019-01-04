import {
    Vue,
    HEADER,
    axios,
    hidePage,
    isShowBtn
} from './general.js'
import '../css/peakvalleySchemeDetail.less'

let edVM = new Vue({
    el: '#peakvalleySchemeDetail',
    data: {
        p_id: '',
        detailList: [], //方案列表

        totalpage: 0, //总条数
        pageCurrent: 1, //当前页

        edit_id: '',
        batch: false,
        delete_ids: '',

        checkAll: false,
        checkStatus: [false, false, false],
        totalpage: 0,
        pageCurrent: 1,

        add_ordernum: '',
        add_starttime: '',
        add_endtime: '',
        add_price: '',

        localList: [],
        model_add: false,
        model_edit: false,

        editList: []
    },
    mounted() {
        console.log(location.search)
        let str = location.search
        this.p_id = str.slice(4, str.length)
        this.getPeakvalleySchemeDetail(1)
    },
    methods: {
        //获取页面内容
        getPeakvalleySchemeDetail(page) {
            let THIS = this
            THIS.detailList = []
            THIS.checkStatus = []
            axios({
                method: 'get',
                url: HEADER + '/peakLevelValley/check_getPeakLevelValleyList.do',
                params: {
                    p_id: THIS.p_id,
                    page: page,
                    pagesize: 10
                }
            }).then(function (res) {
                console.log(res)
                if (res.data.code === 1) {
                    THIS.detailList = res.data.data.list
                    THIS.localList = res.data.data.list
                    THIS.totalpage = res.data.data.allRow
                    for (let i = 0; i < THIS.detailList.length; i++) {
                        THIS.checkStatus.push(false)
                    }
                    hidePage(THIS.totalpage)
                    setTimeout(() => {
                        isShowBtn()
                    }, 300)
                }
            })
        },

        // 提交新建方案
        addSchemeDetail() {
            let THIS = this
            if (THIS.add_ordernum) {
                if (THIS.add_starttime) {
                    if (THIS.add_endtime) {
                        if (THIS.add_price) {
                            axios({
                                method: 'post',
                                url: HEADER + '/peakLevelValley/add_addPeakLevelValley.do',
                                params: {
                                    p_id: THIS.p_id,
                                    starttime: THIS.add_starttime,
                                    endtime: THIS.add_endtime,
                                    price: THIS.add_price,
                                    ordernum: THIS.add_ordernum
                                }
                            }).then(function (res) {
                                console.log(res)
                                if (res.data.code === 1) {
                                    THIS.getPeakvalleySchemeDetail(1)
                                    THIS.cancelAddDetail()
                                    THIS.instance('success', "添加成功")
                                } else {
                                    THIS.instance('error', res.data.msg)
                                }
                            })
                        } else {
                            THIS.instance('warning', '请输入价格！')
                        }
                    } else {
                        THIS.instance('warning', '请选择结束时段！')
                    }
                } else {
                    THIS.instance('warning', '请选择开始时段！')
                }
            } else {
                THIS.instance('warning', '请选择时段类型！')
            }
        },

        //点击编辑
        editClicked(list) {
            console.log("点击了编辑")
            this.model_edit = true
            this.editList = list
            console.log(this.editList)
        },


        //点击删除
        deleteClicked(type1) {
            this.$Modal.confirm({
                content: '确认删除该峰平谷方案详情?',
                onOk: () => {
                    setTimeout(() => {
                        this.deleteSchemeDetail(type1)
                    }, 300)
                }
            })
        },

        // 编辑峰平谷方案
        editSchemeDetail() {
            console.log("提交编辑")
            let THIS = this
            axios({
                method: 'post',
                url: HEADER + '/peakLevelValley/update_updatePeakLevelValley.do',
                params: {
                    id: THIS.editList.id,
                    starttime: THIS.editList.starttime,
                    endtime: THIS.editList.endtime,
                    price: THIS.editList.price,
                    ordernum: THIS.editList.ordernum
                }
            }).then(function (res) {
                if (res.data.code === 1) {
                    THIS.getPeakvalleySchemeDetail(THIS.pageCurrent)
                    THIS.instance('success', "修改成功")
                } else {
                    THIS.instance('error', res.data.msg)
                }
            })
        },

        // 删除峰平谷方案
        deleteSchemeDetail(id) {
            let THIS = this
            axios({
                method: 'post',
                url: HEADER + '/peakLevelValley/delete_deletePeakLevelValley.do',
                params: {
                    id: id
                }
            }).then(function (res) {
                if (res.data.code === 1) {
                    THIS.checkAll = false
                    THIS.getPeakvalleySchemeDetail(THIS.pageCurrent)
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
                    for (let i = 0; i < THIS.detailList.length; i++) {
                        if (THIS.checkStatus[i]) {
                            ids += THIS.detailList[i].id + ','
                        }
                    }
                    ids = ids.slice(0, ids.length - 1)
                    THIS.$Modal.confirm({
                        content: '确认删除选中的所有峰平谷方案详情?',
                        onOk: () => {
                            setTimeout(() => {
                                THIS.deleteSchemeDetail(ids)
                            }, 300)
                        }
                    })
                } else {
                    THIS.instance('warning', "请先勾选想要删除的方案详情!")
                }
            }, 300)
        },

        // 全选
        doCheckAll(e) {
            for (let i = 0; i < this.checkStatus.length; i++) {
                this.checkStatus[i] = this.checkAll
            }
            console.log(this.checkStatus)
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
            console.log(this.checkStatus)
        },

        // 点击添加
        doAdd() {
            this.model_add = true
        },

        //取消新增
        cancelAddDetail() {
            this.model_add = false
            this.add_ordernum = ''
            this.add_starttime = ''
            this.add_endtime = ''
            this.add_price = ''
        },


        // 返回上一页
        back() {
            history.back(-1)
        },

        //分页
        pageInfor(e, type) {
            this.pageCurrent = e
            this.getPeakvalleySchemeDetail(this.pageCurrent)
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