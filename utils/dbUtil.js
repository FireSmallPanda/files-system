
// redis 链接
var redis   = require('redis');
let configUtil = require('../config/configUtil')
let configs = configUtil.configObj
var client  = redis.createClient(configs.RDS_POT, configs.RDS_IP);
var RDS_PWD = configs.RDS_PWD
 // redis 链接错误
client.auth(RDS_PWD, function(error) {
    if(error){
        console.log(error)
    }
});
// redis 链接错误
client.on("error", function(error) {
    if(error){
        console.log(error)
    }
});

exports.setValue = (key,value)=>{

}
/**
 * 连接DB工具
 */
let connectionDB = ()=>{
    return new Promise(function(resolve,reject){
        client  = redis.createClient(configs.RDS_POT,configs.RDS_IP);
        
        // redis 链接错误
        client.on("error", function(error) {
            if(error){
                console.log(error)
            }
        });
         // redis 链接错误
        client.auth(RDS_PWD, function(error) {
            if(error){
                console.log(error)
            }
        });
        resolve(true)
    })
}


/**
 * 选库工具
 */
let selectDB = (dbNo)=>{
    return new Promise((resolve,reject)=>{
        client.select(dbNo, function (err) {
              if (err) {
                reject(false)
              } else {
                resolve(true)
              }   
        })
    })
}


/**
 * 获取对象工具
 */
let getString2Object = (key)=>{
  return new Promise((resolve,reject)=>{
    client.get(key,function(err,response){
        if(err){
            console.log(err)
            client.end(false)
            reject(false)
        }
        // 关闭链接
        client.end(true)
        resolve(JSON.parse(response))
    });
  })
}

/**
 * 保存对象
 * @param {String} key 键  
 * @param {Object} obj 对象
 * @param {Number} select 库 
 * @param {Function} 回调 
 * */
exports.setObject = (key,obj,select=1,callBack) => {
    connectionDB().then(()=>{
        selectDB(select).then((flag)=>{
            client.set(key,JSON.stringify(obj),function(err,response){
                if(err){
                    console.log(err)
                    client.end(false)
                    callBack(false)
                }
                // 关闭链接
                client.end(true)
                callBack(true)
            });
        })
    })
}

/**
 * 获取对象
 * @param {String} key 键  (多个用,隔开)
 * @param {Number} select 库 
 * @param {Function} 回调 
 * */
exports.getObject = (key,select=1,callBack) => {
  connectionDB().then(()=>{
      selectDB(select).then((flag)=>{
          
        if(!key){
            callBack(null)
        }else if(key.indexOf(',')>-1){
              let keys = key.split(',')
              client.mget( keys,function(err,response){
                callBack(response)
              })
          }else{
            getString2Object(key).then( function(response){
                callBack(response)
            });
          }
      })
  })
}


/**
 * 删除key
 * @param {String} key 键  (多个用,隔开)
 * @param {Number} select 库 
 * @param {Function} 回调 
 * */
exports.delKey = (key,select=1,callBack) => {
    connectionDB().then(()=>{
        selectDB(select).then((flag)=>{
            if(key.indexOf(',')>-1){
                callBack(true)
            }else{
                //先清除数据
                client.del(key,function() {
                    callBack(true)
                })
            
            }
        })
    })
  }
  
