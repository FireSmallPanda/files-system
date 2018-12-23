/*
方法名：rar压缩
参数：
password
zipFilePath
srcFilePath
例如：
var password ="20170313",
zipFilePath ="D:/test/18_20170313.rar",
srcFilePath = "D:/test/18_20170313";
cmdStr ="rar a -ep -P20170313 D:\test\18_20170313.rar D:\test\18_20170313"
 * */

var fs = require("fs");
var exec = require('child_process').exec;

let rar = function(param,next){
    var cmdStr = 'zip -q -r '+param.zipFilePath+' "'+param.srcFilePath+'" ';
    console.log(">> cmdStr:",cmdStr);
    fs.exists(param.srcFilePath, function(exists) {  //判断路径是否存在
        if(exists) {
            exec(cmdStr,next);
        } else {
            next({
                code:400,
                msg:"源文件找不到"
            })
        }
    });
}
let pa = {
  password:'123456',
  zipFilePath:'D:/fileUpload/076f9a00-06c1-11e9-9bbd-71be4d510483/cc.zip',
  srcFilePath:'D:/fileUpload/076f9a00-06c1-11e9-9bbd-71be4d510483/files'
}
rar(pa,(code,msg)=>{
  console.log(msg)
})