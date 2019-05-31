import wepy from 'wepy';

export default class toastMixin extends wepy.mixin {
  data = {
    content: 'This is mixin data.'
  };
  methods = {
    showModal() {
      let that = this;
      wepy.showModal({
        content: that.content,
        showCancel: false
      });
    },
    noMore() {
      wepy.showToast({
        title: '没有更多了...',
        icon: 'none'
      });
    },
    loading() {
      wepy.showToast({
        title: '拼命加载中...',
        icon: 'loading',
        duration: 3000
      });
    },
    hideToast() {
      wepy.hideToast();
    }
  };

  onShow() {
  }

  onLoad() {
  }
}
