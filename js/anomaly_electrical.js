// 异常用电

import {
    Vue,
    HEADER,
    axios,
    hidePage,
    isShowBtn
} from './general.js'
import '../css/anomaly_electrical.less'

let edVM = new Vue({
    el: '#anomaly_electrical',
    data: {
        columns: [],

        setList: [],
        location_id: "123", //区域编号
        anomalyType: 'recordList', // 判断电表类型以显示相应页面
        anomalyTypeid: '1', //异常类型id

        productType: '', //产品类型
        // productTypeId: '', //产品类型编号
        productTypeList: [],
        useElecType: '', //用电类型
        // useElecTypeId: "", //用电类型编号
        useelecTypeList: [],
        meterNum: '', //电表类型
        meterNumId: "",
        meterNumList: [],
        startime: '', //开始日期
        endtime: '', //结束日期
        alarm_code: "", //异常类型代码
        anomalyEvent: '', //异常事件
        anomalyEventList: [],

        // （阈值设置）
        productType_set: '', //产品类型
        // productTypeId_set: '', //产品类型编号
        productTypeList_set: [],
        useElecType_set: '', //用电类型
        // useElecTypeId_set: '', //用电类型编号
        useelecTypeList_set: [],
        meterNum_set: '', //电表编号

        recordList: [], //记录列表

        totalpage: 0, //总条数
        pageCurrent: 1, //当前页 
        totalpage_set: 0,
        pageCurrent_set: 1,

        //全选
        readMids: [], //
        inputedBorder: false,
        msgCheckall: false
    },
    mounted() {
        this.getProductsType() //获取所有产品类型
        this.getUseElecType() //获取所有用电类型
        this.timeRange() //设置时间段从本月1号到当前日期
        if (this.anomalyType == "recordList") {
            setTimeout(() => {
                this.getMeterNumList()
                this.getAnomalyEvent() //获取所有异常类型
                this.getElectricaltAnomaly(1)
            }, 300)
        }
        this.columns = [{
                title: '电表编号',
                key: 'meterNum',
                align: 'center',
                fixed: 'left',
                width: 150
            }, {
                title: '安装位置',
                tooltip: true,
                key: 'add',
                align: 'center',
                width: 180
            },
            {
                title: '过压(V)',
                key: 'ou',
                align: 'center',
                width: 170,
                render: (h, params) => {
                    return h('div', [
                        h('InputNumber', {
                            style: {
                                height: '30px',
                                margin: '10px',
                                border: params.row.inputedBorder[0] ? '#2d8cf0 solid 1px' : '##dddee1 solid 1px'
                            },
                            attrs: {
                                'value': params.row.ou * 1,
                                'min': 0
                            },
                            on: {
                                'on-change': (e) => {
                                    // this.setList[params.index].ou = e.target.value
                                    // this.setList[params.index].inputedBorder[0] = true
                                    params.row.ou = e * 1
                                    params.row.inputedBorder[0] = true
                                }
                            }
                        })
                    ]);
                }
            },
            {
                title: '过流(A)',
                key: 'oa',
                align: 'center',
                width: 170,
                render: (h, params) => {
                    return h('div', [
                        h('InputNumber', {
                            style: {
                                height: '30px',
                                margin: '10px',
                                border: params.row.inputedBorder[1] ? '#2d8cf0 solid 1px' : '##dddee1 solid 1px'
                            },
                            attrs: {
                                'value': params.row.oa * 1,
                                'min': 0
                            },
                            on: {
                                'on-change': (e) => {
                                    // this.setList[params.index].oa = e.target.value
                                    // this.setList[params.index].inputedBorder[1] = true
                                    params.row.oa = e * 1
                                    params.row.inputedBorder[1] = true
                                }
                            }
                        })
                    ]);
                }
            },
            {
                title: '欠压(V)',
                key: 'uu',
                align: 'center',
                width: 170,
                render: (h, params) => {
                    return h('div', [
                        h('InputNumber', {
                            style: {
                                height: '30px',
                                margin: '10px',
                                border: params.row.inputedBorder[2] ? '#2d8cf0 solid 1px' : '##dddee1 solid 1px'
                            },
                            attrs: {
                                'value': params.row.uu * 1,
                                'min': 0
                            },
                            on: {
                                'on-change': (e) => {
                                    // this.setList[params.index].uu = e.target.value
                                    // this.setList[params.index].inputedBorder[2] = true
                                    params.row.uu = e * 1
                                    params.row.inputedBorder[2] = true
                                }
                            }
                        })
                    ]);
                }
            },
            {
                title: '漏电(mA)',
                key: 'cl',
                align: 'center',
                width: 170,
                render: (h, params) => {
                    return h('div', [
                        h('InputNumber', {
                            style: {
                                height: '30px',
                                margin: '10px',
                                border: params.row.inputedBorder[3] ? '#2d8cf0 solid 1px' : '##dddee1 solid 1px'
                            },
                            attrs: {
                                'value': params.row.cl * 1,
                                'min': 0
                            },
                            on: {
                                'on-change': (e) => {
                                    // this.setList[params.index].cl = e.target.value
                                    // this.setList[params.index].inputedBorder[3] = true
                                    params.row.cl = e * 1
                                    params.row.inputedBorder[3] = true
                                }
                            }
                        })
                    ]);
                }
            },
            {
                title: '线缆温度(℃)',
                key: 'ot',
                align: 'center',
                width: 170,
                render: (h, params) => {
                    return h('div', [
                        h('InputNumber', {
                            style: {
                                height: '30px',
                                margin: '10px',
                                border: params.row.inputedBorder[4] ? '#2d8cf0 solid 1px' : '##dddee1 solid 1px'
                            },
                            attrs: {
                                'value': params.row.ot * 1,
                                'min': 0
                            },
                            on: {
                                'on-change': (e) => {
                                    // this.setList[params.index].ot = e.target.value
                                    // this.setList[params.index].inputedBorder[4] = true
                                    params.row.ot = e * 1
                                    params.row.inputedBorder[4] = true
                                }
                            }
                        })
                    ]);
                }
            }, {
                title: '视在功率越限(%)',
                key: 'varool',
                align: 'center',
                width: 170,
                render: (h, params) => {
                    return h('div', [
                        h('InputNumber', {
                            style: {
                                height: '30px',
                                margin: '10px',
                                border: params.row.inputedBorder[5] ? '#2d8cf0 solid 1px' : '##dddee1 solid 1px'
                            },
                            attrs: {
                                'value': params.row.varool * 1,
                                'min': 0
                            },
                            on: {
                                'on-change': (e) => {
                                    // this.setList[params.index].varool = e.target.value
                                    // this.setList[params.index].inputedBorder[5] = true
                                    params.row.varool = e * 1
                                    params.row.inputedBorder[5] = true
                                }
                            }
                        })
                    ]);
                }
            }, {
                title: '视在功率越限恢复(%)',
                key: 'varoolr',
                align: 'center',
                width: 190,
                render: (h, params) => {
                    return h('div', [
                        h('InputNumber', {
                            style: {
                                height: '30px',
                                margin: '10px',
                                border: params.row.inputedBorder[6] ? '#2d8cf0 solid 1px' : '##dddee1 solid 1px'
                            },
                            attrs: {
                                'value': params.row.varoolr * 1,
                                'min': 0
                            },
                            on: {
                                'on-change': (e) => {
                                    // this.setList[params.index].varoolr = e.target.value
                                    // this.setList[params.index].inputedBorder[6] = true
                                    params.row.varoolr = e * 1
                                    params.row.inputedBorder[6] = true
                                }
                            }
                        })
                    ]);
                }
            }, {
                title: '邮箱订阅',
                key: 'email_notice',
                align: 'center',
                width: 150,
                renderHeader: (h, params) => {
                    return h('div', [
                        h('checkbox', {
                            props: {
                                value: this.msgCheckall
                            },
                            on: {
                                'on-change': (e) => {
                                    for (let i = 0; i < this.setList.length; i++) {
                                        this.setList[i].email_notice = e ? 1 : 0
                                        this.setList[i].inputedBorder[7] = true //标记已改变
                                        this.msgCheckall = e
                                    }
                                    console.log(e + "++" + this.msgCheckall)
                                }
                            },
                            style: {
                                fontSize: '16px'
                            }
                        }, '邮箱订阅')
                    ]);
                },
                render: (h, params) => {
                    return h('div', [
                        h('checkbox', {
                            props: {
                                value: (params.row.email_notice === 1) ? true : false
                            },
                            'class': {
                                checkboxChanged: params.row.inputedBorder[7]
                            },
                            on: {
                                'on-change': (e) => {
                                    // this.setList[params.index].email_notice = e ? 1 : 0
                                    // this.setList[params.index].inputedBorder[7] = true
                                    params.row.email_notice = e * 1
                                    params.row.inputedBorder[7] = true
                                    // if (this.msgCheckall) {
                                    //    // 自动取消全选
                                    //     for (let i = 0; i < this.setList.length; i++) {
                                    //         if (e == false) {
                                    //             this.msgCheckall = false
                                    //             break
                                    //         }
                                    //     }
                                    // } else {
                                    //    // 自动勾选全选
                                    //     let flag = 0
                                    //     for (let i = 0; i < this.setList.length; i++) {
                                    //         if (this.setList[i].email_notice == true) {
                                    //             flag++
                                    //         }
                                    //         console.log(this.setList[i].email_notice)
                                    //     }
                                    //     if (flag == this.setList.length) {
                                    //         this.msgCheckall = true
                                    //     }
                                    // }
                                }
                            },
                            style: {
                                fontSize: '14px'
                            }
                        }, '订阅')
                    ]);
                }
            },
            {
                title: '操作',
                key: 'action',
                fixed: 'right',
                align: 'center',
                width: 120,
                className: 'operateClm',
                render: (h, params) => {
                    return h('div', [
                        h('Button', {
                            props: {
                                type: 'text',
                                size: 'small'
                            },
                            on: {
                                click: (e) => {
                                    this.submitEditor(params.row)
                                }
                            }
                        }, '保存')
                    ]);
                }
            }
        ]
    },
    methods: {
        // 获取树形图子组件数据
        getSonData(e) {
            // this.location_id = e
            if (this.anomalyType == "recordList") {
                this.getElectricaltAnomaly(1)
            } else if (this.anomalyType == "thresholdSetting") {
                this.getThresholdSetting(1)
            }
        },

        //切换tab页
        toggleAnomalyType(e) {
            this.anomalyType = e.target.dataset.type
            if (this.anomalyType == "recordList") {
                this.totalpage = 0
                this.pageCurrent = 1
                setTimeout(() => {
                    hidePage(this.totalpage)
                    this.getProductsType() //获取所有产品类型
                    this.getUseElecType() //获取所有用电类型
                    this.getAnomalyEvent() //获取所有异常类型
                    this.timeRange() //设置时间段从本月1号到当前日期
                    setTimeout(() => {
                        this.getElectricaltAnomaly(1)
                    }, 300)
                }, 300)
            } else {
                this.totalpage_set = 0
                this.pageCurrent_set = 1
                setTimeout(() => {
                    hidePage(this.totalpage_set)
                    this.getProductsType() //获取所有产品类型
                    this.getUseElecType() //获取所有用电类型
                    setTimeout(() => {
                        this.getThresholdSetting(1)
                    }, 300)
                }, 300)
            }
        },

        //获取所有产品类型
        getProductsType() {
            let THIS = this
            axios({
                method: 'get',
                url: HEADER + '/alarmMeter/check_getProductTypeList.do',
                params: {}
            }).then(function (res) {
                if (res.data.data) {
                    if (THIS.anomalyType == 'recordList') {
                        THIS.productTypeList = res.data.data
                        THIS.productType = THIS.productTypeList[0].meter_type
                    } else {
                        THIS.productTypeList_set = res.data.data
                        THIS.productType_set = THIS.productTypeList_set[0].meter_type
                    }
                }
            })
        },

        //获取所有用电类型
        getUseElecType() {
            let THIS = this
            axios({
                method: 'get',
                url: HEADER + '/alarmMeter/check_getUseElectricityTypeList.do',
                params: {}
            }).then(function (res) {
                if (res.data.data) {
                    if (THIS.anomalyType == 'recordList') {
                        THIS.useelecTypeList = res.data.data
                        THIS.useElecType = THIS.useelecTypeList[0].id //用电类型编号
                    } else {
                        THIS.useelecTypeList_set = res.data.data
                        THIS.useElecType_set = THIS.useelecTypeList_set[0].id //用电类型编号
                    }
                }
            })
        },

        //获取所有异常事件
        getAnomalyEvent() {
            let THIS = this
            axios({
                method: 'get',
                url: HEADER + '/alarmMeter/check_getAlarmTypeList.do',
                params: {}
            }).then(function (res) {
                if (res.data.data) {
                    if (THIS.anomalyType == 'recordList') {
                        THIS.anomalyEventList = res.data.data
                    } else {
                        THIS.anomalyEventList_set = res.data.data
                    }
                }
            })
        },

        //获取异常记录页面内容
        getElectricaltAnomaly(page) {
            let THIS = this
            let startDate = THIS.startime
            let endDate = THIS.endtime
            if (!THIS.location_id) {
                THIS.location_id = sessionStorage.getItem('unitId')
            }
            if (THIS.location_id) {
                THIS.recordList = []
                if (startDate <= endDate) {
                    axios({
                        method: 'get',
                        url: HEADER + '/alarmMeter/check_getAlarmMeterForPage.do',
                        params: {
                            pagesize: 10,
                            page: page,
                            location_id: THIS.location_id, //区域编号
                            meter_type: THIS.productType, //产品类型
                            use_electricity_type_id: THIS.useElecType, //	用电类型编号
                            mid: THIS.meterNumId, //	电表表号
                            alarm_code: THIS.alarm_code, //异常类型代码
                            begin_time: startDate,
                            end_time: endDate
                        }
                    }).then(function (res) {
                        if (res.data.data.list) {
                            // 给recordList赋值
                            THIS.recordList = res.data.data.list
                            THIS.totalpage = res.data.data.allRow
                            THIS.pageCurrent = page
                            hidePage(THIS.totalpage)
                            setTimeout(() => {
                                isShowBtn()
                            }, 300)
                        } else {
                            THIS.totalpage = 0
                            hidePage(THIS.totalpage)
                        }
                    })
                } else {
                    THIS.totalpage = 0
                    hidePage(THIS.totalpage)
                    THIS.instance('warning', '开始时间不能大于结束时间！')
                }
            } else {
                THIS.instance('warning', '请于左侧树状图中选择区域！')
            }
        },

        // 获取阈值设置页面内容
        getThresholdSetting(page) {
            let THIS = this
            THIS.setList = []
            if (!THIS.location_id) {
                THIS.location_id = sessionStorage.getItem('unitId')
            }
            axios({
                method: 'get',
                url: HEADER + '/thresholdSet/check_getThresholdSetForPage.do',
                params: {
                    location_id: THIS.location_id,
                    meter_type: THIS.productType_set,
                    use_electricity_type_id: THIS.useElecType_set,
                    mid: THIS.meterNum_set, //	电表表号
                    page: page,
                    pagesize: 10
                }
            }).then(function (res) {
                let json = res.data.data
                if (json.list.length > 0) {
                    for (let i = 0; i < json.list.length; i++) {
                        THIS.setList.push({
                            id: json.list[i].id ? json.list[i].id : "", //记录id
                            meterNum: json.list[i].mid ? json.list[i].mid : "", //电表编号
                            add: json.list[i].install_address ? json.list[i].install_address : "", //安装位置
                            ou: json.list[i].ou ? json.list[i].ou : "", //过压
                            oa: json.list[i].oi ? json.list[i].oi : "", //过流
                            uu: json.list[i].uu ? json.list[i].uu : "", //欠压
                            cl: json.list[i].cl ? json.list[i].cl : "", //漏电
                            ot: json.list[i].ot ? json.list[i].ot : "", //过温度
                            varool: json.list[i].varool ? json.list[i].varool : "",
                            varoolr: json.list[i].varoolr ? json.list[i].varoolr : "",
                            email_notice: json.list[i].email_notice ? json.list[i].email_notice : "", //邮箱订阅
                            inputedBorder: [false, false, false, false, false, false, false, false]
                        })
                    }
                    THIS.totalpage_set = res.data.data.allRow
                    THIS.pageCurrent_set = page
                    hidePage(THIS.totalpage_set)
                    setTimeout(() => {
                        isShowBtn()
                    }, 300)
                    THIS.msgCheckall = false
                    // let flag = 0
                    // for (let i = 0; i < THIS.setList.length; i++) {
                    //     if (THIS.setList[i].email_notice == true) {
                    //         flag++
                    //     }
                    // }
                    // if (flag == THIS.setList.length) {
                    //     THIS.msgCheckall = true
                    // }else{
                    //     THIS.msgCheckall = false
                    // }
                } else {
                    THIS.totalpage_set = 0
                    hidePage(THIS.totalpage_set)
                }
            })
        },

        //产品类型改变
        productTypeChanged(e) {
            let THIS = this
            if (this.anomalyType == 'recordList') {
                THIS.productType = e
                THIS.meterNum = ""
                THIS.meterNumId = ""
                THIS.meterNumList = []
                setTimeout(function () {
                    THIS.getMeterNumList()
                }, 500)
            } else {
                THIS.productType_set = e
                THIS.meterNum_set = ""
            }
        },

        //用电类型改变
        useElecTypeChanged(e) {
            let THIS = this
            if (this.anomalyType == 'recordList') {
                THIS.useElecType = e
                THIS.meterNum = ""
                THIS.meterNumId = ""
                THIS.meterNumList = []
                setTimeout(() => {
                    THIS.getMeterNumList()
                }, 500)
            } else {
                THIS.useElecType_set = e
                THIS.meterNum_set = ""
            }

        },

        //根据用电类型和产品类型获取电表编号
        getMeterNumList() {
            let THIS = this
            let meterType = (THIS.anomalyType == 'recordList') ? THIS.productType : THIS.productType_set
            let use_electricity_type_id = (THIS.anomalyType == 'recordList') ? THIS.useElecType : THIS.useElecType_set
            axios({
                method: 'get',
                url: HEADER + '/alarmMeter/check_getMeterTypeList.do',
                params: {
                    meter_type: meterType,
                    use_electricity_type_id: use_electricity_type_id,
                    location_id: THIS.location_id
                }
            }).then(function (res) {
                THIS.$refs.selectedNum.clearSingleSelect()
                if (res.data.data.length > 0) {
                    THIS.meterNumList = res.data.data //异常记录电表列表
                } else {
                    THIS.meterNumList = ''
                }
            })
        },

        //电表编号改变
        meterNumChanged(e) {
            let THIS = this
            THIS.meterNumId = (e != undefined) ? e : ''
        },

        //异常事件改变
        anomalyEventChanged(e) {
            let THIS = this
            THIS.alarm_code = e
        },

        // 点击保存按钮
        submitEditor(list) {
            let THIS = this
            axios({
                method: 'post',
                url: HEADER + '/thresholdSet/add_addThresholdSet.do',
                params: {
                    mid: list.meterNum,
                    id: list.id,
                    ou: parseInt(list.ou ? list.ou : 0),
                    oi: parseInt(list.oa ? list.oa : 0),
                    uu: parseInt(list.uu ? list.uu : 0),
                    cl: parseInt(list.cl ? list.cl : 0),
                    ot: parseInt(list.ot ? list.ot : 0),
                    varool: parseInt(list.varool ? list.varool : 0),
                    varoolr: parseInt(list.varoolr ? list.varoolr : 0),
                    email_notice: parseInt(list.email_notice ? list.email_notice : 0)
                }
            }).then(function (res) {
                console.log(res)
                if (res.data.code === 1) {
                    console.log(THIS.pageCurrent_set)
                    THIS.getThresholdSetting(THIS.pageCurrent_set)
                    THIS.instance('success', "保存成功")
                } else {
                    THIS.instance('error', res.data.msg)
                }
            })
        },

        // 搜索
        doSearch(page) {
            if (this.anomalyType == "recordList") {
                this.getElectricaltAnomaly(page)
            } else if (this.anomalyType == "thresholdSetting") {
                this.getThresholdSetting(page)
            }
        },

        //分页
        pageInfor(e, type) {
            if (type === 1) {
                this.pageCurrent = e
                this.doSearch(this.pageCurrent)
            } else {
                this.pageCurrent_set = e
                this.doSearch(this.pageCurrent_set)
            }
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
        },

        // 时间选择器
        handleChange(e, type) {
            if (type === 1) {
                this.startime = e
            }
            if (type === 2) {
                this.endtime = e
            }
        },

        //设置月初到到当前时间段
        timeRange() {
            let myDate = new Date()
            let year = myDate.getFullYear()
            let month = myDate.getMonth() + 1
            let day = myDate.getDate()
            if (month < 10) {
                month = "0" + month;
            }
            if (day >= 0 && day <= 9) {
                day = "0" + day;
            }
            let firstDay = year + "-" + month + "-" + "01";
            let thisDay = year + "-" + month + "-" + day

            this.startime = firstDay
            this.endtime = thisDay
        }


    }
})