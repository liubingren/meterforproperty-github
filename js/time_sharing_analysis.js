import { Vue, HEADER, axios, hidePage, isShowBtn} from './general.js'
import echarts from 'echarts'
import '../css/electric_analysis.less'

let edVM = new Vue({
    el: '#electric_analysis',
    data: {
        location_id:'',
        timeType:'date',// 判断日月类型以显示相应页面
        timetypeid:'1',
        selectTime:'',
        datetimeType:'month',
        keywords: '',
        productType: [],//产品类型       
        productType_selected:'',
        electricityUseType: [],//用电类型
        electricity_use_selected:'',
        meterNumberType: [],//电表编号     
        meter_number_selected:'',
        showCharts:'',//画图
        showChartsConstitute:'',//构成
        showChartsContrast:'',//对比
        titleName:'配用电监测',
        legendList:['峰电量','平电量','谷电量'],
        xdata:[],
        xname:'时间（天）',
        ydata:[],
        //对比分析
        colorList : ['#ffa991', '#98e4b7', '#98bae4'],
        contrastlegend:['去年同期','上月同期','本期'],
        xcontrastAxis:[],
        dataList:[]
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
        getAnalysisData(){
            let THIS = this
            THIS.xdata = []
            THIS.ydata = []
            THIS.xcontrastAxis = []
            THIS.dataList = []
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
                url: HEADER + 'energyAnalysisTwo/check_getElectricityDevideAnalysisData.do',
                params: {
                    "meterId": THIS.meter_number_selected, //'0004002167'
                    "type": THIS.timeType,
                    "date": THIS.selectTime
                }
            }).then((data) => {
                if(data.data.code === 1){
                    let barList = data.data.data.sqlExcle
                    let contrastbarList = data.data.data.sqlRate
                    if(barList.length > 0){
                        for (let j = 0; j < THIS.legendList.length; j++) {
                            THIS.ydata.push({
                                name: THIS.legendList[j],
                                type: 'bar',
                                barGap: 0,
                                data: [],
                                barMaxWidth:30,//最大宽度
                            })
                        }
                        for(let i = 0; i < barList.length; i++){
                            THIS.ydata[0].data.push(barList[i].peakElectricity)
                            THIS.ydata[1].data.push(barList[i].levelElectricity)
                            THIS.ydata[2].data.push(barList[i].valleyElectricity)
                            if(THIS.timeType === 'date'){
                                THIS.xdata.push(barList[i].createtime.split(' ')[0].split('-')[2])
                            }else{
                                THIS.xdata.push(barList[i].createtime.split(' ')[0].split('-')[1])
                            }
                        }

                        if(THIS.timeType === 'date'){
                            THIS.titleName = '配用电监测（' + (THIS.selectTime + '-' + THIS.xdata[0] + '~' + THIS.selectTime + '-' + THIS.xdata[THIS.xdata.length - 1]) + '）'
                        }else{
                            THIS.titleName = '配用电监测（' + (THIS.selectTime.split('-')[0] + '-' + THIS.xdata[0] + '~' + THIS.selectTime.split('-')[0] + '-' + THIS.xdata[THIS.xdata.length - 1]) + '）'
                        }
                        
                    }else{
                        THIS.xdata = []
                        THIS.ydata = []
                    }

                    if(contrastbarList.length > 0){
                        for (let j = 0; j < THIS.contrastlegend.length; j++) {
                            THIS.xcontrastAxis.push({
                                name: THIS.contrastlegend[j],
                                type: 'bar',
                                barGap: 0,
                                data: [],
                                barMaxWidth:30,//最大宽度
                            })
                        }
                        if(THIS.timeType === 'date'){
                            THIS.xcontrastAxis[0].data.push(contrastbarList[0].lastYearPeakRate)
                            THIS.xcontrastAxis[0].data.push(contrastbarList[0].lastYearLevelRate)
                            THIS.xcontrastAxis[0].data.push(contrastbarList[0].lastYearvalleyRate)
                            THIS.xcontrastAxis[1].data.push(contrastbarList[0].lastMonthPeakRate)
                            THIS.xcontrastAxis[1].data.push(contrastbarList[0].lastMonthLevelRate)
                            THIS.xcontrastAxis[1].data.push(contrastbarList[0].lastMonthvalleyRate)
                            THIS.xcontrastAxis[2].data.push(contrastbarList[0].nowYearPeakRate)
                            THIS.xcontrastAxis[2].data.push(contrastbarList[0].nowYearLevelRate)
                            THIS.xcontrastAxis[2].data.push(contrastbarList[0].nowYearvalleyRate)
                        }else{
                            THIS.xcontrastAxis[0].data.push(contrastbarList[0].lastMonthPeakRate)
                            THIS.xcontrastAxis[0].data.push(contrastbarList[0].lastMonthLevelRate)
                            THIS.xcontrastAxis[0].data.push(contrastbarList[0].lastMonthvalleyRate)
                            THIS.xcontrastAxis[1].data.push(contrastbarList[0].nowYearPeakRate)
                            THIS.xcontrastAxis[1].data.push(contrastbarList[0].nowYearLevelRate)
                            THIS.xcontrastAxis[1].data.push(contrastbarList[0].nowYearvalleyRate)
                        }
                        THIS.dataList.push({value:contrastbarList[0].nowYearPeakRate, name:'峰占比'})
                        THIS.dataList.push({value:contrastbarList[0].nowYearLevelRate, name:'平占比'})
                        THIS.dataList.push({value:contrastbarList[0].nowYearvalleyRate, name:'谷占比'})
                    }else{
                        THIS.xcontrastAxis = []
                        THIS.dataList = []
                    }
                }else{
                    THIS.$Modal.warning({
                        title: '信息提示',
                        content: '暂无数据！'
                    })
                    return false
                }
            }).then(()=>{
                THIS.drawLine(THIS.titleName,THIS.legendList,THIS.xdata,THIS.xname,THIS.ydata)
                THIS.drawLineContrast(THIS.colorList,THIS.contrastlegend,THIS.xcontrastAxis)
                THIS.drawLineConstitute(THIS.dataList)
            })

            
        },
        // 获取树形图子组件数据
        getSonData(e) {
            this.location_id = e
            this.getMeterNumber()
            //this.getAnalysisData()
        },
        //获取所有产品类型列表
        getProductType(){
            let THIS = this
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
                        // THIS.productType_selected = list[0].meter_type
                        // setTimeout(() =>{
                        //     THIS.getMeterNumber()
                        // },100)
                    }
                }
            })
        },
        //获取所有用电类型列表
        getElectricType(){
            let THIS = this
            axios({
                url: HEADER + 'energyAnalysisTwo/check_getUseElectricityTypeList.do',
                params: {
                }
            }).then((data) =>{
                if(data.data.code === 1){
                    let list = data.data.data
                    if(list.length){
                        for(let i = 0; i < list.length; i++){
                            THIS.electricityUseType.push({
                                value: list[i].id,
                                label: list[i].type
                            })
                        }
                        // THIS.electricity_use_selected = list[0].id
                        // setTimeout(() =>{
                        // THIS.getMeterNumber()
                        // },100)
                    }  
                }              
            })
        },
        //获取下拉表的value
        getProductTypeSelectVal(e){
            this.productType_selected = e
            this.getMeterNumber()
        },
        getElectricTypeSelectVal(e){
            this.electricity_use_selected = e
            this.getMeterNumber()
        },
        //获取电表编号
        getMeterNumber(){
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
            if(THIS.productType_selected !== '' && THIS.electricity_use_selected !== ''){
                axios({
                    url: HEADER + 'energyAnalysisTwo/check_getMeterTypeList.do',
                    params: {
                        "meter_type":THIS.productType_selected,
                        "use_electricity_type_id":THIS.electricity_use_selected,
                        "location_id":THIS.location_id
                    }
                }).then((data) =>{            
                    let list = data.data.data
                    THIS.meterNumberType = []
                    THIS.meter_number_selected = ''
                    THIS.$refs.selectNumber.clearSingleSelect()
                    if(list.length){
                        for(let i = 0; i < list.length; i++){
                            THIS.meterNumberType.push({
                                value: list[i].mid,
                                label: list[i].name
                            })
                        }
                    }else{
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
            this.timeType = e.target.getAttribute('data-type')
            this.timetypeid = e.target.getAttribute('data-typeid')
            this.keywords = ''
            if(this.timetypeid == '1'){
                this.datetimeType = 'month'
                this.titleName='配用电监测'
                this.xname = '时间（天）'
                this.contrastlegend =  ['去年同期','上月同期','本期'],
                this.colorList = ['#ffa991', '#98e4b7', '#98bae4']
            }else{
                this.datetimeType = 'month'
                this.titleName='配用电监测'
                this.xname = '时间（月）'
                this.contrastlegend = ['上月同期', '本期']
                this.colorList = ['#ffa991', '#98e4b7']
            }
            this.selectTime =''
        },
        //获取时间
        handleChange(e) {
            this.selectTime = e
        },
        //图表
        drawLine(titleName,legendList,xdata,xname,ydata){
            this.showCharts = echarts.init(document.getElementById('showEchart'))
            let option = {
                title: {
                    text: titleName,
                    left: 'center'
                },
                color: ['#ffa991', '#98e4b7', '#98bae4'],
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
                xAxis: [
                    {
                        type: 'category',
                        axisTick: {show: false},
                        data: xdata,
                        name:xname,
                        nameTextStyle :{
                            color:'#333',
                        },
                        axisLine:{
                            lineStyle:{
                                color:'#cee6ff',
                                width:2,//这里是为了突出显示加上的
                            }
                        },
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: '#333'
                            }
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name:'电量（kWh）',
                        nameTextStyle :{
                            color:'#333',
                        },
                        axisLine:{
                            lineStyle:{
                                color:'#cee6ff',
                                width:2,//这里是为了突出显示加上的
                            }
                        },
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: '#333'
                            }
                        }
                    }
                ],
                series: ydata
            };
            // 使用刚指定的配置项和数据显示图表。
            this.showCharts.setOption(option,true);
        },
        // 对比分析
        drawLineContrast(colorList,legendList,xAxis){
            this.showChartsContrast = echarts.init(document.getElementById('showEchart1'))
            let option = {
                title: {
                    text: '对比分析',
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
                xAxis: [
                    {
                        type: 'category',
                        axisTick: {show: false},
                        data: ['峰占比','平占比','谷占比'],
                        nameTextStyle :{
                            color:'#333',
                        },
                        axisLine:{
                            lineStyle:{
                                color:'#cee6ff',
                                width:2,//这里是为了突出显示加上的
                            }
                        },
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: '#333'
                            }
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name:'占比（%）',
                        nameTextStyle :{
                            color:'#333',
                        },
                        axisLine:{
                            lineStyle:{
                                color:'#cee6ff',
                                width:2,//这里是为了突出显示加上的
                            }
                        },
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: '#333'
                            }
                        }
                    }
                ],
                series: xAxis
            };
            // 使用刚指定的配置项和数据显示图表。
            this.showChartsContrast.setOption(option,true);
        },
        // 构成分析
        drawLineConstitute(dataList){
            this.showChartsConstitute = echarts.init(document.getElementById('showEchart2'))
            let data=dataList
            let option = {
                title: {
                    text: '构成分析',
                    subtext: '占比（%）',
                    left:'center'
                },
                color: ['#ffa991', '#98e4b7', '#98bae4'],
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}: {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    itemWidth: 12,
                    itemHeight: 10,
                    right:0,
                    top:30,
                    data:['峰占比','平占比','谷占比'],
                    formatter:  function(name){
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
                    textStyle:{
                        rich:{
                            a:{
                                fontSize:14,
                                color:'#333',
                                fontWeight: 'bold'
                            },
                            b:{
                                fontSize:12,
                                color:'#999'
                            }
                        }
                    }

                },
                series: [
                    {
                        type:'pie',
                        radius: ['35%', '50%'],
                        avoidLabelOverlap: false,
                        center: ['50%', '50%'],
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
                        data:data
                    }
                ]
            }
            // 使用刚指定的配置项和数据显示图表。
            this.showChartsConstitute.setOption(option,true);
        },
    }
})

/*--------------------执行方法--------------------*/

//柱状图和饼状图适配不同分辨率
window.onresize = function () {
    document.getElementById('showEchart').style.width="75%"
    document.getElementById('showEchart1').style.width="50%"
    document.getElementById('showEchart2').style.width="50%"
    
    edVM.showCharts.resize()
    edVM.showChartsConstitute.resize()
    edVM.showChartsContrast.resize()    
  }
  