import {
    Vue, iView, axios,
    HEADER, hidePage,
    isShowBtn,echarts
  } from './general.js'
  import '../css/realtime_electricity_data_day.less'
  
  let realtimeElectricityData = new Vue({
    el: '#realtime_electricity_data_month',
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
            voltageTData:[],
            electricCurrentTData:[],
            powerFactorTData:[],
            lineChart:null,
            electricityTDataCol:[],
            voltageTDataCol:[],
            powerTDataCol:[],
            electricCurrentTDataCol:[],
            powerFactorTDataCol:[],
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
            UCurrentPage:1,
            ICurrentPage:1,
            PFCurrentPage:1,
            PTotalPage:0,
            ETotalPage:0,
            UTotalPage:0,
            ITotalPage:0,
            PFTotalPage:0
        }
    },
    computed: {
      
    },
    methods: {
        updateTable(tabType,e){
            switch(tabType){
                case 'P':this.PCurrentPage=e;break;
                case 'E':this.ECurrentPage=e;break;
                case 'U':this.UCurrentPage=e;break;
                case 'I':this.ICurrentPage=e;break;
                case 'PF':this.PFCurrentPage=e;break;
            }
            this.searching(e,'fromPage')
        },
        formatDate(){
            let newdate = new Date(this.date);
            this.date = newdate.getFullYear() + '-' + (newdate.getMonth() + 1) 
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
                case 'voltage':dataType='U';page=this.UCurrentPage;break;
                case 'electricCurrent':dataType='I';page=this.ICurrentPage;break;
                case 'powerFactor':dataType='PF';page=this.PFCurrentPage;break;
            }
            if(!from){
                page=1
            }
            axios.get(HEADER+'monthPowerData/check_list.do',{
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
                    case 'voltage':this.UCurrentPage=response.data.data.currentPage;this.UTotalPage=response.data.data.allRow;break;
                    case 'electricCurrent':this.ICurrentPage=response.data.data.currentPage;this.ITotalPage=response.data.data.allRow;break;
                    case 'powerFactor':this.PFCurrentPage=response.data.data.currentPage;this.PFTotalPage=response.data.data.allRow;break;
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

            // 电压
            if(tabType==='voltage'){
                theadDataArrName='voltageTDataCol'
                tbodyDataArrName='voltageTData' 
                if(this.productTypeSelect!==1){
                    theadData=[{
                        title: '电表编号',
                        key: 'mid',
                        align: 'center'
                    },
                    {
                        title: '最高电压(V)',
                        align: 'center',
                        key: 'MAX_U'
                    },
                    {
                        title: '最低电压(V)',
                        align: 'center',
                        key: 'MIN_U'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            MAX_U: this.totalData[i].MAX_U,
                            MIN_U: this.totalData[i].MIN_U
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
                        title: '最高电压(V)',
                        align: 'center',
                        key: 'u',
                        children:[{
                            title: 'A',
                            align: 'center', 
                            key: 'MAX_UA'
                        },{
                            title: 'B',
                            align: 'center', 
                            key: 'MAX_UB'
                        },{
                            title: 'C',
                            align: 'center', 
                            key: 'MAX_UC'
                        }]
                    },
                    {
                        title: '最低电压(V)',
                        align: 'center',
                        key: 'u',
                        children:[{
                            title: 'A',
                            align: 'center', 
                            key: 'MIN_UA'
                        },{
                            title: 'B',
                            align: 'center', 
                            key: 'MIN_UB'
                        },{
                            title: 'C',
                            align: 'center', 
                            key: 'MIN_UC'
                        }]
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            MAX_UA: this.totalData[i].MAX_UA,
                            MAX_UB: this.totalData[i].MAX_UB,
                            MAX_UC: this.totalData[i].MAX_UC,
                            MIN_UA: this.totalData[i].MIN_UA,
                            MIN_UB: this.totalData[i].MIN_UB,
                            MIN_UC: this.totalData[i].MIN_UC
                        });
                    }
                    tbodyData=arr
                }
            }

            // 电流
            if(tabType==='electricCurrent'){
                theadDataArrName='electricCurrentTDataCol'
                tbodyDataArrName='electricCurrentTData' 
                if(this.productTypeSelect!==1){
                    theadData=[{
                        title: '电表编号',
                        key: 'mid',
                        align: 'center'
                    },
                    {
                        title: '最高电流(A)',
                        align: 'center',
                        key: 'MAX_I'
                    },
                    {
                        title: '最低电流(A)',
                        align: 'center',
                        key: 'MIN_I'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            MAX_I: this.totalData[i].MAX_I,
                            MIN_I: this.totalData[i].MIN_I
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
                        title: '最高电流(A)',
                        align: 'center',
                        key: 'i',
                        children:[{
                            title: 'A',
                            align: 'center', 
                            key: 'MAX_IA'
                        },{
                            title: 'B',
                            align: 'center', 
                            key: 'MAX_IB'
                        },{
                            title: 'C',
                            align: 'center', 
                            key: 'MAX_IC'
                        }]
                    },
                    {
                        title: '最低电流(A)',
                        align: 'center',
                        key: 'i',
                        children:[{
                            title: 'A',
                            align: 'center', 
                            key: 'MIN_IA'
                        },{
                            title: 'B',
                            align: 'center', 
                            key: 'MIN_IB'
                        },{
                            title: 'C',
                            align: 'center', 
                            key: 'MIN_IC'
                        }]
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            MAX_IA: this.totalData[i].MAX_IA,
                            MAX_IB: this.totalData[i].MAX_IB,
                            MAX_IC: this.totalData[i].MAX_IC,
                            MIN_IA: this.totalData[i].MIN_IA,
                            MIN_IB: this.totalData[i].MIN_IB,
                            MIN_IC: this.totalData[i].MIN_IC
                        });
                    }
                    tbodyData=arr
                }
            }

            // 功率因数
            if(tabType==='powerFactor'){
                theadDataArrName='powerFactorTDataCol'
                tbodyDataArrName='powerFactorTData' 
                if(this.productTypeSelect!==1){
                    theadData=[{
                        title: '电表编号',
                        key: 'mid',
                        align: 'center'
                    },
                    {
                        title: '最高功率因数(%)',
                        align: 'center',
                        key: 'MAX_POWER_FACTOR'
                    },
                    {
                        title: '最低功率因数(%)',
                        align: 'center',
                        key: 'MIN_POWER_FACTOR'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            MAX_POWER_FACTOR: this.totalData[i].MAX_POWER_FACTOR,
                            MIN_POWER_FACTOR: this.totalData[i].MIN_POWER_FACTOR
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
                        title: '最高功率因数(%)',
                        align: 'center',
                        key: 'power_factor',
                        children:[{
                            title: 'A',
                            align: 'center', 
                            key: 'MAX_PfA'
                        },{
                            title: 'B',
                            align: 'center', 
                            key: 'MAX_PfB'
                        },{
                            title: 'C',
                            align: 'center', 
                            key: 'MAX_PfC'
                        }]
                    },
                    {
                        title: '最低功率因数(%)',
                        align: 'center',
                        key: 'power_factor',
                        children:[{
                            title: 'A',
                            align: 'center', 
                            key: 'MIN_PfA'
                        },{
                            title: 'B',
                            align: 'center', 
                            key: 'MIN_PfB'
                        },{
                            title: 'C',
                            align: 'center', 
                            key: 'MIN_PfC'
                        }]
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            MAX_PfA: this.totalData[i].MAX_PfA,
                            MAX_PfB: this.totalData[i].MAX_PfB,
                            MAX_PfC: this.totalData[i].MAX_PfC,
                            MIN_PfA: this.totalData[i].MIN_PfA,
                            MIN_PfB: this.totalData[i].MIN_PfB,
                            MIN_PfC: this.totalData[i].MIN_PfC
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

            // 电压
            if(this.tabType==='voltage'){
                if(this.productTypeSelect!==1){
                    this.detailTData=[
                        {
                            title1: '最高电压',
                            colOneData: data.MAX_U,
                            title2: '最低电压',
                            colTwoData: data.MIN_U
                        },
                        {
                            title1: '平均电压',
                            colOneData: data.AVG_U
                        }
                    ]
                }else{
                    this.detailTData=[
                        {
                            title1: 'A相最高电压',
                            colOneData: data.MAX_UA,
                            title2: 'A相最低电压',
                            colTwoData: data.MIN_UA
                        },
                        {
                            title1: 'B相最高电压',
                            colOneData: data.MAX_UB,
                            title2: 'B相最低电压',
                            colTwoData: data.MIN_UB
                        },
                        {
                            title1: 'C相最高电压',
                            colOneData: data.MAX_UC,
                            title2: 'C相最低电压',
                            colTwoData: data.MIN_UC
                        },
                        {
                            title1: 'A相平均电压',
                            colOneData: data.AVG_UA,
                            title2: 'B相平均电压 ',
                            colTwoData: data.AVG_UB
                        },
                        {
                            title1: 'C相平均电压',
                            colOneData: data.AVG_UC,
                            title2: '三相不平衡最大值 ',
                            colTwoData: data.Three_Phase_Unbalance
                        }
                    ]
                }
            }

            // 电流
            if(this.tabType==='electricCurrent'){
                if(this.productTypeSelect!==1){
                    this.detailTData=[
                        {
                            title1: '最高电流',
                            colOneData: data.MAX_I,
                            title2: '最低电流',
                            colTwoData: data.MIN_I
                        },
                        {
                            title1: '平均电流',
                            colOneData: data.AVG_I
                        }
                    ]
                }else{
                    this.detailTData=[
                        {
                            title1: 'A相最高电流',
                            colOneData: data.MAX_IA,
                            title2: 'A相最低电流',
                            colTwoData: data.MIN_IA
                        },
                        {
                            title1: 'B相最高电流',
                            colOneData: data.MAX_IB,
                            title2: 'B相最低电流',
                            colTwoData: data.MIN_IB
                        },
                        {
                            title1: 'C相最高电流',
                            colOneData: data.MAX_IC,
                            title2: 'C相最低电流',
                            colTwoData: data.MIN_IC
                        }
                    ]
                }
            }

            // 功率因数
            if(this.tabType==='powerFactor'){
                if(this.productTypeSelect!==1){
                    this.detailTData=[
                        {
                            title1: '最高功率因数',
                            colOneData: data.MAX_POWER_FACTOR,
                            title2: '最低功率因数',
                            colTwoData: data.MIN_POWER_FACTOR
                        },
                        {
                            title1: '平均功率因数',
                            colOneData: data.AVG_POWER_FACTOR
                        }
                    ]
                }else{
                    this.detailTData=[
                        {
                            title1: 'A相最高功率因数',
                            colOneData: data.MAX_PfA,
                            title2: 'A相最低功率因数',
                            colTwoData: data.MIN_PfA
                        },
                        {
                            title1: 'B相最高功率因数',
                            colOneData: data.MAX_PfB,
                            title2: 'B相最低功率因数',
                            colTwoData: data.MIN_PfB
                        },
                        {
                            title1: 'C相最高功率因数',
                            colOneData: data.MAX_PfC,
                            title2: 'C相最低功率因数',
                            colTwoData: data.MIN_PfC
                        },
                        {
                            title1: '总最高功率因数',
                            colOneData: data.MAX_PfT,
                            title2: '总最低功率因数',
                            colTwoData: data.MIN_PfT
                        }
                    ]
                }
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
                case 'power':dataType='P';chartTitle='月功率';yTitle='功率\n(单位:kW)';break;
                case 'electricity':dataType='E';chartTitle='月电量';yTitle='电量\n(单位:kWh)';break;
                case 'voltage':dataType='U';chartTitle='月电压';yTitle='电压\n(单位:V)';break;
                case 'electricCurrent':dataType='I';chartTitle='月电流';yTitle='电流\n(单位:A)';break;
                case 'powerFactor':dataType='PF';chartTitle='月功率因数';yTitle='功率因数\n(单位:%)';break;
            }

            // 获取子级详细数据
            axios.get(HEADER+'monthPowerData/check_detail.do',{
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
                    if(this.tabType==='voltage'&& this.productTypeSelect === 1){   //双Y轴
                        if(i===chartData.length-1){
                            seriesData.push({
                                name:chartDataTitle[i],
                                type:'line',
                                yAxisIndex: 1,
                                data:chartData[i]
                            })
                        }else{
                            seriesData.push({
                                name:chartDataTitle[i],
                                type:'line',
                                yAxisIndex: 0,
                                data:chartData[i]
                            })
                        }
                    }else{
                        seriesData.push({
                            name:chartDataTitle[i],
                            type:'line',
                            data:chartData[i]
                        })
                    }
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

                let yAxisData 
                if(this.tabType==='voltage' && this.productTypeSelect === 1){           //电压双y轴
                    yAxisData=[
                        {
                            type : 'value',
                            name :yTitle,
                            axisLabel : {
                                formatter: '{value}'
                            }
                        },
                        {
                            type : 'value',
                            name : '不平衡度',
                            axisLabel : {
                                formatter: '{value}'
                            },
                            min:0,
                            max:1,
                            splitNumber:5
                        }
                    ]
                }else{
                    yAxisData={
                        type : 'value',
                        name :yTitle
                    }
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
                                left: '3%',
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
        axios.get(HEADER+'monthPowerData/check_getProductTypeList.do')
        .then((response) => {
            this.ProductTypeList=response.data.data
        })
        .catch(function (error) {
            console.log(error)
        })

        axios.get(HEADER+'monthPowerData/check_getUseElectricityTypeList.do')
        .then((response) => {
            this.UseElectricityTypeList=response.data.data
        })
        .catch(function (error) {
            console.log(error)
        })
    }
  })