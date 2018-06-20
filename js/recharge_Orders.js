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
			location_id: '123',
			page: 1,
			pagesize: 10,
			date: '',
			totalMoney: '',
			allRow: 0,
			currentPage: 1,
			location_id: '',
			treeData: [],
			publicOrdersTableData: []
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
				//				THIS.$Modal.error({
				//					title: "提示信息",
				//					content: `请先选择区域`
				//				});
				//				return false;
			}

			axios.get(HEADER + 'meterOrders/check_getMeterOrdersForPage.do', {
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
					console.log(response);
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
								order_status: datas[i].order_status,
								id: datas[i].id, //数据对应的id
								state: false
							}
							THIS.publicOrdersTableData.push(newObj);
						}
					}
				})
				.catch(function(error) {
					console.log(error);
				});
		},
		getDateTime(e, type) { //处理日期选择器的值
			let THIS = this
			switch(type) {
				case 1:
					THIS.begindate = e;
					break;
				case 2:
					THIS.enddate = e;
					break;
				case 3:
					THIS.date = e;
					break;
			}
		},
		getOrdersTotalMoney() {
			let THIS = this;
			let location_id = THIS.location_id;
			axios.get(HEADER + 'meterOrders/check_getcountMeterOrdersMoney.do', {
					params: {
						location_id: location_id,
						dateType: THIS.dateTypeSelect,
						date: THIS.date
					}
				})
				.then(function(response) {

					if(response.data.code == 1) {
						THIS.totalMoney = response.data.data.money;
					}
				})
				.catch(function(error) {
					console.log(error);
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
			window.location.href = `${HEADER}meterOrders/export_exportMeterOrders.do?${params}`;
		}
	}
})