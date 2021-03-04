//index.js
//获取应用实例
const app = getApp()
var common = require("../../utils/util.js");

Page({
  data: {
    id: '',
    info: {},
    show: false,
    type: ''
  },
  onLoad: function (e) {
    wx.setNavigationBarTitle({
       title: '详情'
    });
    if (e.type) {
      this.getInfo()
      this.setData({
        type: 'personal'
      })
    } else {
      this.setData({
        id: e.id,
        type: 'store'
      })
      this.getDetail()
    }
  },
  getInfo: function () {
    var that = this
    common.ajax({
      url: 'User/getGoodData',
      userinfo: true,
      loading: '加载中...',
      success: function (res) {
        that.setData({
          info: res.result.list,
          show: true
        })
      },
      fail: function () {
        that.setData({
          show: true
        })
      }
    })
  },
  getDetail: function() {
    var that = this
    common.ajax({
      url: 'Index/getGoodDetail',
      data: {
        go_id: that.data.id
      },
      userinfo: true,
      success: function (res) {
        that.setData({
          info: res.result.list,
          show: true
        })
      },
      fail: function () {
        that.setData({
          show: true
        })
      }
    })
  },
  buy: function () {
     var that = this
     common.ajax({
       url: 'Pay/confirmOrderPay',
       userinfo: true,
       loading: '加载中...',
       data: {
         go_id: that.data.id
       },
       success: function (res) {
         var data = res.result.wxpay_data
         wx.requestPayment({
           'timeStamp': data.timeStamp,
           'nonceStr': data.nonceStr,
           'package': data.package,
           'signType': 'MD5',
           'paySign': data.paySign,
           success (res) {
             common.success('支付成功', function () {
               setTimeout(function () {
                 wx.navigateBack({
                   delta: 1
                 })
               }, 2500)
             })
           },
           fail (res) {
			  wx.showToast({title: '支付失败',icon: 'none'})
			  console.log(res)
           }
         })
       }
     })
  }
})
