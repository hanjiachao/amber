//index.js
//获取应用实例
const app = getApp()
var common = require("../../utils/util.js");

Page({
	data: {
		info: {},
		show: false
	},
	onLoad: function() {
		wx.setNavigationBarTitle({
			title: '个人中心'
		});
		var that = this
		common.ajax({
			url: 'User/getUserData',
			userinfo: true,
			loading: '加载中...',
			success: function(res) {
				that.setData({
					info: res.result.list,
					show: true
				})
			},
			fail: function() {
				that.setData({
					show: true
				})
			}
		})
	},
	store: function() {
		wx.navigateTo({
			url: '../store/store'
		})
	},
	detail: function() {
		wx.navigateTo({
			url: '../storeDetail/storeDetail?type=' + 'record'
		})
	},
	record: function() {
		wx.navigateTo({
			url: '../record/record'
		})
	},
	exit: function() {
		common.clear_userinfo()
		wx.redirectTo({
			url: '../login/login'
		})
	}
})
