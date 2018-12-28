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