// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: 'jiajiao-afeb09',
});
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const res = await db.collection('marker_types').limit(100).get();

  return res.data.sort((a, b) => (a['index'] > b['index'] ? 1 : -1));
};
