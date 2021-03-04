function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatDate(now) {
  var now = new Date(now * 1000);
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  return year + "-" + zeroize(month) + "-" + zeroize(date) + " " + zeroize(hour) + ":" + zeroize(minute) + ":" + zeroize(second);
}
function zeroize(num) {
  return (String(num).length == 1 ? '0' : '') + num;
}


function is_mobile(mobile){
  return /^1[3456789]\d{9}$/.test(mobile)
}

function verify(callback){
  wx.getStorage({
      key: 'userinfo',
      success: function(res) {
          var userinfo = get_userinfo();
          if(!userinfo){
              login_by_wx(function (ret) {
                  callback(ret)
              })
          }else{
              getApp().globalData.openid = JSON.parse(res.data).openid;
              callback(userinfo)
          }
      },
      fail: function(res){
          login_by_wx(function (ret) {
              callback(ret)
          })
      }
  })
}
function clear_userinfo() {
	wx.setStorageSync('userinfo', '')
}
function set_userinfo(userinfo){
  try{
      if(userinfo){
          var expire_time = new Date().getTime() + 86400000 * 7;
          userinfo.expire_time = expire_time;
          wx.setStorageSync('userinfo', JSON.stringify(userinfo))
      }
      return true
  }catch(e){
      return false
  }
}

function get_userinfo() {
  try {
      var userinfo = wx.getStorageSync('userinfo')
      userinfo = JSON.parse(userinfo)
      var now_time = new Date().getTime();
      if (userinfo.expire_time < now_time) {
          return false
      }else{
          return userinfo
      }
  } catch (e) {
      return false
  }
}
function set_openid(openid){
    try{
        if(openid){
            wx.setStorageSync('openid', openid)
        }
        return true
    }catch(e){
        return false
    }
}

function get_openid() {
    try {
        var openid = wx.getStorageSync('openid')
        return openid
    } catch (e) {
        return false
    }
}
function redirect_login(param){
  redirect_to('/pages/login/login',param)
}
function redirect_to(router, param){
  var tbar_list = ['/pages/index/index','/pages/personalCenter/personalCenter']
  if(tbar_list.indexOf(router)>=0){
      wx.switchTab({
          url: router
      })
  }else{
      var path_param = ''
      if (param) {
          for (var i in param) {
              path_param += i + '=' + param[i] + '&'
          }
          path_param = path_param.substr(0, path_param.length-1);
      }
      var pages = getCurrentPages(),
          current_page = pages.pop()
      if (!param || !param['old_path']){
          path_param = 'old_path=/' + current_page.route + '&' + path_param
      }
      wx.redirectTo({
          url: router + '?' + path_param
      })
  }
}
function login_by_wx(callback){
  var page=getCurrentPages()
  wx.login({
      success: function (res) {
          if (res.code) {
              ajax({
                  url: 'Login/getOpenid',
                  data: {code:res.code},
                  loading: '登录中...',
                  userinfo: false,
                  success: function(ret){
                      getApp().globalData.openid = ret.result.openid;
                      if (ret.result.access_token) {
                          set_userinfo(ret.result)
                          callback(ret.result)
                      } else {
                          var param = {}
                          if (ret.result.openid) {
                              param = {
                                  openid: ret.result.openid
                              }
                          }
                          redirect_login(param)
                      }
                  }
              })
          }else{
              redirect_login()
          }
      },
      fail: function (res) {
          redirect_login()
      }
  })
}

function error(msg,callback){
  wx.showToast({
      title: msg,
      icon: 'none',
      success: callback,
      duration: 3000
  })
}
function info(msg,callback) {
  wx.hideLoading()
  setTimeout(function () {
      wx.showToast({
          title: msg,
          icon: 'none',
		  success: callback,
          duration: 8000
      })
  },1)
}
function success(msg, callback) {
  wx.showToast({
      title: msg,
      success: callback,
      duration: 3000
  })
}


