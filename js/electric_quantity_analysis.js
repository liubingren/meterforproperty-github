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
        location_id: '',//区域id
        timeType: 'day', // 判断日月类型以显示相应页面
        timetypeid: '1',//区别日月类型
        selectTime: '',//选择的日期
        datetimeType: 'month',//日历类型
        productType: [], //产品类型
        productType_selected: '',//选择的产品类型
        electricityUseType: [], //用电类型
        electricity_use_selected: '',//选择的用电类型
        meterNumberType: [], //电表编号 
        meter_number_selected: '',//选择的电表编号 
        showCharts: '', //画图
        titleName: '配用电监测',
        legendList: ['去年同期', '上月同期', '本期'],
        colorList: ['#ffa991', '#98e4b7', '#98bae4'],
        xdata: [],//x轴数据
        xname: '时间（天）',
        ydata: [],//x轴数据
        tableShow: true,//显示表格某些字段
        tableList: [],//表格数据
        tableDate: false,//显示表格
        totalPage: 0,//总页数
        pageCurrent: 1//当前页 
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
        //获取处理图表数据
        getAnalysisData() {
            let THIS = this
            THIS.xdata = []
            THIS.ydata = []
            if (THIS.meter_number_selected === '') {
                THIS.$Modal.warning({
                    title: '提示',
                    content: '请选择电表编号!'
                })
                return false
            }
            if (THIS.selectTime === '') {
                THIS.$Modal.warning({
                    title: '提示',
                    content: '请选择时间!'
                })
                return false
            }
            axios({
                url: HEADER + 'energyAnalysisTwo/check_getElectricityAnalysisData.do',
                params: {
                    "meterId": THIS.meter_number_selected, //'0004002167'
                    "type": THIS.datetimeType,
                    "date": THIS.selectTime
                }
            }).then((data) => {
                if(data.data.code === 1){
                    let list = data.data.data
                    //根据legendList组合ydata数组结构
                    for (let j = 0; j < THIS.legendList.length; j++) {
                        THIS.ydata.push({
                            name: THIS.legendList[j],
                            type: 'bar',
                            barGap: 0,
                            data: [],
                            barMaxWidth:30,//最大宽度
                        })
                    }               
                    if (list) {
                        for (let i = 0; i < list.length; i++) {
                            
                            THIS.ydata[0].data.push(list[i].lastYearW)
                            if (THIS.datetimeType === 'month') {
                                THIS.ydata[1].data.push(list[i].lastMonthW)
                                THIS.ydata[2].data.push(list[i].nowYearW)
                                THIS.xdata.push(list[i].dateTime.split(' ')[0].split('-')[2])
                            } else if (THIS.datetimeType === 'year') {
                                THIS.ydata[1].data.push(list[i].nowYearW)
                                THIS.xdata.push(list[i].dateTime.split(' ')[0].split('-')[1])
                            }
                        }
                        THIS.titleName = '配用电监测（' + (THIS.selectTime + '-' + THIS.xdata[0] + '~' + THIS.selectTime + '-' + THIS.xdata[THIS.xdata.length - 1]) + '）'
                    } else {
                        THIS.xdata = []
                        THIS.ydata = []
                        THIS.titleName = '配用电监测'
                    }
                    
                }else {
                    THIS.xdata = []
                    THIS.ydata = []
                    THIS.titleName = '配用电监测'
                }
            }).then(() => {
                THIS.drawLine(THIS.titleName, THIS.legendList, THIS.xdata, THIS.xname, THIS.ydata, THIS.colorList)
                THIS.pageCurrent = 1
                THIS.getPageList(1)
            })
        },
        //获取分页列表
        getPageList(page) {
            let THIS = this            
            axios({
                url: HEADER + 'energyAnalysisTwo/check_getElectricityAnalysisDataList.do',
                params: {
                    "meterId": THIS.meter_number_selected, //'0004002167'
                    "type": THIS.datetimeType,
                    "date": THIS.selectTime,
                    "page": page,
                    "pagesize": 10
                }
            }).then((data) => {
                THIS.tableList = []
                if(data.data.code === 1){
                    if (data.data.data.list) {                      
                        THIS.tableList = data.data.data.list
                        THIS.totalPage = data.data.data.allRow   
                        THIS.tableDate = true              
                    } else {
                        THIS.tableList = []
                        THIS.totalPage = 0
                    }                   
                } else {
                    THIS.tableDate = false
                    THIS.tableList = []
                    THIS.totalPage = 0
                    THIS.$Modal.warning({
                        title: '信息提示',
                        content: '暂无数据！'
                    })
                    return false
                }
            }).then(()=>{
                hidePage(THIS.totalPage)      
            })
        },
        // 获取树形图子组件数据
        getSonData(e) {
            this.location_id = e
            this.getMeterNumber()
        },
        //获取所有产品类型列表
        getProductType() {
            let THIS = this
            THIS.productType = []
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
                       //THIS.productType_selected = list[0].meter_type
                    }
                    // setTimeout(() => {
                    //     THIS.getMeterNumber()
                    // }, 100);
                }                
            })
        },
        //获取所有用电类型列表
        getElectricType() {
            let THIS = this
            THIS.electricityUseType = []
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
                       // THIS.electricity_use_selected = list[0].id
                    }
                    // setTimeout(() => {
                    //     THIS.getMeterNumber()
                    // }, 100)
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
                    title: '提示',
                    content: '请选择区域!'
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
            if (month < 10) {
                month = "0" + month;
            }
            let thisDay = year + "-" + month
            this.selectTime = thisDay
        },
        //日月切换
        toggleTimeType(e) {
            this.selectTime = ''
            this.timeType = e.target.getAttribute('data-type')
            this.timetypeid = e.target.getAttribute('data-typeid')
            if (this.timetypeid == '1') {
                this.datetimeType = 'month'
                this.xname = '时间（天）'
                this.legendList = ['去年同期', '上月同期', '本期']
                this.colorList = ['#ffa991', '#98e4b7', '#98bae4'],
                this.tableShow = true    
            } else {
                this.datetimeType = 'year'
                this.legendList = ['去年同期', '本期']
                this.colorList = ['#ffa991', '#98bae4'],
                this.xname = '时间（月）'
                this.tableShow = false
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
            setTimeout(() =>{
                isShowBtn()
            },100)
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
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: legendList,
                    bottom: 10,
                },
                calculable: true,
                xAxis: [{
                    type: 'category',
                    axisTick: {
                        show: false
                    },
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
                }],
                yAxis: [{
                    type: 'value',
                    name: '电量（kWh）',
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
                }],
                series: ydata
            };
            // 使用刚指定的配置项和数据显示图表。true可选，是否不跟之前设置的option进行合并，默认为false，即合并。
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