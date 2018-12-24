var fs = require("fs");
var exec = require('child_process').exec;
/**
 * 压缩文件(Zip)
 * @param {Object} param 
 * @param {Function} next 
 */
let zip = function(param,next){
    var cdStr = param.srcFilePath.split('/')[0];
    var cdStr2 = `cd ${param.srcFilePath}`
    var pakStr = `zip -q -r ${param.srcFilePath}/${param.zipFileName}.zip ${param.zipFileName}`
    console.log(pakStr)
    fs.exists(param.srcFilePath, function(exists) {  //判断路径是否存在
        if(exists) {
            let content = {
                success:true,
                path:`${param.srcFilePath}/${param.zipFileName}.zip`
            }
            exec(cdStr +" & "+ cdStr2+" & "+pakStr,next(content));
        } else {
            next({
                success:false,
                message:"源文件找不到"
            })
        }
    });
}
let pa = {
  password:'123456',
  zipFileName:'张华德',
  srcFilePath:'D:/fileUpload/076f9a00-06c1-11e9-9bbd-71be4d510483/'
}
zip(pa,(retn)=>{
  console.log(retn.success)
  console.log(retn.path)
})