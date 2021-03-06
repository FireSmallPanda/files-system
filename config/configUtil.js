const YAML = require('yamljs');
const fs = require("fs");
let settingObj = YAML.parse(fs.readFileSync(__dirname+"/settings.yml").toString());
// 返回配置文件对象
let configObj = YAML.parse(fs.readFileSync(__dirname+"/settings/"+settingObj.USE_CONFIG+".yml").toString());
exports.configObj = configObj;
// 返回信息对象
exports.msgObj = YAML.parse(fs.readFileSync(__dirname+"/msg.yml").toString());
// 返回备份文件OBJ
exports.keepFilesObj = YAML.parse(fs.readFileSync(__dirname+"/keepFiles.yml").toString());
/**OSS部分 */
// let OSS = require('ali-oss');
// OSS链接
// exports.ossClient = new OSS({
//   region: configObj.region,
//   //云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
//   accessKeyId: configObj.accessKeyId,
//   accessKeySecret: configObj.accessKeySecret,
//   bucket: configObj.bucket
// });