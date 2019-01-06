/**
 * 文件相关util
 */
var fs = require("fs");
var exec = require('child_process').exec;
let configUtil = require('../config/configUtil')
let msgs = configUtil.msgObj
/**
 * 压缩文件(Zip)
 * @param {Object} param  参数集合
 *  srcFilePath 原文件夹路径（uuid结尾的那够）
 *  zipFileName 压缩文件名
 *  password 压缩密码
 * @param {Function} next 
 */
exports.zip = function(param,next){
    var cdStr = param.srcFilePath.split('/')[0];
    var cdStr2 = `cd ${param.srcFilePath}`
    var pakStr = `zip -q -r ${param.srcFilePath}/${param.zipFileName}.zip ${param.zipFileName}`
    fs.exists(param.srcFilePath, function(exists) {  //判断路径是否存在
        if(exists) {
            let content = {
                url:`${param.srcFilePath}/${param.zipFileName}.zip`
            }
            exec(cdStr +" & "+ cdStr2+" & "+pakStr,next(content));
        } else {
            next({
                message:`${msgs.F_0009}`
            })
        }
    });
}