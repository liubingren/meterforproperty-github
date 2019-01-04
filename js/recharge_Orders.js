import { Vue, HEADER, axios } from './general.js'
import '../css/recharge_Orders.less'

/* 
 * 删除数组中指定值 
 */
Array.prototype.remove = function(value) {
	var len = this.length;
	for(var i = 0, n = 0; i < len; i++) { //把出了要删除的元素赋值给新数组 
		if(this[i] != value) {
			this[n++] = this[i];
		}
	}
	this.length = n;
};
/**
 * 日期格式化
 * ***/
Date.prototype.Format = function(fmt) { //author: meizz   
	var o = {
		"M+": this.getMonth() + 1, //月份   
		"d+": this.getDate(), //日   
		"h+": this.getHours(), //小时   
		"m+": this.getMinutes(), //分   
		"s+": this.getSeconds(), //秒   
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度   
		"S": this.getMilliseconds() //毫秒   
	};
	if(/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

let VM = new Vue({
	el: '#recharge_Orders',
	data: function() {
		return {
			tabType: 'publicOrders', // 判断订单类型以显示相应页面
			meterModal: false,
			isAddModal: true,
			dateTypeSelect: '', //日期选择类型
			currentCheckboxStatus: [],
			searchKey: '',
			begindate: '',
			enddate: '',
			order_number: '',
			mid: '', //电表编号
			page: 1,
			pagesize: 10,
			date: '',
			totalMoney: 0,
			allRow: 0,
			currentPage: 1,
			location_id: '',
			totalDate: '',
			exportIsShow: false,
			treeData: [],
			publicOrdersTableData: []
		}
	},
	mounted: function() {
		let THIS = this;
		axios({
				url: HEADER + '/permission/check_getCurrentUserPermission.do'
			})
			.then(({
				data
			}) => {
				console.log(data);
				for(let item of data.data) {
					if('meterOrders-export' == item) {
						THIS.exportIsShow = true;
					}
				}
			})
			
		if(sessionStorage.getItem('unitId')){
		  	THIS.location_id=sessionStorage.getItem('unitId');
		  	THIS.search();
		}
	},
	methods: {
		getSonData(e) {
			this.location_id = e;
			//			this.loadMeters(this.location_id)
		},
		toggletabType(e) {
			this.tabType = e.target.getAttribute('data-type')
		},
		search() {
			let THIS = this;
			let location_id;
			if(THIS.location_id) {
				location_id = THIS.location_id;
			} else {
				location_id = '';
			}
			THIS.formatDate('begindate');
			THIS.formatDate('enddate');
			axios.get(HEADER + '/meterOrders/check_getMeterOrdersForPage.do', {
					params: {
						location_id: location_id,
						page: THIS.page,
						pagesize: THIS.pagesize,
						order_number: THIS.order_number,
						begindate: THIS.begindate,
						enddate: THIS.enddate,
						meter_id: THIS.mid
					}
				})
				.then(function(response) {
					if(response.data.code == 1) {
						let datas = response.data.data.list;
						THIS.currentPage = response.data.data.currentPage;
						THIS.allRow = response.data.data.allRow;
						THIS.publicOrdersTableData = [];
						for(let i = 0; i < datas.length; i++) { //重新构造数组
							datas[i]['state'] = false;
							let newObj = {
								location_name: datas[i].location_name,
								meter_id: datas[i].mid,
								user_id: datas[i].usercode,
								user_name: datas[i].username,
								order_number: datas[i].order_number,
								order_time: datas[i].order_time,
								order_money: datas[i].order_money,
								order_status_value: datas[i].order_status_value,
								id: datas[i].id, //数据对应的id
								state: false
							}
							THIS.publicOrdersTableData.push(newObj);
						}
					}
				})
				.catch(function(error) {

				});
		},
		getOrdersTotalMoney() {
			let THIS = this;
			THIS.totalMoney = 0; //初始化总金额
			let location_id = THIS.location_id;
			THIS.formatDate('day');
			axios.get(HEADER + '/meterOrders/check_getcountMeterOrdersMoney.do', {
					params: {
						location_id: location_id,
						dateType: THIS.dateTypeSelect,
						date: THIS.date
					}
				})
				.then(function(response) {
					if(response.data.code == 1 && response.data.data.money != null) {
						THIS.totalMoney = response.data.data.money;
					} else {
						THIS.totalMoney = 0;
					}
				})
				.catch(function(error) {

				});
		},
		updateTable(e) {
			this.page = e;
			this.search();
		},
		exportData() {
			if(this.location_id != '') {

			} else {
				this.$Modal.error({
					title: "提示信息",
					content: `请先选择区域`
				});
				return false;
			}
			let params = `location_id=${this.location_id}&meter_id=${this.mid}&order_number=${this.order_number}&begindate=${this.begindate}&enddate=${this.enddate}`;
			window.location.href = `${HEADER}/meterOrders/export_exportMeterOrders.do?${params}`;
		},
		formatDate(type) { //格式化日期控件的值
			let THIS = this;
			let newdate;
			switch(type) {
				case 'begindate':
					if(THIS.begindate != '') {
						newdate = new Date(THIS.begindate);
						THIS.begindate = newdate.getFullYear() + '-' + (newdate.getMonth() + 1) + '-' + newdate.getDate() + ' ' + newdate.getHours() + ':' + newdate.getMinutes() + ':' + newdate.getSeconds();
						break;
					}

				case 'enddate':
					if(THIS.enddate != '') {
						newdate = new Date(THIS.enddate);
						THIS.enddate = newdate.getFullYear() + '-' + (newdate.getMonth() + 1) + '-' + newdate.getDate() + ' ' + newdate.getHours() + ':' + newdate.getMinutes() + ':' + newdate.getSeconds();
					}

					break;
				case 'day':
					if(THIS.date != '') {
						newdate = new Date(THIS.date);
						if(THIS.dateTypeSelect == 'year') {
							THIS.date = newdate.getFullYear() + '';
						} else if(THIS.dateTypeSelect == 'month') {
							THIS.date = newdate.getFullYear() + '-' + (newdate.getMonth() + 1);
						} else {
							THIS.date = newdate.getFullYear() + '-' + (newdate.getMonth() + 1) + '-' + newdate.getDate();
						}
					}
					break;
			}
		}
	}
})