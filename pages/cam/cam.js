//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    src: ''
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
       title: '扫码'
    })
    var that = this
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      mode: 'scanCode'
    })
  },
  scanCode: function(e){
	  wx.navigateTo({
		  url: '../scanResult/scanResult?id=' + e.detail.result
	  })
  }
})
