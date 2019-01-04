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
        location_id: '',
        timeType: 'day', // 判断日月类型以显示相应页面
        timetypeid: '1',
        selectTime: '',
        datetimeType: 'month',
        keywords: '',
        productType: [],//产品类型
        productType_selected: '',
        tableShow: true,
        showCharts: '', //画图
        showChartsConstitute: '', //构成
        showChartsContrast: '', //对比
        titleName: '配用电监测',
        xdata: [],
        xname: '时间（天）',
        ydata: [],

        contrastLegend:['去年同期', '上月同期', '本期'],//对比分析
        colorList: ['#ffa991', '#98e4b7', '#98bae4'],
        yList: [],
        xList:[],

        tableList: [],
        totalPage: 0,
        pageCurrent: 1, //当前页 
        tableDate:false,

        constituteDate : [],
        dataLegend:[]
},

    mounted() {
        this.timeRange()
        this.getProductType()
        this.$Message.config({
            top: 80
        })
        
    },
    methods: {
        getAnalysisData() {
            let THIS = this
            THIS.xdata = []
            THIS.ydata = []
            THIS.xList = []
            THIS.yList = []
            THIS.constituteDate = []
            THIS.dataLegend = []
            THIS.location_id = sessionStorage.getItem('unitId')
            if(!THIS.location_id){
                THIS.$Modal.warning({
                    title: '提示',
                    content: '请选择区域!'
                })
                return false
            }
            if (THIS.productType_selected === '') {
                THIS.$Modal.warning({
                    title: '提示',
                    content: '请选择产品类型！'
                })
                return false
            }
            if (THIS.selectTime === '') {
                THIS.$Modal.warning({
                    title: '提示',
                    content: '请选择时间！'
                })
                return false
            }
             axios({
                url: HEADER + 'energyAnalysisTwo/check_getElectricityStructyreAnalysisData.do',
                params: {
                    "meter_type": THIS.productType_selected, 
                    "type": THIS.datetimeType,
                    "date": THIS.selectTime,
                    "locationId":THIS.location_id
                }
            }).then((data) =>{
                if(data.data.code === 1){
                    THIS.xdata = []
                    THIS.ydata = []
                    THIS.xList = []
                    THIS.yList = []
                    THIS.constituteDate = []
                    THIS.dataLegend = []
                    let barList = data.data.data
                    //对比分析
                    for (let j = 0; j < THIS.contrastLegend.length; j++) {
                        THIS.xList.push({
                            name: THIS.contrastLegend[j],
                            type: 'bar',
                            barGap: 0,
                            data: [],
                            barMaxWidth:30,//最大宽度
                        })
                    }
                    
                    if(THIS.datetimeType === 'month'){
                        //柱状图日数据
                    for(let i = 0; i < barList.monthW.length; i++){
                        THIS.xdata.push(barList.monthW[i].datetime.split('-')[2])
                        THIS.ydata.push(barList.monthW[i].w)
                    }
                    THIS.titleName = '配用电监测（' + (THIS.selectTime + '-' + THIS.xdata[0] + '~' + THIS.selectTime + '-' + THIS.xdata[THIS.xdata.length - 1]) + '）'
                    
                    //对比分析
                    //上年同期
                        for(let i = 0; i < barList.countElctricityUseTypeList.length; i++){
                            THIS.xList[0].data.push(barList.countElctricityUseTypeList[i].lastYearMonthData)
                            THIS.xList[1].data.push(barList.countElctricityUseTypeList[i].lastMonthData)
                            THIS.xList[2].data.push(barList.countElctricityUseTypeList[i].nowYearData)
                            THIS.yList.push(barList.countElctricityUseTypeList[i].type)
                        }
                    }
                    //月数据
                    if(THIS.datetimeType === 'year'){
                        //柱状图
                        for(let i = 0; i < barList.yearData .length; i++){
                        THIS.xdata.push(barList.yearData[i].datetime.split('-')[1])
                        THIS.ydata.push(barList.yearData[i].w)
                        }
                        THIS.titleName = '配用电监测（' + (THIS.selectTime + '-' + THIS.xdata[0] + '~' + THIS.selectTime + '-' + THIS.xdata[THIS.xdata.length - 1]) + '）'
                    
                        //对比分析
                        for(let i = 0; i < barList.countElctricityUseTypeList.length; i++){
                            THIS.xList[0].data.push(barList.countElctricityUseTypeList[i].lastYearMonthData)
                            THIS.xList[1].data.push(barList.countElctricityUseTypeList[i].nowYearData)
                            THIS.yList.push(barList.countElctricityUseTypeList[i].type)
                        }   
                    }
                    //构成分析nowElctricityUseTypeList
                    for(let i = 0; i < barList.nowElctricityUseTypeList.length; i++){
                        THIS.constituteDate.push({
                                value: barList.nowElctricityUseTypeList[i].w,
                                name: barList.nowElctricityUseTypeList[i].type
                            })
                        THIS.dataLegend.push(barList.nowElctricityUseTypeList[i].type)
                    }
                }else{
                    THIS.$Modal.warning({
                        title: '信息提示',
                        content: '暂无数据！'
                    })
                    return false
                }
            }).then(()=>{
                THIS.drawLine(THIS.titleName, THIS.xdata, THIS.xname, THIS.ydata)
                THIS.drawLineContrast(THIS.contrastLegend,THIS.yList,THIS.xList,THIS.colorList)
                THIS.drawLineConstitute(THIS.constituteDate,THIS.dataLegend)
                THIS.pageCurrent = 1
                THIS.getPageList(1)
            })           
        },
         //获取分页列表
         getPageList(page) {
            let THIS = this
            if (!THIS.location_id) {
                THIS.location_id = sessionStorage.getItem('unitId')
            }
            axios({
                url: HEADER + 'energyAnalysisTwo/check_getElectricityStructyreAnalysisDataList.do',
                params: {
                    "meterId": THIS.meter_number_selected, //'0004002167'
                    "type": THIS.datetimeType,
                    "date": THIS.selectTime,
                    "page": page,
                    "pagesize": 10,
                    "meter_type":THIS.productType_selected,
                    'locationId':THIS.location_id
                }
            }).then((data) => {
                if(data.data.code === 1){
                    THIS.tableList = []
                    if (data.data.data.list) {
                        THIS.tableList = data.data.data.list
                        THIS.totalPage = data.data.data.allRow
                        THIS.tableDate = true
                    } else {
                        THIS.tableList = []
                        THIS.totalPage = 0
                    }
                }else {
                    THIS.tableList = []
                    THIS.totalPage = 0
                    return false
                }
            }).then(()=>{
                hidePage(THIS.totalPage)      
            })
        },
        // 获取树形图子组件数据
        getSonData(e) {
            this.location_id = e
            this.getAnalysisData()
        },
        //获取所有产品类型列表
        getProductType(){
            let THIS = this
            THIS.productType =[]
            axios({
                url: HEADER + 'energyAnalysisTwo/check_getProductTypeList.do',
            }).then((data) =>{
                if(data.data.code === 1){
                    let list = data.data.data
                    if(list.length){
                        for(let i = 0; i < list.length; i++){
                            THIS.productType.push({
                                value: list[i].meter_type,
                                label: list[i].name
                            })
                        }
                        THIS.productType_selected = list[0].meter_type
                    }
                    THIS.getAnalysisData()
                }
            })
        },
        //获取下拉表的value
        getProductTypeSelectVal(e){
            this.productType_selected = e
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
            this.timeType = e.target.getAttribute('data-type')
            this.timetypeid = e.target.getAttribute('data-typeid')
            this.keywords = ''
           // let thisTime = 
           this.selectTime = ''
            if (this.timetypeid == '1') { 
                this.datetimeType = 'month'
                this.titleName = '配用电监测'
                this.contrastLegend = ['去年同期', '上月同期', '本期'],
                this.colorList = ['#ffa991', '#98e4b7', '#98bae4'],
                this.xname = '时间（天）'
                this.tableShow = true
            } else {
                this.datetimeType = 'year'
                this.titleName = '配用电监测'
                this.xname = '时间（月）'
                this.contrastLegend = ['去年同期','本期']
                this.colorList = ['#ffa991', '#98e4b7']
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
        drawLine(titleName, xdata, xname, ydata) {
            this.showCharts = echarts.init(document.getElementById('showEchart'))
            let option = {
                title: {
                    text: titleName,
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
                color: '#98bae4',
                legend: {
                    data: ['本期'],
                    bottom: 10
                },
                xAxis: {
                    type: 'category',
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
                },
                series: [{
                    name: '本期',
                    data: ydata,
                    type: 'bar',
                    barMaxWidth:30,//最大宽度
                }]
            }
            // 使用刚指定的配置项和数据显示图表。
            this.showCharts.setOption(option,true);
        },
        // 对比分析
        drawLineContrast(legend,yList,xList,colorList) {
            this.showChartsContrast = echarts.init(document.getElementById('showEchart1'))
            let option = {
                title: {
                    text: '对比分析',
                    left: 'center'
                },
                color: colorList,
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: legend,
                    bottom: 10
                },
                xAxis: {
                    type: 'value',
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
                grid: {
                    left: '15%',
                    right: '8%'
                },
                yAxis: {
                    type: 'category',
                    data:yList,
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
                },
                series: xList
            }
            // 使用刚指定的配置项和数据显示图表。
            this.showChartsContrast.setOption(option,true);
        },
        // 构成分析
        drawLineConstitute(constituteDate,dataLegend) {
            this.showChartsConstitute = echarts.init(document.getElementById('showEchart2'))
            let data = constituteDate
            let option = {
                title: {
                    text: '构成分析',
                    subtext: '电量（kWh）',
                    left: 'center'
                },
                color:[ '#98e4b7', '#98bae4','#f19ec2', '#0bdfb6', '#546578','#b7b7d1','#d48265', '#91c7ae','#749f83', '#e2e7e7', '#b118b1', '#bda29a','#6e7074', '#ffa991','#c4ccd3'],
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}: {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    itemWidth: 12,
                    itemHeight: 10,
                    right: 0,
                    top: 30,
                    data: dataLegend,
                    formatter: function (name) {
                        var total = 0;
                        var target;
                        for (var i = 0, l = data.length; i < l; i++) {
                            total += data[i].value;
                            if (data[i].name == name) {
                                target = data[i].value;
                            }
                        }
                        if(total > 0){
                            return '{a|' + ((target / total) * 100).toFixed(2) + '}' + '%' + '\n' + '{b|' + name + '}' 
                        }else{
                            return '{a|}暂无数据' + '\n' + '{b|' + name + '}' 
                        }
                    },
                    textStyle: {
                        rich: {
                            a: {
                                fontSize: 14,
                                color: '#333',
                                fontWeight: 'bold'
                            },
                            b: {
                                fontSize: 12,
                                color: '#999'
                            }
                        }
                    }

                },
                series: [{
                    type: 'pie',
                    radius: ['35%', '50%'],
                    avoidLabelOverlap: false,
                    center: ['40%', '50%'],
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: data
                }]
            }
            // 使用刚指定的配置项和数据显示图表。
            this.showChartsConstitute.setOption(option,true);
        },
    }
})

/*--------------------执行方法--------------------*/

//柱状图和饼状图适配不同分辨率
window.onresize = function () {
    document.getElementById('showEchart').style.width = "75%"
    document.getElementById('showEchart1').style.width = "50%"
    document.getElementById('showEchart2').style.width = "50%"

    edVM.showCharts.resize()
    edVM.showChartsConstitute.resize()
    edVM.showChartsContrast.resize()
}