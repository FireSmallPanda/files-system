let file = require("../models/file")
var Promise = require('promise')
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