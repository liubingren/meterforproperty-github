import { Vue, HEADER, axios } from './general.js'
import '../css/abnormal_orders.less'

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
			meterModal: false,
			isAddModal: true,
			chargeTypeSelect: '',
			status: '', //日期选择类型
			currentCheckboxStatus: [],
			chosenDataIndex: [], //选中数据的索引
			chooseAllCheckboxFlag: false,
			searchKey: '',
			begindate: '',
			enddate: '',
			order_number: '',
			mid: '', //电表编号
			page: 1,
			pagesize: 10,
			allRow: 0,
			currentPage: 1,
			publicOrdersTableData: [], //表格数据
			modal1: false,
			modal2: false,
			changeToTreatedDataIndex: '', //单独标记为已处理的索引
			unresolveNumber: 0,
			chargeType: [{
				label: '全部',
				value: -1,
				disabled: true
			}, {
				label: '未处理',
				value: 0,
				disabled: false
			}, {
				label: '已处理',
				value: 1,
				disabled: false
			}],
			treeData: [{
				title: 'parent 1',
				expand: true,
				children: [{
						title: 'parent 1-1',
						expand: true,
						children: [{
								title: 'leaf 1-1-1'
							},
							{
								title: 'leaf 1-1-2'
							}
						]
					},
					{
						title: 'parent 1-2',
						expand: true,
						children: [{
								title: 'leaf 1-2-1'
							},
							{
								title: 'leaf 1-2-1'
							}
						]
					}
				]
			}]
		}
	},
	mounted() {
		this.search(); //初始化表格
		this.getUnresolveNumber();
	},
	methods: {
		getUnresolveNumber() { //未处理个数
			let THIS = this;
			axios({
					method: 'get',
					url: HEADER + '/abnormalMeterOrders/check_countAbnormalMeterOrders.do'
				})
				.then(function(response) {
					if(response.data.code == 1) {
						THIS.unresolveNumber = response.data.data.counts;
					}
				})
				.catch(function(error) {

				});
		},
		chargeTypeChange() { //切换异常状态

		},
		chooseData(index) { //多选
			//			选中立即把对应索引push进数组中,否则就删除
			if(this.publicOrdersTableData[index].state == true) {
				this.chosenDataIndex.push(index);
				this.chosenDataIndex = Array.from(new Set(this.chosenDataIndex)); //去重
			} else {
				this.chosenDataIndex.remove(index);
			}
			//不是所有数据都选上时去掉全选
			if(this.chosenDataIndex.length != this.publicOrdersTableData.length) {
				this.chooseAllCheckboxFlag = false;
			}
		},
		chooseDataAll() { //			全选	
			this.chosenDataIndex = []; //清空数据索引数组
			if(this.chooseAllCheckboxFlag == true) { //把所有的checkbox勾选上
				for(let i = 0; i < this.publicOrdersTableData.length; i++) {
					if(this.publicOrdersTableData[i]['order_status'] == "未处理") {
						this.publicOrdersTableData[i]['state'] = this.chooseAllCheckboxFlag;
						this.chosenDataIndex.push(i);
					}
				}
			} else { //把所有的checkbox去掉勾选
				for(let i = 0; i < this.publicOrdersTableData.length; i++) {
					this.publicOrdersTableData[i]['state'] = this.chooseAllCheckboxFlag;
				}
			}
		},
		searchLocation() {

		},
		search() {
			let THIS = this;
			axios.get(HEADER + '/abnormalMeterOrders/check_getAbnormalMeterOrdersForPage.do', {
					params: {
						page: THIS.page,
						pagesize: THIS.pagesize,
						order_number: THIS.order_number,
						status: THIS.status,
						begindate: THIS.begindate,
						enddate: THIS.enddate,
						mid: THIS.mid
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
								mid: datas[i].mid,
								user_id: datas[i].usercode,
								user_name: datas[i].username,
								order_number: datas[i].order_number,
								order_time: datas[i].order_time,
								order_money: datas[i].order_money,
								abnormal_info: datas[i].reason,
								process_time: datas[i].process_time,
								order_status: datas[i].status,
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
		getDateTime(e, type) { //处理日期选择器的值
			let THIS = this
			if(type === 1) {
				THIS.begindate = e;
			}
			if(type === 2) {
				THIS.enddate = e;
			}
		},
		exportData() { //导出
			let params = `order_number=${this.order_number}&status=${this.status}&begindate=${this.begindate}&enddate=${this.enddate}&mid=${this.mid}`;
			window.location.href = `${HEADER}/abnormalMeterOrders/export_exportAbnormalMeterOrders.do?${params}`;
		},
		changeToTreated(i) { //更改为已处理
			let THIS = this;
			axios({
					method: 'post',
					url: HEADER + 'abnormalMeterOrders/update_confirmAbnormalMeterOrders.do',
					params: {
						ids: this.publicOrdersTableData[i].id
					}
				})
				.then(function(response) {
					if(response.data.code == 1) {
						THIS.$Modal.success({
							title: "提示信息",
							content: '<p>操作成功</p>'
						});
						//刷新页面数据
						THIS.search();
						THIS.getUnresolveNumber();
					} else {
						THIS.$Modal.error({
							title: "提示信息",
							content: `<p>${response.data.msg}</p>`
						});
					}
				})
				.catch(function(error) {

				});
		},
		changeAllToTreated() { //批量修改
			let THIS = this;
			let ids;
			let idArr = [];

			this.chosenDataIndex.forEach(function(value) {
				idArr.push(THIS.publicOrdersTableData[value].id);
			});
			ids = idArr.join(",");
			axios({
					method: 'post',
					url: HEADER + '/abnormalMeterOrders/update_confirmAbnormalMeterOrders.do',
					params: {
						ids: ids
					}
				})
				.then(function(response) {
					if(response.data.code == 1) {
						THIS.$Modal.success({
							title: "提示信息",
							content: '<p>操作成功</p>'
						});
						//刷新页面数据
						THIS.search();
						THIS.getUnresolveNumber();
					} else {
						THIS.$Modal.error({
							title: "提示信息",
							content: `<p>${response.data.msg}</p>`
						});
					}
				})
				.catch(function(error) {

				});
		},
		asyncOK(type) {
			if(type == "single") {
				this.changeToTreated(this.changeToTreatedDataIndex);
			} else {
				this.changeAllToTreated();
			}
		},
		updateTable(e) {
			this.page = e;
			this.search();
		}
	}
})