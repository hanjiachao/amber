//index.js
//获取应用实例
var common = require("../../utils/util.js");
const app = getApp()

Page({
  data: {
      list: {},
      show: false,
	  id: ''
  },
  onLoad: function (param) {
    wx.setNavigationBarTitle({
       title: '扫码结果'
    });
    var that = this
    common.ajax({
      url: 'Index/getStoreDetail',
      data: {
        store_id: param.id
      },
      userinfo: true,
      success: function (res) {
        that.setData({
		  list: res.result.list,
          show: true,
		  id: param.id
       })
      },
      fail: function () {
        that.setData({
          show: true
        })
      }
    })
  },
  bindStore() {
    common.ajax({
      url: 'Index/getBindingStore',
      data: {
        store_id: this.data.id
      },
      userinfo: true,
      success: function (res) {
        common.success(res.result.msg, function () {
            setTimeout(function () {
              wx.switchTab({
                url: '../storeList/storeList'
              })
            }, 3000)
        })
      },
      fail: function (res) {
        common.error(res.result.msg)
      }
    })
  },
})
