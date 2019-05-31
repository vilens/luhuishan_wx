import wepy from 'wepy';
import COM from './com';
import API from './api';

export default {
  payment(order) {
    let that = this;
    return new Promise(function(resolve, reject) {
      that.payWeixinProcess(order).then(function(data) {
        if (data.data) {
          let obj = data.data;
          wepy.requestPayment({
            timeStamp: obj.timeStamp,
            nonceStr: obj.nonceStr,
            package: obj.package,
            signType: 'MD5',
            paySign: obj.paySign,
            success(res) {
              resolve(res);
              console.info(res);
            },
            fail(err) {
              reject(err);
              console.info(err);
            }
          });
          console.info(data);
        }
      }).catch(function(error) {
        reject(error);
        console.info(error);
      });
    });
  },
  wxLogin() {
    return new Promise(function(resolve, reject) {
      API.checkWxSession().then(function(res) {
        let openid = wepy.getStorageSync('openid');
        let sessionKey = wepy.getStorageSync('sessionKey');
        resolve({ status: true, openid: openid, session_key: sessionKey });
      }, function(fail) {
        API.wxLogin().then(function(res1) {
          API.jscode2session(res1.code).then(function(result) {
            if (result.data.errcode && result.data.errcode == 40029) {
              wepy.setStorageSync('openid', null);
              wepy.setStorageSync('sessionKey', null);
              reject({ status: false, openid: null, session_key: null });
            } else {
              wepy.setStorageSync('openid', result.data.result.openid);
              wepy.setStorageSync('sessionKey', result.data.result.session_key);
              resolve({ status: true, openid: result.data.result.openid, session_key: result.data.result.session_key });
            }
          });
        });
      });
    });

  },
  payWeixinProcess(params) {
    return API.post({
      url: COM.wxHost + 'wxPay',
      params: params
    });
  },
  saveUser(params = {}) {
    return API.post({
      url: COM.host + 'user/saveUser',
      params: params
    });
  },
  findUser(params = {}) {
    return API.post({
      url: COM.host + 'user/findUser',
      params: params
    });
  },
  findPainter(params = {}){
    return API.post({
      url: COM.host + 'painter/find',
      params: params
    });
  },
  savePainter(params = {}) {
    return API.form({
      url: COM.host + 'painter/save',
      params: params
    });
  },
  allPainterTag(params = {}){
    return API.post({
      url: COM.host + 'painter/allPainterTag',
      params: params
    });
  },
  saveRecipient(params = {}){
    return API.post({
      url: COM.host + 'recipient/save',
      params: params
    });
  }

};
