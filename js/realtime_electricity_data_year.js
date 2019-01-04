import {
    Vue, iView, axios,
    HEADER, hidePage,
    isShowBtn,echarts
  } from './general.js'
  import '../css/realtime_electricity_data_year.less'
  
  let realtimeElectricityData = new Vue({
    el: '#realtime_electricity_data_year',
    data(){
        return  {
            tabType: 'power',   // 判断tab类型以显示相应页面
            tabTypeName:'功率',
            ProductTypeList:[],
            UseElectricityTypeList:[],
            totalData:[],
            isChildTab:false,       //是否第二级菜单
            childTabName:'',
            productTypeSelect:'',
            electricTypeSelect:'',
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
            date:'',
            PCurrentPage:1,
            ECurrentPage:1,
            PTotalPage:0,
            ETotalPage:0
        }
    },
    computed: {
      
    },
    methods: {
        updateTable(tabType,e){
            switch(tabType){
                case 'P':this.PCurrentPage=e;break;
                case 'E':this.ECurrentPage=e;break;
            }
            this.searching(e,'fromPage')
        },
        formatDate(){
            let newdate = new Date(this.date)
            this.date = ''+newdate.getFullYear()
            return this.date
        },
        searching(e,from){
            if(!sessionStorage.getItem('unitId')){
                this.$Modal.error({
                    title: '提示',
                    content: '请选择区域!'
                })
                return false
            }

            let dataType,page
            switch(this.tabType){
                case 'power':dataType='P';page=this.PCurrentPage;break;
                case 'electricity':dataType='E';page=this.ECurrentPage;break;
            }

            if(!from){
                page=1
            }
            axios.get(HEADER+'yearPowerData/check_list.do',{
                params: {
                    page:page,
                    pagesize:10,
                    location_id: sessionStorage.getItem('unitId'),
                    meter_type:this.productTypeSelect,
                    use_electricity_type_id:this.electricTypeSelect,
                    dataType,
                    date:this.formatDate()
                }
            })
            .then( (response) => {
                this.totalData=response.data.data.list
                switch(this.tabType){
                    case 'power':this.PCurrentPage=response.data.data.currentPage;this.PTotalPage=response.data.data.allRow;break;
                    case 'electricity':this.ECurrentPage=response.data.data.currentPage;this.ETotalPage=response.data.data.allRow;break;
                }
                this.initTabtypeTable(this.tabType)
            })
            .catch(function (error) {
                console.log(error)
            })
        },
        toggletabType(e){
            this.tabType = e.target.getAttribute('data-type')
            this.tabTypeName = e.target.innerText
            // this.initTabtypeTable(this.tabType)        
        },
        backToParent(){
            this.isChildTab=false
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
                if(this.productTypeSelect!==1){
                    theadData=[{
                        title: '电表编号',
                        key: 'mid',
                        align: 'center'
                    },
                    {
                        title: '最大功率(kW)',
                        align: 'center',
                        key: 'MAX_POWER'
                    },
                    {
                        title: '最小功率(kW)',
                        align: 'center',
                        key: 'MIN_POWER'
                    },
                    {
                        title: '平均功率(kW)',
                        align: 'center',
                        key: 'AVG_POWER'
                    },
                    {
                        title: '峰谷差(kW)',
                        align: 'center',
                        key: 'PeakValley_POWER'
                    },
                    {
                        title: '峰谷差率(kW)',
                        align: 'center',
                        key: 'PeakValley_POWER_RATE'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            MAX_POWER: this.totalData[i].MAX_POWER,
                            MIN_POWER: this.totalData[i].MIN_POWER,
                            AVG_POWER: this.totalData[i].AVG_POWER,
                            PeakValley_POWER: this.totalData[i].PeakValley_POWER,
                            PeakValley_POWER_RATE: this.totalData[i].PeakValley_POWER_RATE
                        });
                    }
                    tbodyData=arr
                }else{
                    theadData=[{
                        title: '电表编号',
                        key: 'mid',
                        align: 'center'
                    },
                    {
                        title: '最大功率(kW)',
                        align: 'center',
                        key: 'MAX_PT'
                    },
                    {
                        title: '最小功率(kW)',
                        align: 'center',
                        key: 'MIN_PT'
                    },
                    {
                        title: '平均功率(kW)',
                        align: 'center',
                        key: 'AVG_PT'
                    },
                    {
                        title: '峰谷差(kW)',
                        align: 'center',
                        key: 'PeakValley_POWER'
                    },
                    {
                        title: '峰谷差率(kW)',
                        align: 'center',
                        key: 'PeakValley_POWER_RATE'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            MAX_PT: this.totalData[i].MAX_PT,
                            MIN_PT: this.totalData[i].MIN_PT,
                            AVG_PT: this.totalData[i].AVG_PT,
                            PeakValley_POWER: this.totalData[i].PeakValley_POWER,
                            PeakValley_POWER_RATE: this.totalData[i].PeakValley_POWER_RATE
                        });
                    }
                    tbodyData=arr
                }
            }

            // 电量
            if(tabType==='electricity'){
                theadDataArrName='electricityTDataCol'
                tbodyDataArrName='electricityTData' 
                if(this.productTypeSelect!==1){
                    theadData=[{
                        title: '电表编号',
                        key: 'mid',
                        align: 'center'
                    },
                    {
                        title: '有功电量(kWh)',
                        align: 'center',
                        key: 'web',
                        children:[{
                            title: '总',
                            align: 'center', 
                            key: 'total_electricity'
                        },{
                            title: '峰',
                            align: 'center', 
                            key: 'peak_electricity'
                        },{
                            title: '平',
                            align: 'center', 
                            key: 'level_electricity'
                        },{
                            title: '谷',
                            align: 'center', 
                            key: 'valley_electricity'
                        }]
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            total_electricity: this.totalData[i].total_electricity,
                            peak_electricity: this.totalData[i].peak_electricity,
                            level_electricity: this.totalData[i].level_electricity,
                            valley_electricity: this.totalData[i].valley_electricity
                        });
                    }
                    tbodyData=arr
                }else{
                    theadData=[{
                        title: '电表编号',
                        key: 'mid',
                        align: 'center'
                    },
                    {
                        title: '有功电量(kWh)',
                        align: 'center',
                        key: 'web',
                        children:[{
                            title: '总',
                            align: 'center', 
                            key: 'total_electricity'
                        },{
                            title: '峰',
                            align: 'center', 
                            key: 'peak_electricity'
                        },{
                            title: '平',
                            align: 'center', 
                            key: 'level_electricity'
                        },{
                            title: '谷',
                            align: 'center', 
                            key: 'valley_electricity'
                        }]
                    },
                    {
                        title: '无功电量(kWh)',
                        align: 'center',
                        key: 'reactive_electricity'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            total_electricity: this.totalData[i].total_electricity,
                            reactive_electricity: this.totalData[i].reactive_electricity,
                            peak_electricity: this.totalData[i].peak_electricity,
                            level_electricity: this.totalData[i].level_electricity,
                            valley_electricity: this.totalData[i].valley_electricity
                        });
                    }
                    tbodyData=arr
                }
            }

            this[theadDataArrName]=[]
            this[tbodyDataArrName]=[]
            this[theadDataArrName]=theadData
            this[tbodyDataArrName] = tbodyData
        },
        initDetailTable(data){
            // 功率
            if(this.tabType==='power'){
                if(this.productTypeSelect!==1){           
                    this.detailTData=[
                        {
                            title1: '最大功率',
                            colOneData: data.MAX_POWER,
                            title2: '发生时间',
                            colTwoData: data.MAX_POWER_TIMES
                        },
                        {
                            title1: '最小功率',
                            colOneData: data.MIN_POWER,
                            title2: '发生时间',
                            colTwoData: data.MIN_POWER_TIMES
                        },
                        {
                            title1: '平均功率',
                            colOneData: data.AVG_POWER,
                            title2: '峰谷差',
                            colTwoData: data.PeakValley_POWER
                        },
                        {
                            title1: '峰谷差率',
                            colOneData: data.PeakValley_POWER_RATE
                        }
                    ]
                }else{
                    this.detailTData=[
                        {
                            title1: '最大功率',
                            colOneData: data.MAX_PT,
                            title2: '发生时间',
                            colTwoData: data.MAX_POWER_TIMES
                        },
                        {
                            title1: '最小功率',
                            colOneData: data.MIN_PT,
                            title2: '发生时间',
                            colTwoData: data.MIN_POWER_TIMES
                        },
                        {
                            title1: '平均功率',
                            colOneData: data.AVG_PT,
                            title2: '峰谷差',
                            colTwoData: data.PeakValley_POWER
                        },
                        {
                            title1: '峰谷差率',
                            colOneData: data.PeakValley_POWER_RATE
                        }
                    ]
                }
            }

            // 电量
            if(this.tabType==='electricity'){
                this.detailTData=[
                    {
                        title1: '总电量',
                        colOneData: data.total_electricity,
                        title2: '峰电量',
                        colTwoData: data.peak_electricity
                    },
                    {
                        title1: '平电量',
                        colOneData: data.level_electricity,
                        title2: '谷电量',
                        colTwoData: data.valley_electricity
                    }
                ]
            }
        },
        rowClick(data,index){
            this.currentMid=data.mid
            // this.currentMid='0004002180'
            this.isChildTab=true
            let mid = data.mid
            // let mid = '0004002180'

            let dataType,chartTitle,yTitle,xTitle
            switch(this.tabType){
                case 'power':dataType='P';chartTitle='年功率';yTitle='功率\n(单位:kW)';break;
                case 'electricity':dataType='E';chartTitle='年电量';yTitle='电量\n(单位:kWh)';break;
            }

            // 获取子级详细数据
            axios.get(HEADER+'yearPowerData/check_detail.do',{
                params: {
                    mid,
                    dataType,
                    date:this.formatDate()
                }
            })
            .then((response) => {
                let seriesData=[]
                let chartDataTitle,chartData,chartDataTime
                if(this.tabType!=='electricity'){
                    this.initDetailTable(response.data.data.TabularData)
                    chartData=JSON.parse(response.data.data.chartData.DATA)
                    chartDataTitle=JSON.parse(response.data.data.chartData.TITLES)
                    chartDataTime=JSON.parse(response.data.data.chartData.TIME)
                }else{
                    this.initDetailTable(response.data.data.TabularData)
                    chartData=response.data.data.chartData.DATA
                    chartDataTitle=response.data.data.chartData.TITLES
                    chartDataTime=response.data.data.chartData.TIME
                }
                for(let i=0;i<chartData.length;i++){
                    seriesData.push({
                        name:chartDataTitle[i],
                        type:'line',
                        data:chartData[i]
                    })
                }
                
                if(this.tabType==='electricity'){
                    seriesData= [
                        {
                            name:chartDataTitle[0],
                            type:'bar',
                            barWidth: '40%',
                            data:chartData
                        }
                    ]
                }

                let yAxisData={
                    type : 'value',
                    name :yTitle
                }

                if(chartDataTime&&seriesData){
                    if(this.tabType==='electricity'){
                        this.initChart('mychartElectricity','electricityBarChart',{
                            color: ['#3398DB'],
                            title: {
                                text: chartTitle,
                                left:'center'
                            },
                            tooltip : {
                                trigger: 'axis',
                                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                }
                            },
                            legend: {
                                data:chartDataTitle,
                                bottom:0
                            },
                            grid: {
                                left: '1%',
                                right: '10%',
                                bottom: 30,
                                containLabel: true
                            },
                            xAxis : [
                                {
                                    type : 'category',
                                    data : chartDataTime,
                                    axisTick: {
                                        alignWithLabel: true
                                    },
                                    name:'时间' 
                                }
                            ],
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
            })
            .catch(function (error) {
                console.log(error)
            });
        },
        setChildTabName(e){
            if(typeof(e)==='object'){
                this.childTabName=e.label
            }
        }
    },
    mounted () {
        axios.get(HEADER+'yearPowerData/check_getProductTypeList.do')
        .then((response) => {
            this.ProductTypeList=response.data.data
        })
        .catch(function (error) {
            console.log(error)
        })

        axios.get(HEADER+'yearPowerData/check_getUseElectricityTypeList.do')
        .then((response) => {
            this.UseElectricityTypeList=response.data.data
        })
        .catch(function (error) {
            console.log(error)
        })
    }
  })