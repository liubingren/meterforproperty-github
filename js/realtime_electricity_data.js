import {
    Vue, iView, axios,
    HEADER, hidePage,
    isShowBtn,echarts
  } from './general.js'
  import '../css/realtime_electricity_data.less'
  
  let realtimeElectricityData = new Vue({
    el: '#realtime_electricity_data',
    data(){
        return  {
            tabType: 'overview',   // 判断tab类型以显示相应页面
            tabTypeName:'总览',
            ProductTypeList:[],
            UseElectricityTypeList:[],
            totalData:[],
            intervalList:[{
                value: '1',
                label: '1分钟'
            },
            {
                value: '2',
                label: '2分钟'
            },
            {
                value: '5',
                label: '5分钟'
            },
            {
                value: '30',
                label: '30分钟'
            }],
            isChildTab:false,       //是否第二级菜单
            childTabName:'',
            productTypeSelect:'New York',
            electricTypeSelect:'New York',
            intervalSelect:'1',
            powerTData: [],
            overviewTData:[],
            electricityTData:[],
            showNumberTData:[],
            showNumberChildTData:[],
            voltageTData:[],
            electricCurrentTData:[],
            powerFactorTData:[],
            lineChart:null,
            overviewTDataCol:[],
            electricityTDataCol:[],
            voltageTDataCol:[],
            powerTDataCol:[],
            electricCurrentTDataCol:[],
            powerFactorTDataCol:[],
            showNumberTDataCol:[],
            showNumberChildTDataCol:[],
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
            OCurrentPage:1,
            PCurrentPage:1,
            ECurrentPage:1,
            UCurrentPage:1,
            ICurrentPage:1,
            PFCurrentPage:1,
            WCurrentPage:1,
            WCCurrentPage:1,
            OTotalPage:0,
            PTotalPage:0,
            ETotalPage:0,
            UTotalPage:0,
            ITotalPage:0,
            PFTotalPage:0,
            WTotalPage:0,
            WCTotalPage:0
        }
    },
    computed: {
      
    },
    methods: {
        updateTable(tabType,e){
            switch(tabType){
                case 'O':this.OCurrentPage=e;break;
                case 'P':this.PCurrentPage=e;break;
                case 'E':this.ECurrentPage=e;break;
                case 'U':this.UCurrentPage=e;break;
                case 'I':this.ICurrentPage=e;break;
                case 'PF':this.PFCurrentPage=e;break;
                case 'W':this.WCurrentPage=e;break;
                case 'WC':this.WCCurrentPage=e;break;
            }
            this.searching(e,'fromPage')
        },
        searching(e,from){
            if(!sessionStorage.getItem('unitId')){
                this.$Modal.error({
                    title: '提示',
                    content: '请选择区域!'
                })
                return false
            }

            if(this.tabType==='showNumber' && this.isChildTab === true){
                if(!from){
                    this.WCCurrentPage=1
                }
                axios.get(HEADER+'realTimePowerData/check_wdetail.do',{
                    params: {
                        page:this.WCCurrentPage,
                        pagesize:10,
                        mid:this.currentMid,
                        interval:this.intervalSelect*1
                    }
                })
                .then((response) => {
                    let dataList=response.data.data.list
                    this.WCTotalPage=response.data.data.allRow
                    this.initShowNumberDetailTable(dataList)
                })
                .catch(function (error) {
                    console.log(error)
                });
            }else{
                let dataType,page
                switch(this.tabType){
                    case 'overview':dataType='O';page=this.OCurrentPage;break;
                    case 'power':dataType='P';page=this.PCurrentPage;break;
                    case 'electricity':dataType='E';page=this.ECurrentPage;break;
                    case 'voltage':dataType='U';page=this.UCurrentPage;break;
                    case 'electricCurrent':dataType='I';page=this.ICurrentPage;break;
                    case 'powerFactor':dataType='PF';page=this.PFCurrentPage;break;
                    case 'showNumber':dataType='W';page=this.WCurrentPage;break;
                }
                
                if(!from){
                    page=1
                }
                axios.get(HEADER+'realTimePowerData/check_list.do',{
                    params: {
                        page:page,
                        pagesize:10,
                        location_id: sessionStorage.getItem('unitId'),
                        meter_type:this.productTypeSelect,
                        use_electricity_type_id:this.electricTypeSelect,
                        dataType
                    }
                })
                .then( (response) => {
                    this.totalData=response.data.data.list
                    switch(this.tabType){
                        case 'overview':this.OCurrentPage=response.data.data.currentPage;this.OTotalPage=response.data.data.allRow;break;
                        case 'power':this.PCurrentPage=response.data.data.currentPage;this.PTotalPage=response.data.data.allRow;break;
                        case 'electricity':this.ECurrentPage=response.data.data.currentPage;this.ETotalPage=response.data.data.allRow;break;
                        case 'voltage':this.UCurrentPage=response.data.data.currentPage;this.UTotalPage=response.data.data.allRow;break;
                        case 'electricCurrent':this.ICurrentPage=response.data.data.currentPage;this.ITotalPage=response.data.data.allRow;break;
                        case 'powerFactor':this.PFCurrentPage=response.data.data.currentPage;this.PFTotalPage=response.data.data.allRow;break;
                        case 'showNumber':this.WCurrentPage=response.data.data.currentPage;this.WTotalPage=response.data.data.allRow;break;
                    }
                    this.initTabtypeTable(this.tabType)
                })
                .catch(function (error) {
                    console.log(error)
                })
            }
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
                this[chartName].clear()
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
        initTabtypeTable(tabType){
            let theadDataArrName,tbodyDataArrName,theadData,tbodyData
            // 总览
            if(tabType==='overview'){
                theadDataArrName='overviewTDataCol' 
                tbodyDataArrName='overviewTData'
                if(this.productTypeSelect!==1){
                    theadData=[{
                        title: '电表编号',
                        key: 'mid',
                        align: 'center'
                    },
                    {
                        title: '有功功率(kW)',
                        align: 'center', 
                        key: 'power'
                    },
                    {
                        title: '无功功率(kW)',
                        align: 'center',
                        key: 'var'
                    },
                    {
                        title: '有功电量(kWh)',
                        key: 'wed',
                        align: 'center'
                    },
                    {
                        title: '电压(V)',
                        key: 'u',
                        align: 'center',
                        maxWidth:90
                    },
                    {
                        title: '电流(A)',
                        key: 'i',
                        align: 'center',
                        maxWidth:90
                    },
                    {
                        title: `功率因数(%)`,
                        align: 'center',
                        key: 'power_factor'
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center'
                    }]

                    let arr=[]
                    for(let i=0;i<this.totalData.length;i++){
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            power: this.totalData[i].power,
                            var: this.totalData[i].var,
                            wed: this.totalData[i].wed,
                            u: this.totalData[i].u,
                            i: this.totalData[i].i,
                            power_factor: this.totalData[i].power_factor,
                            createtime:this.totalData[i].createtime 
                        })
                    }
                    tbodyData=arr
                }else{                              //三相
                    theadData=[{
                        title: '电表编号',
                        key: 'mid',
                        align: 'center'
                    },
                    {
                        title: '有功功率(kW)',
                        align: 'center', 
                        key: 'PT'
                    },
                    {
                        title: '无功功率(kW)',
                        align: 'center',
                        key: 'QT'
                    },
                    {
                        title: '有功电能(kWh)',
                        key: 'EPT',
                        align: 'center'
                    },
                    {
                        title: '无功电能(kWh)',
                        key: 'EQT',
                        align: 'center'
                    },
                    {
                        title: '电压(V)',
                        key: 'AVG_U',
                        align: 'center'
                    },
                    {
                        title: '电流(A)',
                        key: 'AVG_I',
                        align: 'center'
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center',
                        sortable: true
                    }]

                    let arr=[]
                    for(let i=0;i<this.totalData.length;i++){
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            PT:this.totalData[i].PT,
                            QT:this.totalData[i].QT ,
                            EPT:this.totalData[i].EPT,
                            EQT:this.totalData[i].EQT,
                            AVG_U:this.totalData[i].AVG_U,
                            AVG_I:this.totalData[i].AVG_I,
                            createtime:this.totalData[i].createtime 
                        })
                    }
                    tbodyData=arr
                }
            }

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
                        title: '有功功率(kW)',
                        align: 'center',
                        key: 'power'
                    },
                    {
                        title: '无功功率(kW)',
                        align: 'center',
                        key: 'var'
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            power: this.totalData[i].power,
                            var: this.totalData[i].var,
                            createtime :this.totalData[i].createtime
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
                        title: '有功功率(kW)',
                        align: 'center',
                        key: 'power',
                        children:[{
                            title: '总',
                            align: 'center', 
                            key: 'PT'
                        },{
                            title: 'A',
                            align: 'center', 
                            key: 'PA'
                        },{
                            title: 'B',
                            align: 'center', 
                            key: 'PB'
                        },{
                            title: 'C',
                            align: 'center', 
                            key: 'PC'
                        }]
                    },
                    {
                        title: '无功功率(kW)',
                        align: 'center',
                        key: 'var',
                        children:[{
                            title: '总',
                            align: 'center', 
                            key: 'QT'
                        },{
                            title: 'A',
                            align: 'center', 
                            key: 'QA'
                        },{
                            title: 'B',
                            align: 'center', 
                            key: 'QB'
                        },{
                            title: 'C',
                            align: 'center', 
                            key: 'QC'
                        }]
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            PT: this.totalData[i].PT,
                            PA: this.totalData[i].PA,
                            PB: this.totalData[i].PB,
                            PC: this.totalData[i].PC,
                            QT: this.totalData[i].QT,
                            QA: this.totalData[i].QA,
                            QB: this.totalData[i].QB,
                            QC: this.totalData[i].QC,
                            createtime :this.totalData[i].createtime
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
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            total_electricity: this.totalData[i].total_electricity,
                            peak_electricity: this.totalData[i].peak_electricity,
                            level_electricity: this.totalData[i].level_electricity,
                            valley_electricity: this.totalData[i].valley_electricity,
                            createtime :this.totalData[i].createtime
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
                        key: 'reactive_electricity',
                        align: 'center'
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            total_electricity: this.totalData[i].total_electricity,
                            reactive_electricity:this.totalData[i].reactive_electricity,
                            peak_electricity: this.totalData[i].peak_electricity,
                            level_electricity: this.totalData[i].level_electricity,
                            valley_electricity: this.totalData[i].valley_electricity,
                            createtime :this.totalData[i].createtime
                        });
                    }
                    tbodyData=arr
                }
            }

            // 示数
            if(tabType==='showNumber'){
                theadDataArrName='showNumberTDataCol'
                tbodyDataArrName='showNumberTData' 
                if(this.productTypeSelect!==1){
                    theadData=[{
                        title: '电表编号',
                        key: 'mid',
                        align: 'center'
                    },
                    {
                        title: '示数',
                        align: 'center',
                        key: 'w'
                    },
                    {
                        title: '抄表时刻',
                        align: 'center',
                        key: 'createtime'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            w: this.totalData[i].w,
                            createtime :this.totalData[i].createtime
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
                        title: '正向有功',
                        align: 'center', 
                        key: 'PosEPT'
                    },
                    {
                        title: '反向有功',
                        align: 'center',
                        key: 'NegEPT'
                    },
                    {
                        title: '正向无功',
                        align: 'center', 
                        key: 'PosEQT'
                    },
                    {
                        title: '反向无功',
                        align: 'center',
                        key: 'NegEQT'
                    },
                    {
                        title: '抄表时刻',
                        align: 'center',
                        key: 'createtime'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            PosEPT: this.totalData[i].PosEPT,
                            NegEPT: this.totalData[i].NegEPT,
                            PosEQT: this.totalData[i].PosEQT,
                            NegEQT: this.totalData[i].NegEQT,
                            createtime :this.totalData[i].createtime
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
                        title: '电压(V)',
                        align: 'center',
                        key: 'u'
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            u: this.totalData[i].u,
                            createtime :this.totalData[i].createtime
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
                        title: '电压(V)',
                        align: 'center',
                        key: 'u',
                        children:[{
                            title: 'A',
                            align: 'center', 
                            key: 'UA'
                        },{
                            title: 'B',
                            align: 'center', 
                            key: 'UB'
                        },{
                            title: 'C',
                            align: 'center', 
                            key: 'UC'
                        }]
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            UA: this.totalData[i].UA,
                            UB: this.totalData[i].UB,
                            UC: this.totalData[i].UC,
                            createtime :this.totalData[i].createtime
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
                        title: '电流(A)',
                        align: 'center',
                        key: 'i'
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            i: this.totalData[i].i,
                            createtime :this.totalData[i].createtime
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
                        title: '电流(A)',
                        align: 'center',
                        key: 'i',
                        children:[{
                            title: 'A',
                            align: 'center', 
                            key: 'IA'
                        },{
                            title: 'B',
                            align: 'center', 
                            key: 'IB'
                        },{
                            title: 'C',
                            align: 'center', 
                            key: 'IC'
                        },{
                            title: 'N',
                            align: 'center', 
                            key: 'I_N'
                        }]
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            IA: this.totalData[i].IA,
                            IB: this.totalData[i].IB,
                            IC: this.totalData[i].IC,
                            I_N: this.totalData[i].I_N,
                            createtime :this.totalData[i].createtime
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
                        title: '功率因数(%)',
                        align: 'center',
                        key: 'power_factor'
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            power_factor: this.totalData[i].power_factor,
                            createtime :this.totalData[i].createtime
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
                        title: '功率因数(%)',
                        align: 'center',
                        key: 'power_factor',
                        children:[{
                            title: 'A',
                            align: 'center', 
                            key: 'PfA'
                        },{
                            title: 'B',
                            align: 'center', 
                            key: 'PfB'
                        },{
                            title: 'C',
                            align: 'center', 
                            key: 'PfC'
                        }]
                    },
                    {
                        title: '抄表时刻',
                        key: 'createtime',
                        align: 'center'
                    }]
                    const arr = [];
                    for (let i = 0; i < this.totalData.length; i++) {
                        arr.push({
                            index:i,
                            mid: this.totalData[i].mid,
                            PfA: this.totalData[i].PfA,
                            PfB: this.totalData[i].PfB,
                            PfC: this.totalData[i].PfC,
                            createtime :this.totalData[i].createtime
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
            this.isChildTab=true

            let mid = data.mid
            if(this.tabType!=='showNumber'){
                let dataType,chartTitle,yTitle,xTitle
                switch(this.tabType){
                    case 'power':dataType='P';chartTitle='日功率';yTitle='功率\n(单位:kW)';break;
                    case 'electricity':dataType='E';chartTitle='日电量';yTitle='电量\n(单位:kWh)';break;
                    case 'voltage':dataType='U';chartTitle='日电压';yTitle='电压\n(单位:V)';break;
                    case 'electricCurrent':dataType='I';chartTitle='日电流';yTitle='电流\n(单位:A)';break;
                    case 'powerFactor':dataType='PF';chartTitle='日功率因数';yTitle='功率因数\n(单位:%)';break;
                }

                // 获取子级详细数据
                axios.get(HEADER+'realTimePowerData/check_detail.do',{
                    params: {
                        mid,
                        dataType
                    }
                })
                .then((response) => {
                    let seriesData=[]
                    let chartDataTitle,chartData,chartDataTime
                    if(this.tabType!=='electricity'){
                        this.initDetailTable(response.data.data.TabularData[0])
                        chartData=JSON.parse(response.data.data.chartData[0].DATA)
                        chartDataTitle=JSON.parse(response.data.data.chartData[0].TITLES)
                        chartDataTime=JSON.parse(response.data.data.chartData[0].TIME)
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
            }else{                                  //示数
                // 获取子级详细数据
                axios.get(HEADER+'realTimePowerData/check_wdetail.do',{
                    params: {
                        page:this.WCCurrentPage,
                        pagesize:10,
                        mid:this.currentMid,
                        interval:this.intervalSelect*1
                    }
                })
                .then((response) => {
                    let dataList=response.data.data.list
                    this.WCTotalPage=response.data.data.allRow
                    this.initShowNumberDetailTable(dataList)
                })
                .catch(function (error) {
                    console.log(error)
                });
            }
        },
        initShowNumberDetailTable(dataList){
            let theadDataArrName,tbodyDataArrName,theadData,tbodyData
            // 示数
            theadDataArrName='showNumberChildTDataCol'
            tbodyDataArrName='showNumberChildTData' 
            if(this.productTypeSelect!==1){
                theadData=[{
                    title: '日期',
                    align: 'center',
                    key: 'createtime'
                },
                {
                    title: '示数',
                    align: 'center',
                    key: 'W'
                }]
                const arr = [];
                for (let i = 0; i < dataList.length; i++) {
                    arr.push({
                        mid: dataList[i].mid,
                        W: dataList[i].W,
                        createtime :dataList[i].createtime
                    });
                }
                tbodyData=arr
            }else{
                theadData=[{
                    title: '日期',
                    align: 'center',
                    key: 'createtime'
                },
                {
                    title: '正向有功',
                    align: 'center', 
                    key: 'PosEPT'
                },
                {
                    title: '反向有功',
                    align: 'center',
                    key: 'NegEPT'
                },
                {
                    title: '正向无功',
                    align: 'center', 
                    key: 'PosEQT'
                },
                {
                    title: '反向无功',
                    align: 'center',
                    key: 'NegEQT'
                }]
                const arr = [];
                for (let i = 0; i < dataList.length; i++) {
                    arr.push({
                        PosEPT: dataList[i].PosEPT,
                        NegEPT: dataList[i].NegEPT,
                        PosEQT: dataList[i].PosEQT,
                        NegEQT: dataList[i].NegEQT,
                        createtime :dataList[i].createtime
                    });
                }
                tbodyData=arr
            }
            
            this[theadDataArrName]=[]
            this[tbodyDataArrName]=[]
            this[theadDataArrName]=theadData
            this[tbodyDataArrName] = tbodyData
        },
        setChildTabName(e){
            if(typeof(e)==='object'){
                this.childTabName=e.label
            }
        }
    },
    mounted () {
        axios.get(HEADER+'realTimePowerData/check_getProductTypeList.do')
        .then((response) => {
            this.ProductTypeList=response.data.data
        })
        .catch(function (error) {
            console.log(error)
        });

        axios.get(HEADER+'realTimePowerData/check_getUseElectricityTypeList.do')
        .then((response) => {
            this.UseElectricityTypeList=response.data.data
        })
        .catch(function (error) {
            console.log(error)
        });
    }
  })