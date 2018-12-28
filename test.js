var http = require('http');
 
// http.createServer(function (request, response) {
 
//     // 发送 HTTP 头部 
//     // HTTP 状态值: 200 : OK
//     // 内容类型: text/plain
//     response.writeHead(200, {'Content-Type': 'text/plain'});
 
//     // 发送响应数据 "Hello World"
//     // response.end('Hello World\n');
// }).listen(8888);
 
// // 终端打印如下信息
// console.log('Server running at http://127.0.0.1:8888/');
// 
 
 
// redis 链接
var redis   = require('redis');
var client  = redis.createClient('6379', '127.0.0.1');
var RDS_PWD = '1234567'


let getConnect = ()=>{
     // redis 链接错误
    client.auth(RDS_PWD, function(error) {
        console.log(error);
    });
    // redis 链接错误
    client.on("error", function(error) {
        console.log(error);
    });

    return client
}
exports.setValue = ()=>{

}
//存值
// client.select('15', function(error){
//     if(error) {
//         console.log(error);
//     } else {
//         // set
//         client.set('er', 'tt', function(error, res) {
//             if(error) {
//                 console.log(error);
//             } else {
//                 console.log(res);
//             }
 
//             // 关闭链接
//             client.end();
//         });
//     }
// });
 
client.get("vvv",function(err,response){
    console.log(err,response); //will print lee
});
let user = {
    name:'小米',
    value:'asd',
    age:15
}
console.log(JSON.stringify(user))
client.set("vvv",JSON.stringify(user),function(err,response){
    console.log(err,response); //will print lee
});
