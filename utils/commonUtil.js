/**
 * 公共Util
 */
const uuidv4 = require('uuid/v4')
const uuidv1 = require('uuid/v1')
/**
 * 生成uuid
 * @param {Unmber} flag  生成的uuid类型
 * @returns uuid 
 */
exports.creatUUID = (flag=1)=>{
    let ran = ''
    switch(flag){
        case 1:
            ran  = uuidv1() // 表达用
            break
        case 4:
            ran  = uuidv4() // 存数据库用
            break
        default:
            ran  = uuidv1()
    }
    // 去除 所有 -
    ran = ran.replace(/-/g,"")
   return  ran 
}
/**
 * 获取两个时间差
 * @param {Date} startTime 开始时间
 * @param {Date} endTime 结束时间
 * @param {String} diffType 时间类型  second|minute|hour|day
 */
exports.getDateDiff = (startTime, endTime, diffType) => {
    //将计算间隔类性字符转换为小写
    diffType = diffType.toLowerCase();
    var sTime =startTime; //开始时间
    var eTime =endTime; //结束时间
    //作为除数的数字
    var timeType =1;
    switch (diffType) {
        case"second":
            timeType =1000;
        break;
        case"minute":
            timeType =1000*60;
        break;
        case"hour":
            timeType =1000*3600;
        break;
        case"day":
            timeType =1000*3600*24;
        break;
        default:
        break;
    }
    return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(timeType));
}