var common = require("../../utils/util.js");
const app = getApp()
function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
  )
  return hexArr.join('');
}

function strToBuf(arr) {
  var length = arr.length
  var buffer = new ArrayBuffer(length + 2)
  var dataview = new DataView(buffer)
  for (let i = 0; i < length; i++) {
      dataview.setUint8(i, '0x' + arr[i])
  }
  return buffer
}

Page({
  data: {
    devices: [],
    connected: false,
    chs: [],
    de_id: '',
    isExper: '',
    endStatus: false,
	free: ['7A', '01', '04', '03', 'A0', '00', 'DE'],
	use: ['7A', '01', '04', '03', 'A0', '00', 'DF'],
	iosId: '',
	androidId: ''
  },
  onLoad: function (e) {
    wx.setNavigationBarTitle({
      title: '扫描设备'
    });
    this.setData({
      de_id: e.id,
      // isExper: e.status,
	  isExper: e.isExper,
	  iosId: e.ios,
	  androidId: e.android
    })
    this.openBluetoothAdapter()
  },
  openBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  },
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
		res.devices.forEach(device => {
			if(device.deviceId == this.data.iosId || device.deviceId == this.data.androidId){
				this.setData({
					devices: [device]
				})
				this.stopBluetoothDevicesDiscovery()
			}
		})
    })
  },
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.startEquip(deviceId)
      }
    })
  },
  startEquip(deviceId) {
    var that = this
    common.ajax({
      url: 'Index/useDevice',
      data: {
        de_id: that.data.de_id,
        type: that.data.isExper == 0 ? '体验' : '套餐'
      },
      userinfo: true,
      success: function (res) {
          that.getBLEDeviceServices(deviceId)
      },
      fail: function (res) {
         common.error(res.result.msg)
      }
    })
  },
  getBLEDeviceServices(deviceId) {
	wx.showLoading({title: '连接中...'})
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.write) {
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            this.writeBLECharacteristicValue()
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      }
      this.setData(data)
    })
  },
  writeBLECharacteristicValue() {
    // 向蓝牙设备发送一个0x00的16进制数据
	let data = this.data.isExper == 0 ? this.data.free : this.data.use
	let buffer = strToBuf(data)
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId,
      value: buffer,
	  success: () => {
		  wx.showToast({title: '连接成功'})
		  setTimeout(function(){
			  wx.navigateBack()
		  },1500)
	  }
    })
  }
})
