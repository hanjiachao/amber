//index.js
//获取应用实例
var common = require("../../utils/util.js");
const app = getApp()
Page({
	data: {
		time: 60,
		mobile: '',
		code: '',
		pass: '',
		status: true
	},
	onLoad: function() {
		wx.setNavigationBarTitle({
			title: '注册'
		});
	},
	statusClick: function() {
		this.setData({
			status: !this.data.status
		})
	},
	bindmobile: function(e) {
		this.setData({
			mobile: e.detail.value
		})
	},
	bindcode: function(e) {
		this.setData({
			code: e.detail.value
		})
	},
	password: function(e) {
		this.setData({
			pass: e.detail.value
		})
	},
	passnumber: function(e) {
		this.setData({
			pass: e.detail.value
		})
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
			url: 'Login/sendRegisterCode',
			data: {
				mobile: this.data.mobile
			},
			loading: '加载中..',
			userinfo: false,
			success: function(ret) {
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
			},
			fail: function(res) {
				common.error(res.result.msg)
			}
		})
	},
	login: function() {
		wx.navigateTo({
			url: '../login/login'
		})
	},
	bind: function() {
		var that = this
		if (!common.is_mobile(this.data.mobile)) {
			common.error('请填写正确的手机号')
			return false
		}
		if (this.data.code == '') {
			common.error('请填写验证码')
			return false
		}
		if (this.data.pass == '') {
			common.error('请填写密码')
			return false
		}
		common.ajax({
			url: 'Login/wxRegister',
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
							wx.navigateTo({
								url: '../login/login?mobile=' + that.data.mobile
							})
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
	}
})
