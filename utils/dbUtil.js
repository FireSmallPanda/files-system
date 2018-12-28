
// redis 链接
var redis   = require('redis');
var client  = redis.createClient('6379', '127.0.0.1');
var RDS_PWD = '1234567'
 // redis 链接错误
client.auth(RDS_PWD, function(error) {
    console.log(error);
});
// redis 链接错误
client.on("error", function(error) {
    console.log(error);
});

// let getConnect = (callback)=>{
//      // redis 链接错误
//     client.auth(RDS_PWD, function(error) {
//         console.log(error);
//     });
//     // redis 链接错误
//     client.on("error", function(error) {
//         console.log(error);
//     });

//     callback()
// }
exports.setValue = (key,value)=>{

}
/**
 * 保存对象
 */
let setObject = (key,obj)=>{
   //  getConnect(()=>{
        console.log(key,obj)
        client.set(key,JSON.stringify(obj),function(err,response){
            console.log(response)
            if(err){
                console.log(err)
                client.end(false);
                return false
            }
             // 关闭链接
             client.end(true);
             return true
        });
  //   })

}
let user = {
    name:'sdasdasd'
}
setObject('xa',user)