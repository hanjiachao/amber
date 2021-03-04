//index.js
//获取应用实例
const app = getApp()
var common = require("../../utils/util.js");

Page({
	data: {
		page: 0,
		limit: 6,
		goodNum: '',
		isExper: '否',
		list: [],
		url: '',
		isIos: false,
		show: false,
		timer: ''
	},
	start: function(e) {
		var id = e.currentTarget.dataset.id
		var status = e.currentTarget.dataset.status
		var isExper = this.data.isExper == '否' ? 0 : 1
		var ios = e.currentTarget.dataset.ios
		var android = e.currentTarget.dataset.android
		if (status == '使用中') {
			common.error('设备正在使用中')
			return false
		}
		var that = this;
		wx.closeBluetoothAdapter()
		wx.openBluetoothAdapter({ //调用微信小程序api 打开蓝牙适配器接口
			success: function(res) {
				wx.navigateTo({
					url: '../scanEquip/scanEquip?id=' + id + '&isExper=' + isExper + '&ios=' + ios + '&android=' + android
				})
			},
			fail: function(res) { //如果手机上的蓝牙没有打开，可以提醒用户
				common.error('请开启蓝牙')
			}
		})
	},
	onLoad: function() {
		wx.setNavigationBarTitle({
			title: '首页'
		})
		wx.showLoading({
			title: '加载中...'
		})
		wx.getSystemInfo({
			success: (res) => {
				if (res.platform == 'ios') {
					this.setData({
						isIos: true
					})
				}
			}
		})
	},
	onShow: function() {
		this.getInfo()
	},
	getInfo: function() {
		var that = this
		common.ajax({
			url: 'User/getUserData',
			userinfo: true,
			success: function(res) {
				let isExper = res.result.list.is_experience
				that.setData({
					goodNum: res.result.list.good_number,
					isExper: isExper
				})
				if(isExper == '否'){
					wx.showModal({
					  title: '提示',
					  content: '是否免费体验10分钟？',
					  success (res) {
					    if (res.confirm) {
						  that.setData({
						  	url: 'Index/getDeviceList',
							page: 0,
							goodNum: 10
						  })
						  that.getList()
					    }
					  }
					})
				}
				if (that.data.goodNum == 0) {
					that.setData({
						url: 'Index/getGoodList'
					})
				} else {
					that.setData({
						url: 'Index/getDeviceList'
					})
				}
				that.getList()
			}
		})
	},
	storeDetail: function(e) {
		var id = e.currentTarget.dataset.id
		wx.navigateTo({
			url: '../storeDetail/storeDetail?id=' + id
		})
	},
	refresh: function() {
		if (this.data.allLoad) return
		if (this.data.goodNum == 0) {
			this.setData({
				url: 'Index/getGoodList'
			})
		} else {
			this.setData({
				url: 'Index/getDeviceList'
			})
		}
		this.getList()
	},
	getList: function() {
		var that = this
		clearInterval(that.data.timer)
		common.ajax({
			url: that.data.url,
			data: {
				page: that.data.page,
				limit: that.data.limit
			},
			userinfo: true,
			success: function(res) {
				wx.hideLoading()
				let nowTime = (new Date()).getTime()
				let listData = res.result.list
				let list = listData.map((v, i) => {
					let endTime = (parseInt(v.de_use_time) + parseInt(v.de_use_duration) * 60) * 1000
					v.countDown = parseInt(v.de_use_time) ? endTime - nowTime : 0
					let formatTime = that.getFormat(v.countDown)
					v.countDownText = `${formatTime.m}:${formatTime.s}`
					return v
				})
				if (that.data.page == 0) {
					that.setData({
						list: list
					})
				} else {
					that.data.list = that.data.list.concat(list)
					that.setData({
						list: that.data.list
					})
				}
				if (that.data.limit > list.length) {
					that.setData({
						allLoad: true
					})
				} else {
					that.data.page++
					that.setData({
						page: that.data.page
					})
				}
				that.setData({
					show: true,
					timer: setInterval(function(){
						that.setCountDown(1000)
					},1000)
				})
			},
			fail: function(res) {
				wx.hideLoading()
				that.setData({
					show: true
				})
			}
		})
	},
	setCountDown: function(count) {
		let nowTime = (new Date()).getTime()
		let listData = this.data.list
		let list = listData.map((v, i) => {
			let endTime = (parseInt(v.de_use_time) + parseInt(v.de_use_duration) * 60) * 1000
			v.countDown = v.countDown > 0 ? v.countDown - count : 0
			let formatTime = this.getFormat(v.countDown)
			v.countDownText = `${formatTime.m}:${formatTime.s}`;
			return v
		})
		this.setData({
			list: list
		})
		// setTimeout(this.setCountDown, count)
	},

	/**
	 * 格式化时间
	 */
	getFormat: function(time) {
		time = parseInt(time / 1000)
		let m = parseInt(time / 60)
		let s = time % 60
		m = m > 9 ? m : `0${m}`
		s = s > 9 ? s : `0${s}`
		return {m,s}
	},
	onReachBottom: function() {
		this.refresh()
	}
})
