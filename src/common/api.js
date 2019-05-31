import wepy from 'wepy';
import COM from './com';
import CryptoJS from 'crypto-js/crypto-js';


export default {
  joinUrlParam(param) {
    return Object.keys(param)
      .map(item => `${item}=${param[item]}`)
      .join('&');
  },
  // GET请求
  get(requestHandler, isShowLoading) {
    let searchStr = this.joinUrlParam(requestHandler.params);
    requestHandler.url += (searchStr && searchStr != '' ? '?' + searchStr : '');
    return this.request('GET', requestHandler, isShowLoading);
  },
  // POST请求
  post(requestHandler, isShowLoading) {
    return this.request('POST', requestHandler, isShowLoading);
  },
  form(requestHandler, isShowLoading) {
    return this.request('form', requestHandler, isShowLoading);
  },
  request(method, requestHandler, isShowLoading = true) {
    let that = this;
    isShowLoading && wepy.showLoading && wepy.showLoading({ title: '加载中...' });
    return new Promise(function(resolve, reject) {
      let contentType = null;
      if (method && method.toLowerCase() === 'post') {
        contentType = 'application/json;charset=UTF-8';
      }
      else if (method && method.toLowerCase() === 'form') {
        contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
        method = 'POST';
      }
      else {
        contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
      }
      let requestTask = wepy.request({
        url: requestHandler.url,
        data: requestHandler.params,
        method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': contentType
        },
        success: function(res) {
          if (res && res.data && res.data.code == 401) {
            wepy.redirectTo({
              url: 'login'
            });
            return;
          }
          console.info(res);
          resolve(res);
        },
        fail: function(err) {
          console.info(err);
          wepy.showToast({
            title: '网络请求失败',
            duration: 1500
          });
          reject(new Error('Network request failed'));
        },
        complete: function(res) {
          isShowLoading && wepy.hideLoading && wepy.hideLoading();
        }
      });
    });
  },
  decryption(sessionKey_, iv_, encryptedData_) {
    // let sessionKey = wepy.getStorageSync('sessionKey');
    let sessionKey = sessionKey_;
    let key = CryptoJS.enc.Base64.parse(sessionKey);  // 加密秘钥
    let iv = CryptoJS.enc.Base64.parse(iv_);   //  矢量
    // let baseResult = CryptoJS.enc.Base64.parse(data.encryptedData);   // Base64解密
    // let ciphertext = CryptoJS.enc.Base64.stringify(baseResult);
    try {
      let decryptResult = CryptoJS.AES.decrypt(encryptedData_, key, {    //  AES解密
        asBpytes: true,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        // mode: mode
        padding: CryptoJS.pad.Pkcs7
      });
      let resData = JSON.parse(decryptResult.toString(CryptoJS.enc.Utf8));
      // let resData = CryptoJS.enc.Utf8.stringify(decryptResult);
      // let resData = JSON.parse(decryptResult);
      console.info(resData);
      return resData;
    } catch (e) {
      console.info(e);
    }
  },
  wxJscode2session(code, appid, appSecret, isShowLoading = true) {
    return this.get({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      params: {
        appid: appid,
        secret: appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });
  },
  jscode2session(code) {
    return this.post({
      url: COM.wxHost + 'jscode2session',
      params: {
        code: code
      }
    });
  },
  sendTemplateMessage(params = {}, access_token, isShowLoading = true) {
    return this.post({
      url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + access_token,
      params: params
    });
  },
  sendUniformMessage(params = {}, access_token, isShowLoading = true) {
    return this.post({
      url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token=' + access_token,
      params: params
    });
  },
  checkWxSession() {
    return new Promise(function(resolve, reject) {
      wepy.checkSession({
        success(res) {
          resolve(res);
        },
        fail(res) {
          reject(res);
        }
      });
    });
  },
  wxLogin() {
    return new Promise(function(resolve, reject) {
      wepy.login({
        success(res) {
          resolve(res);
        },
        fail(res) {
          reject(res);
        }
      });
    });
  },
  wxGetUserinfo() {
    return new Promise(function(resolve, reject) {
      wepy.getUserInfo({
        success(res) {
          resolve(res);
        },
        fail(err) {
          reject(err);
        }
      });
    });
  },
  getAuthorize() {
    return new Promise(function(resolve, reject) {
      wepy.getSetting({
        success(res) {
          if (!res.authSetting['scope.userInfo']) {
            wepy.authorize({
              scope: 'scope.userInfo',
              success(auth_res) {
                resolve(true);
              },
              fail(err) {
                reject(false);
              }
            });
          }
        }
      });
    });
  },
  getWxLoaction() {
    return new Promise(function(resolve, reject) {
      wepy.getLocation({
        type: 'gcj02',
        success(res) {
          resolve(res);
        },
        fail(err) {
          reject(err);
        }
      });
    });
  },
  getSystemInfo() {
    return new Promise(function(resolve, reject) {
      wepy.getSystemInfo({
        success(res) {
          resolve(res);
        }
      });
    });
  }
};
