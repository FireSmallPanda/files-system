let configUtil = require('../config/configUtil')
let msgs = configUtil.msgObj
/**
 * 错误的返回
 * @param {Object} res  输出
 * @param {String} msgNo 错误编号
 * @param {String} message 错误自定义信息
 */
exports.errorRetn = (res,msgNo,message) => {
    let showMsgNo = '其他'
    let content = {}
    content.success = false
    // 判断是否有直接的消息编号匹配
    if(message){
        content.message = message
    }else{
        content.message = msgs[msgNo]
    }
    // 判断是否有消息编号
    if(msgNo){
        showMsgNo = msgNo
    }
    // 是否再消息中显示编号(帮助开发更快速定位错误)
    if(msgs.SHOW_MSGNO){
        content.message+=`(错误编号:${showMsgNo})`
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(content))    
}
/**
 * 成功时候输出
 * @param {Object} res 
 * @param {Object} content 
 */
let successRetn = (res,content) => {
    return null
}
