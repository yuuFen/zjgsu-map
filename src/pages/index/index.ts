// index.ts
import { IAppOption } from '../../app';
import { debounce } from '../../utils/util';

// 获取应用实例
const app = getApp<IAppOption>();

let timer = 0;

Page({
  data: {
    bounding: wx.getMenuButtonBoundingClientRect(),
    onSearchFocus: false,
    searchInput: '',

    mapContext: null as any,

    isLocate: false,
    isSatellite: false,
    markers: [] as any,
    allMarkers: [] as any,
    markerTypes: [] as any,
    searchMarkers: [] as any,
    polyline: [],

    showBars: true,
    currentMarkerType: '景点',

    scale: 16, // 缩放程度
    longitude: 120.388642, // 中心经度
    latitude: 30.310303, // 中心纬度
  },
  // 事件处理函数
  showDetail(e: any) {
    console.log(e.detail);
  },
  onLoad() {
    this.setData({
      mapContext: wx.createMapContext('map', this),
    });

    wx.cloud
      .callFunction({
        name: 'getMarkers',
      })
      .then(({ result }) => {
        (result = result.map((item: any) => {
          item.callout = {
            content: item.title,
            display: 'ALWAYS',
            bgColor: '#ffffff',
            borderRadius: 4,
            fontSize: 11,
            padding: 6,
          };
          item.iconPath = `/assets/images/markers/${item.iconPath}.png`;
          item.width = 21;
          item.height = 30;
          return item;
        })),
          this.setData({
            allMarkers: result,
            searchMarkers: result,
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
  onSearchFocus() {
    this.setData({
      searchMarkers: this.data.allMarkers,
      onSearchFocus: true,
    });
  },
  onSearchBlur() {
    this.setData({
      onSearchFocus: false,
      searchInput: '',
    });
  },
  search(e: any) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      this.setData({
        searchMarkers: this.data.allMarkers.filter((item: any) => {
          return item.title.indexOf(e.detail.value) !== -1;
        }),
      });
    }, 300);
  },
  mapToItemPos(e: any) {
    const marker = e.currentTarget.dataset.marker;
    this.setData({
      scale: 18, // 缩放程度
      currentMarkerType: marker.type,
      onSearchFocus: false,
      searchInput: '',
    });
    this.setMarkers();
    this.data.mapContext.moveToLocation({
      longitude: marker.longitude, // 中心经度
      latitude: marker.latitude, // 中心纬度
    });
  },
  selectMarkerType(e: any) {
    const { type } = e.target.dataset;
    this.setData({
      currentMarkerType: type,
    });
    this.setMarkers();
  },
  setMarkers() {
    this.setData({
      markers: this.data.allMarkers.filter(
        (item: any) => item.type === this.data.currentMarkerType,
      ),
    });
  },
  changeSatellite() {
    this.setData({
      isSatellite: !this.data.isSatellite,
    });
  },
});
