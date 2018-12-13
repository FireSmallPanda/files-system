let express = require("express")
let app = express()
let router = require(__dirname+"/controller/router")
let configUtil = require(__dirname+"/config/configUtil")
// 获取配置文件
let configs = configUtil.configObj;
// 接口名字
let apiName = configs.NAME
// 校验文件中间件
app.use(`${apiName}/`,router.loadDefault)

// 主页 F0001
app.get(`${apiName}/`,router.showIndex)
// 保存单个文件 F0002
app.post(`${apiName}/file`,router.saveOneFile)
// 获取文件列表 F0003
app.get(`${apiName}/document/list`,router.getFileList)
// 创建文件夹 F0004
app.post(`${apiName}/document`,router.createDocument)
// 删除文件夹 F0005
app.delete(`${apiName}/document`,router.deleteDocument)
// 下载单个文件 F0006
app.get(`${apiName}/file`,router.getFile)
// 删除单个文件 F0007
app.delete(`${apiName}/file`,router.deleteFile)
console.log(`启动端口为：${configs.PORT}`)
// 监听未捕获的异常
process.on('uncaughtException',(err)=>{
    console.log(err)
}) 
// 监听Promise没有被捕获的失败函数
process.on('unhandledRejection',(err,promise)=>{
    console.log(err)
}) 
app.listen(configs.PORT)