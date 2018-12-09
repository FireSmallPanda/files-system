let file = require("../models/file")
var Promise = require('promise')
const asyncWrapper = require('../config/promise-timer.js').promiseWrapper

// 默认接口 F0001
exports.showIndex = (req, res) => {
    res.writeHead(200, { 'Content-Type': "text/html;charset=UTF-8" });
    res.end('文件接口');
}
// 单文件上传 F0002
exports.saveOneFile = (req, res) => {
    file.saveOneFile(req, res)
}
// 获取文件夹列表
exports.getFileList = (req, res) => {
    let content = {};
    new Promise(file.getAllDocuments).then((pictures) => {
        content.entries = pictures
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(content));
    });
}
// 创建文件夹
exports.createDocument = (req, res) => {
    file.createDocument(req, res)
}
// 删除文件夹
exports.deleteDocument = (req, res) => {
    file.deleteDocument(req, res)
}
// 获取文件
exports.getFile = (req, res) => {
    file.getFile(req, res)
}
// 默认中间件
exports.loadDefault = (req, res,next) => {
    
    // 1.查看文件夹是否存在
    Promise.all([file.checkDocumentAndCreat(req, res)]).then(()=>{
        // process.on('uncaughtException', function (err) {
        //     //打印出错误
        //     console.log(err)
        //     //打印出错误的调用栈方便调试
        //     console.log(err.stack)
        //     next()
        // });
        next()
        // try {
        //     next()
        // } catch (e) {
        //     console.log(e);
        // }
    })
}