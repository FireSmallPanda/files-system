let express = require("express")
let app = express()
let ossController = require(__dirname+"/controller/ossController")
let configUtil = require(__dirname+"/config/configUtil")

const fs = require("fs");
// 获取配置文件
let configs = configUtil.configObj;
// 接口名字
let apiName = configs.NAME+"/oss"
// 主页 F1001
app.get(`${apiName}/`,ossController.showIndex)
// 保存单个文件 F1002
app.post(`${apiName}/file`,ossController.saveOneFile)
// 获取文件列表 F1003
app.get(`${apiName}/document/list`,ossController.getFileList)
// 创建文件夹 F1004
app.post(`${apiName}/document`,ossController.createDocument)
// 删除文件夹 F1005
app.delete(`${apiName}/document`,ossController.deleteDocument)
// 下载单个文件 F1006
app.get(`${apiName}/file`,ossController.getFile)

console.log("启动端口为："+configs.PORT)
app.listen(configs.PORT)