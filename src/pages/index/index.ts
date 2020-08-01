// index.ts
import { IAppOption } from '../../app';
// 获取应用实例
const app = getApp<IAppOption>();

Page({
  data: {
    isLocate: false,
    isSatellite: false,
    markers: [] as any,
    allMarkers: [] as any,
    markerTypes: [] as any,
    polyline: [],

    showMarkerTypePacker: true,
    currentMarkerTypes: '景点',

    scale: 16, // 缩放程度
    longitude: 120.388642, // 中心经度
    latitude: 30.310303, // 中心纬度
  },
  // 事件处理函数
  showDetail(e: any) {
    console.log(e.detail);
  },
  onLoad() {
    wx.cloud
      .callFunction({
        name: 'getMarkers',
      })
      .then(({ result }) => {
        this.setData({
          allMarkers: result.map((item: any) => {
            item.callout = {
              content: item.title,
              padding: 10,
              borderRadius: 2,
              display: 'ALWAYS',
            };
            return item;
          }),
        });
        wx.cloud
          .callFunction({
            name: 'getMarkerTypes',
          })
          .then(({ result }) => {
            this.setData({
              markerTypes: result,
            });
            this.setMarkers();
          });
      });
  },
  selectMarkerType(e: any) {
    const { type } = e.target.dataset;
    this.setData({
      currentMarkerTypes: type,
    });
    this.setMarkers();
  },
  setMarkers() {
    this.setData({
      markers: this.data.allMarkers.filter(
        (item: any) => item.type === this.data.currentMarkerTypes,
      ),
    });
  },
  changeSatellite() {
    this.setData({
      isSatellite: !this.data.isSatellite,
    });
  },
});
