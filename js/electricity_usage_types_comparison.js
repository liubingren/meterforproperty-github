import {
    Vue, iView, axios,
    HEADER, hidePage,
    isShowBtn,echarts
  } from './general.js'
  import '../css/electricity_usage_types_comparison.less'
  
  let realtimeElectricityData = new Vue({
    el: '#electricity_usage_types_comparison',
    data(){
        return  {
            tabType: 'power',   // 判断tab类型以显示相应页面
            tabTypeName:'功率',
            ProductTypeList:[],
            UseElectricityTypeList:[],
            totalData:[],
            chartData1:null,
            chartData2:null,
            isChildTab:false,       //是否第二级菜单
            childTabName:'',
            midList1:[],
            midList2:[],
            productTypeSelect1:'',
            electricTypeSelect1:'',
            electricTypeSelect1Name:'',
            midSelect1:'',
            productTypeSelect2:'',
            electricTypeSelect2:'',
            electricTypeSelect2Name:'',
            midSelect2:'',
            powerTData: [],
            electricityTData:[],
            lineChart:null,
            electricityTDataCol:[],
            powerTDataCol:[],
            lineChartOption:{},
            detailTData:[],
            detailTDataCol: [
                {
                    title: '第一列数据标题',
                    key: 'title1',
                    align: 'center'
                },
                {
                    title: '第一列数据',
                    align: 'center', 
                    key: 'colOneData'
                },
                {
                    title: '第二列数据标题',
                    align: 'center',
                    key: 'title2'
                },
                {
                    title: '第二列数据',
                    key: 'colTwoData',
                    align: 'center'
                }
            ],
            electricityBarChart:null,
            currentMid:'',
            date:''
        }
    },
    computed: {
      
    },
    methods: {
        formatDate(dateName){
            let newdate = new Date(this[dateName])
            this[dateName] = newdate.getFullYear() + '-' + (newdate.getMonth() + 1) + '-' + newdate.getDate()
            return this[dateName]
        },
        searching(){
            if(!sessionStorage.getItem('unitId')){
                this.$Modal.error({
                    title: '提示',
                    content: '请选择区域!'
                })
                return false
            }
            let url
            switch(this.tabType){
                case 'power':url=HEADER+'powerTypeAnalysis/power.do';break;
                case 'electricity':url=HEADER+'powerTypeAnalysis/electricity.do';break;
            }

            axios.get(url,{
                params: {
                    mid_1:this.midSelect1,
                    mid_2:this.midSelect2,
                    day:this.formatDate('date')
                }
            })
            .then( (response) => {
                this.totalData=response.data.data.TabularData
                this.initTabtypeTable(this.tabType)
                this.assembleChartData(response.data.data.chartData)
            })
            .catch(function (error) {
                console.log(error)
            });
        },
        toggletabType(e){
            this.tabType = e.target.getAttribute('data-type')
            this.tabTypeName = e.target.innerText
            if(this.$refs['mychart']){
                echarts.init(this.$refs['mychart']).dispose()
            }
            if(this.$refs['mychartElectricity']){
                echarts.init(this.$refs['mychartElectricity']).dispose()
            }
            this.chartData1=null
            this.chartData2=null
        },
        // 获取树形图子组件数据
        getSonData (e) {
            console.log(e)
        },
        initChart(refName,chartName,chartOption){
            let that=this
            this.$nextTick(()=> {                               //涉及到v-if,要等dom生成才能
                this[chartName] = echarts.init(this.$refs[refName])
                // 把配置和数据放这里
                this[chartName].setOption(chartOption)
                setTimeout(function (){
                    window.onresize = function () {
                        that[chartName].resize()
                    }
                },200)
            })
        },
        // 渲染父表格
        initTabtypeTable(tabType,dataList){
            let theadDataArrName,tbodyDataArrName,theadData,tbodyData

            // 功率
            if(tabType==='power'){
                theadDataArrName='powerTDataCol'
                tbodyDataArrName='powerTData' 
                theadData=[
                {
                    title: this.electricTypeSelect1Name,
                    align: 'center',
                    children:[{
                        title: '最大值(kW)',
                        align: 'center',
                        key: 'MAX_POWER1'
                    },{
                        title: '发生时间',
                        align: 'center',
                        key: 'createtime1'
                    }]
                },
                {
                    title: this.electricTypeSelect2Name,
                    align: 'center',
                    children:[{
                        title: '最大值(kW)',
                        align: 'center',
                        key: 'MAX_POWER2'
                    },{
                        title: '发生时间',
                        align: 'center',
                        key: 'createtime2'
                    }]
                }]
                const arr = [];
                const obj={}
                for (let i = 0; i <this.totalData.length; i++) {
                   if(i===0){
                    obj['MAX_POWER1']=this.totalData[i].MAX_POWER
                    obj['createtime1']=this.totalData[i].MAX_POWER_TIMES
                   }else{
                    obj['MAX_POWER2']=this.totalData[i].MAX_POWER
                    obj['createtime2']=this.totalData[i].MAX_POWER_TIMES
                   }
                }
                arr.push(obj)
                tbodyData=arr
            }

             // 电量
             if(tabType==='electricity'){
                theadDataArrName='electricityTDataCol'
                tbodyDataArrName='electricityTData' 
                theadData=[{
                    title: this.electricTypeSelect1Name+'总电量(kWh)',
                    align: 'center',
                    key: 'total_electricity1'
                },
                {
                    title: this.electricTypeSelect2Name+'总电量(kWh)',
                    align: 'center',
                    key: 'total_electricity2'
                }]
                const arr = [];
                const obj={}
                for (let i = 0; i <this.totalData.length; i++) {
                   if(i===0){
                    obj['total_electricity1']=this.totalData[i].total_electricity
                   }else{
                    obj['total_electricity2']=this.totalData[i].total_electricity
                   }
                }
                arr.push(obj)

                tbodyData=arr
            }

            this[theadDataArrName]=[]
            this[tbodyDataArrName]=[]
            this[theadDataArrName]=theadData
            this[tbodyDataArrName] = tbodyData
        },
        assembleChartData(data){
            let dataType,chartTitle,yTitle,xTitle
            switch(this.tabType){
                case 'power':dataType='P';chartTitle='配用电检测';yTitle='功率\n(单位:kW)';break;
                case 'electricity':dataType='E';chartTitle='配用电检测';yTitle='电量\n(单位:kWh)';break;
            }
			
            let seriesData=[]
            let chartDataTitle,chartData,chartDataTime
            if(this.tabType!=='electricity'){
                if(!data){
                    this.chartData1=null
                }else{
                    this.chartData1=data
                }
                chartData=JSON.parse(data.DATA)
                chartDataTitle=JSON.parse(data.TITLES)
                chartDataTime=JSON.parse(data.TIME)
                for(let i=0;i<chartData.length;i++){
                    seriesData.push({
                        name:chartDataTitle[i],
                        type:'line',
                        data:chartData[i]
                    })
                }
            }else{
                if(!data){
                    this.chartData2=null
                }else{
                    this.chartData2=data
                }
                chartData=data.DATA
                chartDataTitle=JSON.parse(data.TITLES)
                chartDataTime=data.TIME
                for(let i=0;i<chartData.length;i++){
                    seriesData.push({
                        name:chartDataTitle[i],
                        type:'bar',
                        data:chartData[i]
                    })
                }
            }

            let yAxisData={
                type : 'value',
                name :yTitle
            }

            if(chartDataTime&&seriesData){
                if(this.tabType==='electricity'){
                    this.initChart('mychartElectricity','electricityBarChart',{
                        color: ['#ffa992','#98e4b6'],
                        title : {
                            text: chartTitle,
                            left:'center'
                        },
                        tooltip :{
                            trigger : "axis",
                            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                            }		
                        },
                        legend: {
                            data:chartDataTitle,
                            bottom:0
                        },
                        xAxis : {
                            type : "category",
                            data: chartDataTime,
                            name:'时间',
                            axisTick: {
                                alignWithLabel: true
                            }
                        },
                        yAxis : yAxisData,
                        series : seriesData
                    }) 
                }else{
                    this.initChart('mychart','lineChart',{
                        title: {
                            text: chartTitle,
                            left:'center'
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        legend: {
                            data:chartDataTitle,
                            bottom:0
                        },
                        grid: {
                            left: '3%',
                            right: '10%',
                            bottom: 30,
                            containLabel: true
                        },
                        toolbox: {
                            feature: {
                                saveAsImage: {}
                            }
                        },
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: chartDataTime,
                            name:'时间' 
                        },
                        yAxis: yAxisData,
                        series:seriesData
                    })
                }
            } 

        },
        getMeterTypeList1(e){
            if(!sessionStorage.getItem('unitId')){
                this.$Modal.error({
                    title: '提示',
                    content: '请选择区域!'
                })
                return false
            }
            
            if(typeof(e)==='object'){
                this.electricTypeSelect1Name=e.label
            }
            if(this.productTypeSelect1!=='' && this.electricTypeSelect1!=='' && sessionStorage.getItem('unitId')){
                axios.get(HEADER+'powerTypeAnalysis/check_getMeterTypeList.do',{
                    params: {
                        meter_type:this.productTypeSelect1,
                        use_electricity_type_id:this.electricTypeSelect1,
                        location_id:sessionStorage.getItem('unitId')
                    }
                })
                .then((response) => {
                    if(response.data.data.length===0){
                        this.midSelect1=''
                        this.$refs.midSelect1.clearSingleSelect()
                        this.midList1=[]
                    }else{
                        this.midList1=response.data.data
                    }
                }).catch(function (error) {
                    console.log(error)
                })
            }else{
                this.midSelect1=''
                this.$refs.midSelect1.clearSingleSelect()
                this.midList1=[]      //清空input的值
            }
        },
        getMeterTypeList2(e){
            if(typeof(e)==='object'){
                this.electricTypeSelect2Name=e.label
            }
            if(this.productTypeSelect2!=='' && this.electricTypeSelect2!=='' && sessionStorage.getItem('unitId')){
                axios.get(HEADER+'powerTypeAnalysis/check_getMeterTypeList.do',{
                    params: {
                        meter_type:this.productTypeSelect2,
                        use_electricity_type_id:this.electricTypeSelect2,
                        location_id:sessionStorage.getItem('unitId')
                    }
                })
                .then((response) => {
                    this.midList2=response.data.data
                    if(this.midList2.length===0){
                        this.midSelect2=''
                        this.$refs.midSelect2.clearSingleSelect()
                        this.midList2=[]
                    }
                }).catch(function (error) {
                    console.log(error)
                })
            }else{
                this.midSelect2=''
                this.$refs.midSelect2.clearSingleSelect()
                this.midList2=[]
            }
        }
    },
    mounted () {
        axios.get(HEADER+'powerTypeAnalysis/check_getProductTypeList.do')
        .then((response) => {
            this.ProductTypeList=response.data.data
        })
        .catch(function (error) {
            console.log(error)
        })

        axios.get(HEADER+'powerTypeAnalysis/check_getUseElectricityTypeList.do')
        .then((response) => {
            this.UseElectricityTypeList=response.data.data
        })
        .catch(function (error) {
            console.log(error)
        })
    }
  })