function send_ajax(param){
  // var app_url = "http://anmoyixcx.haozhicheng.weyoui.cn/index.php/Home/"
  var app_url = "https://tjamber.cn/index.php/Home/"
  if(!param.url){
      info('缺少地址')
  }
  app_url =  app_url + param.url
  if(param.loading){
      wx.showLoading({
          title: param.loading,
      })
  }
  var timer, timeout=param.timeout ? param.timeout : 5000;
  if(!param.file){
      var request = wx.request({
          url: app_url,
          data: param.data ? param.data : {},
          header: {
              'content-type': 'application/x-www-form-urlencoded'
          },
          method: param.type ? param.type : 'post',
          success: function (res) {
			  // console.log(res)
			  // console.log(param.data)
			  if(param.loading){
					wx.hideLoading()
			  }
              if (res.statusCode == 200) {
                  if (res.data.errorCode == '100008') {
                      // info('您的登录信息已失效', function () {
                      //     set_userinfo(null)
                      //     param.userinfo = true
                      //     ajax(param)
                      // })
					  clear_userinfo()
					  wx.redirectTo({
						  url: '/pages/login/login'
					  })
                  } else if(res.data.errorCode == '100004'){
					  if (param.fail) {
						  param.fail(res.data)
					  }
                  } else {
                      if (param.success) {
                          param.success(res.data)
                      }
                  }
              } else {
                  if (param.fail) {
                      param.fail(res)
                  }
              }
          },
          fail: function (res) {
			  console.log('---')
			  console.log(res)
			  if(param.loading){
				wx.hideLoading()
			  }
              if (param.fail) {
                  param.fail(res)
              }
          },
          complete: function (res) {
              clearTimeout(timer)
          },
      })
  }else{
      timeout = 30000
      var request = wx.uploadFile({
          url: app_url,
          data: param.data ? param.data : {},
          name: param.file.name,
          filePath: param.file.path,
          formData: param.data ? param.data : {},
          success: function (res) {
              if (res.statusCode == 200) {
                  if (res.data.errorCode == '100008') {
                      info('您的登录信息已失效', function () {
                          set_userinfo(null)
                          param.userinfo = true
                          // ajax(param)
						  // console.log(1)
                      })
                  } else {
                      if (param.success) {
                          param.success(res.data)
                      }
                  }
              } else {
                  if (param.fail) {
                      param.fail(res)
                  }
              }
          },
          fail: function (res) {
              if (param.fail) {
                  param.fail(res)
              }
          },
          complete: function (res) {
              clearTimeout(timer)
              if (param.loading) {
                  wx.hideLoading()
              }
          },
      })
  }

  timer = setTimeout(function(){
      if(param.loding){
          info('网络通讯故障，请重试')
      }
      request.abort()
  },timeout)

}

function ajax(param){
  if(param.userinfo){
      verify(function(res){
          if(!param.data){
              param.data = {}
          }
          param.data.access_token = res.access_token
          send_ajax(param)
      })
  }else{
      send_ajax(param)
  }
}




var $app = "http://anmoyixcx.haozhicheng.weyoui.cn/index.php/Home/";

function user_info(data,callback) {
  wx.login({
      success: function (res) {
          if (res.code) {
              requestLoading("LoginBak/login", data, '正在加载数据', function (res) {
                  callback(res.info)
              }, function () {
                  wx.showToast({
                      title: '网络较慢，请重试'
                  })
              })
          }
      }
  });
}
//获取环信账户
function user_huanxin(data,callback) {
  requestLoading("LoginBak/getHxData", data, '正在加载数据', function (res) {
      callback(res.info)
  }, function () {
      wx.showToast({
          title: '网络较慢，请重试'
      })
  })
}
//获取openid
function user_register(data, callback) {
  requestLoading("HomeCommon/getRegister", data, '正在加载数据', function (res) {
      callback(res)
  }, function () {
      wx.showToast({
          title: '网络较慢，请重试'
      })
  })
}

function location(callback) {
  wx.getLocation({
      type: 'gcj02',
      success: function (res) {
          callback(res)
      }
  })
}

// 展示进度条的网络请求
// url:网络请求的url
// data:请求参数
// message:进度条的提示信息
// success:成功的回调函数
// fail：失败的回调
function request(url, data, success, fail) {
  this.requestLoading(url, data, "", success, fail)
}
function requestLoading(url, data, message, success, fail, method, load) {
  wx.showNavigationBarLoading()
  if (message != "") {
      if (typeof load === 'undefined') {
          wx.showLoading({
              title: message,
          })
      }
  }
  wx.request({
      url: $app + url,
      data: data,
      header: {
          'content-type': 'application/x-www-form-urlencoded'
      },
      method: method,
      success: function (res) {
          wx.hideNavigationBarLoading()
          if (message != "") {
              wx.hideLoading()
          }
          if (res.statusCode == 200) {
              success(res.data)
          } else {
              fail()
          }
      },
      fail: function (res) {
          wx.hideNavigationBarLoading()
          if (message != "") {
              wx.hideLoading()
          }
          fail()
      },
      complete: function (res) {    },
  })
}
function getUserInfo(e,callback) {
  var that = this
  wx.getStorage({
      key: 'userinfo',
      success: function(res) {
          var userinfo = common.get_userinfo();
          if(!userinfo){
              app.globalData.userInfo = e.detail.userInfo
              common.login_by_wx(function () {
                  callback(userinfo)
              })
          }else{
              callback()
          }
      },
      fail: function(res){
          common.login_by_wx(function (ret) {
              callback()
          })
      }
  })
}
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
      month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}
module.exports = {
  request: request,
  requestLoading: requestLoading,
  formatTime: formatTime,
  formatDate: formatDate,
  zeroize: zeroize,
  $app: $app,
  user_register: user_register,
  location: location,
  verify: verify,
  redirect_to: redirect_to,
  is_mobile: is_mobile,
  ajax: ajax,
  error: error,
  info: info,
  success: success,
  set_userinfo: set_userinfo,
  get_userinfo: get_userinfo,
  set_openid: set_openid,
  get_openid: get_openid,
  clear_userinfo: clear_userinfo,
  login_by_wx: login_by_wx,
  getNowFormatDate: getNowFormatDate
}