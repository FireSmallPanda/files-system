let file = require("../models/ossFile")
let util = require('util');
let path = require("path");
let formidable = require('formidable')
const uuidv1 = require('uuid/v1');
// 获取配置文件
let configUtil = require("../config/configUtil");
let configs = configUtil.configObj;
let msgs = configUtil.msgObj;
var Promise = require('promise');
let fs = require('fs');
// 默认接口 F1001
exports.showIndex = (req, res) => {
    res.writeHead(200, { 'Content-Type': "text/html;charset=UTF-8" });
    res.end('对象存储OSS接口');
}
// 单文件上传 F1002
exports.saveOneFile = (req, res) => {
    file.saveOneFile(req, res)
}

// 获取文件夹列表
exports.getFileList = (req, res) => {
    file.getAllDocuments(req, res)
}
// 创建文件夹
exports.createDocument = (req, res)=>{
    file.createDocument(req, res)
}
// 删除文件夹
exports.deleteDocument = (req, res)=>{
    file.deleteDocument(req, res)
}
// 获取文件
exports.getFile = (req, res)=>{
    file.getFile(req, res)
}