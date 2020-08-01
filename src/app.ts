// app.ts
export interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo;
  };
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback;
}

App<IAppOption>({
  globalData: {},
  onLaunch() {
    wx.cloud.init({
      env: 'jiajiao-afeb09',
      traceUser: true,
    });

    // // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || [];
    // logs.unshift(Date.now());
    // wx.setStorageSync('logs', logs);
  },
});
