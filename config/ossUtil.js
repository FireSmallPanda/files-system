let OSS = require('ali-oss');
// OSS链接
exports.ossClient = new OSS({
  region: configObj.region,
  //云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
  accessKeyId: configObj.accessKeyId,
  accessKeySecret: configObj.accessKeySecret,
  bucket: configObj.bucket
});