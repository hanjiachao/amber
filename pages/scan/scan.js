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
    });
  },
  scan: function () {
	  wx.scanCode({
		  success: res => {
			  let str = res.path
			  if(str && str.indexOf('id=') != -1){
				  let storeId = str.charAt(str.indexOf('id=') + 3)
				  wx.navigateTo({
				  	url: `/pages/scanResult/scanResult?id=${storeId}`
				  })
			  }else{
				  wx.showToast({title: '二维码有误',icon: 'none'})
			  }
		  }
	  })
    // var that = this
    // wx.getSetting({
    //   success(res) {
    //     if (!res.authSetting['scope.record']) {
    //       wx.authorize({
    //         scope: 'scope.camera',
    //         success () {
    //           wx.navigateTo({
    //             url: '../cam/cam'
    //           })
    //         }
    //       })
    //     }
    //   }
    // })
  }
})
