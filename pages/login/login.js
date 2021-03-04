//index.js
//获取应用实例
var common = require("../../utils/util.js");
const app = getApp()

Page({
	data: {
		mobile: '',
		code: '',
		pass: '',
		loginCode: true,
		time: 60,
		openid: '',
		storeId: '',
		showPage: false
	},
	onLoad: function(options) {
		if(options.id){
			this.setData({
				storeId: options.id
			})
		}
		wx.setNavigationBarTitle({
			title: '登录'
		})
		//获取用户信息
		if (common.get_userinfo()) {
			let that = this
			common.ajax({
				url: 'User/getUserData',
				userinfo: true,
				loading: '加载中..',
				success: function(res) {
					if (res.result.list.store_id == 0) {
						if(that.data.storeId){
							wx.redirectTo({
								url: `/pages/scanResult/scanResult?id=${that.data.storeId}`
							})
						}else{
							wx.redirectTo({
								url: '../scan/scan'
							})
						}
					} else {
						wx.switchTab({
							url: '../storeList/storeList'
						})
					}
				},
				fail: function(res) {
					common.error(res.result.msg)
				}
			})
			return false
		}else{
			this.setData({
				showPage: true
			})
		}
	},
	send: function() {
		var that = this
		if (that.data.time != 60) {
			return
		}
		if (!common.is_mobile(this.data.mobile)) {
			common.error('请填写正确的手机号')
			return false
		}
		common.ajax({
			url: 'Login/sendLoginCode',
			data: {
				mobile: this.data.mobile
			},
			loading: '加载中...',
			userinfo: false,
			success: function(ret) {
				if(ret.status == 'SUCCESS'){
					common.success(ret.result.msg, function() {
						var timer = setInterval(function() {
							that.data.time--
							that.setData({
								time: that.data.time
							})
							if (that.data.time == 0) {
								clearInterval(timer)
								that.setData({
									time: 60
								})
							}
						}, 1000)
					})
				}else{
					wx.showToast({
					  title: ret.result.msg,
					  icon: 'none'
					})
				}
			},
			fail: function(res) {
				wx.showToast({
				  title: res.result.msg,
				  icon: 'none'
				})
			}
		})
	},
	checkLogin: function() {
		this.setData({
			loginCode: !this.data.loginCode
		})
	},
	bindphone: function(e) {
		this.setData({
			mobile: e.detail.value
		})
	},
	bindcode: function(e) {
		this.setData({
			code: e.detail.value
		})
	},
	bindpass: function(e) {
		this.setData({
			pass: e.detail.value
		})
	},
	login: function() {
		let that = this
		if (!common.is_mobile(this.data.mobile)) {
			common.error('请填写正确的手机号')
			return false
		}
		if (this.data.loginCode) {
			if (this.data.code == '') {
				common.error('请填写验证码')
				return false
			}
		} else {
			if (this.data.pass == '') {
				common.error('请填写密码')
				return false
			}
		}
		common.ajax({
			url: 'Login/mobileLogin',
			data: {
				mobile: this.data.mobile,
				pass: this.data.pass,
				code: this.data.code,
				openid: common.get_openid()
			},
			loading: '加载中..',
			userinfo: false,
			success: function(res) {
				if (res.status == 'SUCCESS') {
					common.set_userinfo(res.result)
					common.success(res.result.msg, function() {
						setTimeout(function() {
							if (res.result.store_id == 0) {
								if(that.data.storeId){
									wx.redirectTo({
										url: `/pages/scanResult/scanResult?id=${that.data.storeId}`
									})
								}else{
									wx.redirectTo({
										url: '../scan/scan'
									})
								}
							} else {
								wx.switchTab({
									url: '../storeList/storeList'
								})
							}
						}, 1000)
					})
				} else {
					common.info(res.result.msg)
				}
			},
			fail: function(res) {
				common.error(res.result.msg)
			}
		})
	},
	register: function() {
		wx.navigateTo({
			url: '../register/register'
		})
	}
})
