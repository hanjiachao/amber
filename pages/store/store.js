//index.js
//获取应用实例
const app = getApp()
var common = require("../../utils/util.js");

Page({
  data: {
      list: [],
      show: false
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
       title: '所属门店'
    });
    var that = this
    common.ajax({
      url: 'Index/getStoreData',
      loading: '加载中...',
      userinfo: true,
      success: function (res) {
          that.setData({
            list: res.result.list,
            show: true
          })
      },
      fail: function () {
          that.setData({
            show: true
          })
      }
    })
  }
})
