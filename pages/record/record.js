//index.js
//获取应用实例
const app = getApp()
var common = require("../../utils/util.js");

Page({
  data: {
    recordList: [],
    billList: [],
    nav: 0,
    oneNumber: '',
    twoNumber: ''
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
       title: '记录'
    });
    this.record()
  },
  getbill: function() {
    var that = this
    that.setData({
      nav: 1
    })
    common.ajax({
      url: 'User/getBillList',
      userinfo: true,
      loading: '加载中...',
      success: function (res) {
        that.setData({
          billList: res.result.list
        })
      }
    })
  },
  record: function () {
    var that = this
    that.setData({
      nav: 0
    })
    common.ajax({
      url: 'User/getOrderList',
      userinfo: true,
      loading: '加载中...',
      success: function (res) {
		  let count = parseInt(res.result.good_number)
		that.setData({
          oneNumber: Math.floor(count / 10),
          twoNumber: count % 10,
          recordList: res.result.list
        })
      }
    })
  }
})
