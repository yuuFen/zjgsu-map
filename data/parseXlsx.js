const xlsx = require('node-xlsx');
const fs = require('fs');

const path = `${__dirname}/markers.xlsx`;
const sheetList = xlsx.parse(path); //对数据进行处理

const head = ['latitude', 'longitude', 'title', 'iconPath', 'type'];

const result = [];
sheetList.forEach((sheet, i) => {
  sheet.data.slice(2).forEach((item) => {
    const r = {};
    item.forEach((v, j) => {
      r[head[j]] = v;
    });
    result.push(r);
  });
});

fs.writeFile('./markers.json', '', function (err) {
  if (err) {
    console.log('errr');
  }
});

result.forEach((item) => {
  generatJSON('./markers.json', JSON.stringify(item, null, '\t'));
});
/**
 * 写入JSON文件
 * @param {*} fileName
 * @param {*} data
 */
function generatJSON(fileName, data) {
  fs.writeFile(fileName, data, { flag: 'a' }, function (err) {
    if (err) {
      console.log('errr');
    }
  });
}
