import {
    Vue,
    HEADER,
    axios,
    hidePage,
    isShowBtn
} from './general.js'
import echarts from 'echarts'
import '../css/electric_analysis.less'

let edVM = new Vue({
    el: '#electric_analysis',
    data: {
        timeType: 'realTime', // 判断日月类型以显示相应页面
        timetypeid: '1',
        selectTime: '',
        datetimeType: 'date',
        keywords: '',
        productType: [], //产品类型
        productType_selected: '',

        electricityUseType: [], //用电类型   
        electricity_use_selected: '',

        meterNumberType: [], //电表编号
        meter_number_selected: '',
        tableShow: false,
        showCharts: '', //画图
        titleName: '配用电监测',
        legendList: [],
        xdata: [],
        xname: '小时',
        colorList: ['#ffa991'],
        ydata: [],
        listInfor: [], //中间表格
        showTable: false,
        formList: [], //表格
        totalPage: 0,
        pageCurrent: 1, //当前页 
    },
    mounted() {
        this.timeRange()
        this.getProductType()
        this.getElectricType()
        this.$Message.config({
            top: 80
        })

    },
    methods: {
        //获取图表数据
        getAnalysisData() {
            let THIS = this
            THIS.xdata = []
            THIS.ydata = []
            THIS.listInfor = []
            if (THIS.meter_number_selected === '') {
                THIS.$Modal.warning({
                    title: '信息提示',
                    content: '请选择电表编号！'
                })
                return false
            }
            if (THIS.selectTime === '') {
                THIS.$Modal.warning({
                    title: '信息提示',
                    content: '请选择时间！'
                })
                return false
            }
            axios({
                url: HEADER + 'energyAnalysisTwo/check_getPowerAnalysisData.do',
                params: {
                    "meterId":THIS.meter_number_selected, //'0004002167'
                    "type": THIS.datetimeType,
                    "date": THIS.selectTime
                }
            }).then((data) => {
                if(data.data.code === 1){
                    let list = data.data.data.data
                    THIS.showTable = true
                    if (data.data.data) {
                        //组健ydata
                        for (let j = 0; j < THIS.legendList.length; j++) {
                            THIS.ydata.push({
                                name: THIS.legendList[j],
                                type: 'line',
                                data: []
                            })
                        }
                        //中间表格
                        if (data.data.data.countData[0]) {
                            THIS.listInfor = data.data.data.countData[0]
                        }
                        if (list.length > 0) {
                            //实时数据   
                            if (THIS.datetimeType === 'date') {
                                for (let i = 0; i < list.length; i++) {
                                    THIS.ydata[0].data.push(list[i].maxPower)
                                    THIS.xdata.push(list[i].dayType)
                                }
                                THIS.titleName = '配用电监测（' + THIS.selectTime + '）'
                                THIS.legendList = [THIS.selectTime]
                            } else { //日月切换
                                for (let i = 0; i < list.length; i++) {
                                    THIS.ydata[0].data.push(list[i].maxPower)
                                    THIS.ydata[1].data.push(list[i].minPower)
                                    THIS.ydata[2].data.push(list[i].avgPower)
                                    THIS.xdata.push(list[i].dayType)
                                }
                                THIS.tableShow = true
                                THIS.titleName = '配用电监测（' + THIS.selectTime + '-' + THIS.xdata[0] + '~' + THIS.selectTime + '-' + THIS.xdata[THIS.xdata.length - 1] + '）'
                            }
                            
                        } else {
                            THIS.titleName = ''
                        }
                    }
                }else{
                    THIS.$Modal.warning({
                        title: '信息提示',
                        content: '暂无数据！'
                    })
                    return false
                }
            }).then(() => {
                THIS.drawLine(THIS.titleName, THIS.legendList, THIS.xdata, THIS.xname, THIS.ydata, THIS.colorList)
                if (THIS.datetimeType === 'month' || THIS.datetimeType === 'year') {
                    THIS.pageCurrent = 1
                    THIS.getPageList(1)
                }
            })
        },
        //获取分页列表
        getPageList(page) {
            let THIS = this
            axios({
                url: HEADER + 'energyAnalysisTwo/check_getPowerAnalysisDataPage.do',
                params: {
                    "meterId":THIS.meter_number_selected, //'0004002167'
                    "type": THIS.datetimeType,
                    "date": THIS.selectTime,
                    "page": page,
                    "pagesize": 10
                }
            }).then((data) => {
                if(data.data.code === 1){
                    if (data.data.data) {
                        THIS.formList = data.data.data.list
                        THIS.totalPage = data.data.data.allRow
                    }
                }else {
                    THIS.formList = []
                    THIS.totalPage = 0
                }
            }).then(()=>{
                hidePage(THIS.totalPage)      
            })
        },
        // 获取树形图子组件数据
        getSonData(e) {
            this.location_id = e
            this.getMeterNumber()
            //this.getAnalysisData()
        },
        //获取所有产品类型列表
        getProductType() {
            let THIS = this
            axios({
                url: HEADER + 'energyAnalysisTwo/check_getProductTypeList.do',
            }).then((data) => {
                if(data.data.code === 1){
                    let list = data.data.data
                    if (list.length) {
                        for (let i = 0; i < list.length; i++) {
                            THIS.productType.push({
                                value: list[i].meter_type,
                                label: list[i].name
                            })
                        }
                        // //THIS.productType_selected = list[0].meter_type
                        // setTimeout(() => {
                        //     //THIS.getMeterNumber()
                        // }, 100)
                    }
                }
            })
        },
        //获取所有用电类型列表
        getElectricType() {
            let THIS = this
            axios({
                url: HEADER + 'energyAnalysisTwo/check_getUseElectricityTypeList.do',
                params: {}
            }).then((data) => {
                if(data.data.code === 1){
                    let list = data.data.data
                    if (list.length) {
                        for (let i = 0; i < list.length; i++) {
                            THIS.electricityUseType.push({
                                value: list[i].id,
                                label: list[i].type
                            })
                        }
                        // //THIS.electricity_use_selected = list[0].id
                        // setTimeout(() => {
                        //     //THIS.getMeterNumber()
                        // }, 100)
                    }
                }
            })
        },
        //获取下拉表的value
        getProductTypeSelectVal(e) {
            this.productType_selected = e
            this.getMeterNumber()
        },
        getElectricTypeSelectVal(e) {
            this.electricity_use_selected = e
            this.getMeterNumber()
        },
        //获取电表编号
        getMeterNumber() {
            let THIS = this
            THIS.meter_number_selected = ''
            THIS.location_id = sessionStorage.getItem('unitId')
            if(!THIS.location_id){
                THIS.$Modal.warning({
                    title: '信息提示',
                    content: '请选择区域！'
                })
                return false
            }
            if (THIS.productType_selected !== '' && THIS.electricity_use_selected !== '') {
                axios({
                    url: HEADER + 'energyAnalysisTwo/check_getMeterTypeList.do',
                    params: {
                        "meter_type": THIS.productType_selected,
                        "use_electricity_type_id": THIS.electricity_use_selected,
                        "location_id": THIS.location_id
                    }
                }).then((data) => {
                    let list = data.data.data
                    THIS.meterNumberType = []
                    THIS.meter_number_selected = ''
                    THIS.$refs.selectNumber.clearSingleSelect()
                    if (list.length) {
                        for (let i = 0; i < list.length; i++) {
                            THIS.meterNumberType.push({
                                value: list[i].mid,
                                label: list[i].name
                            })
                        }
                    } else {
                        THIS.meterNumberType = []
                        THIS.meter_number_selected = ''
                    }
                })
            }
        },
        //设置当前时间段
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
            let thisDay = year + "-" + month + "-" + day
            this.selectTime = thisDay
            this.legendList = [this.selectTime]
            this.titleName = '配用电监测（' + this.selectTime + '）'
        },
        //日月切换
        toggleTimeType(e) {
            this.selectTime = ''
            this.timeType = e.target.getAttribute('data-type')
            this.timetypeid = e.target.getAttribute('data-typeid')
            if (this.timetypeid == '1') {
                this.datetimeType = 'month'
                this.xname = '时间（天）'
                this.legendList = ['最大', '最小', '平均']
                this.colorList = ['#ffa991', '#98e4b7', '#98bae4']
            } else if (this.timetypeid == '2') {
                this.datetimeType = 'year'
                this.legendList = ['最大', '最小', '平均']
                this.colorList = ['#ffa991', '#98e4b7', '#98bae4']
                this.xname = '时间（月）'
            } else { //实时
                this.datetimeType = 'date'
                this.xname = '时间（小时）'
                this.tableShow = false
                this.colorList = ['#ffa991'],
                this.legendList = [this.selectTime]
            }
        },
        //获取时间
        handleChange(e) {
            this.selectTime = e
        },
        //分页
        pageInfor(e) {
            this.pageCurrent = e
            this.getPageList(this.pageCurrent)
            setTimeout(() => {
                isShowBtn()
            }, 100)
        },
        //图表
        drawLine(titleName, legendList, xdata, xname, ydata, colorList) {
            this.showCharts = echarts.init(document.getElementById('showEchart'))
            let option = {
                title: {
                    text: titleName,
                    left: 'center'
                },
                color: colorList,
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: legendList,
                    bottom: 10,
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: xdata,
                    name: xname,
                    nameTextStyle: {
                        color: '#333',
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#cee6ff',
                            width: 2, //这里是为了突出显示加上的
                        }
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: '#333'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '功率（kW）',
                    nameTextStyle: {
                        color: '#333',
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#cee6ff',
                            width: 2, //这里是为了突出显示加上的
                        }
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: '#333'
                        }
                    }
                },
                series: ydata
            };
            // 使用刚指定的配置项和数据显示图表。
            this.showCharts.setOption(option, true);
        },
    }
})

/*--------------------执行方法--------------------*/

//柱状图和饼状图适配不同分辨率
window.onresize = function () {
    document.getElementById('showEchart').style.width = "75%"
    edVM.showCharts.resize()
}