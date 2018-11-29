// 获取配置文件
let configUtil = require("../config/configUtil");
let configs = configUtil.configObj;
const fs = require("fs");
var Promise = require('promise');
let formidable = require('formidable')
let msgs = configUtil.msgObj;
var url = require('url');
let path = require("path");
const uuidv1 = require('uuid/v1');
var stream = require('stream');
// oss连接池
let ossClient = configUtil.ossClient

// oss保存文件
async function put(onlinePath, localPath,callback) {
    try {
        let result = await ossClient.put(onlinePath, localPath);
        // 删除文件
        callback(result)
        return result
    } catch (e) {
        console.log(e);
        return
    }
}
// 文件列表
async function listDir(dir, callback) {
    let result = await ossClient.list({
        prefix: dir,
        delimiter: "/"
    });
    //  console.log(result)
    callback(result)
}
// 流式上传
async function putBuffer(onlinePath, buffer) {
    try {
        let result = await ossClient.put(onlinePath, new Buffer(buffer));
        return result;
    } catch (e) {
        console.log(e);
    }
}
// 删除
async function deleteObject(path) {
    try {
        let result = await ossClient.delete(path);
        return result;
    } catch (e) {
        console.log(e);
    }
}
// 批量删除
async function deleteMulti(deleteList) {
    try {
        let result = await ossClient.deleteMulti(deleteList, {
            quiet: true
        });
        console.log(result);
    } catch (e) {
        console.log(e);
    }
}
// 流式下载
async function getStream(path) {
    try {
        let result = await ossClient.getStream(path);
        console.log(result);
        return result
    } catch (e) {
        console.log(e);
    }
}
//  buffer下载
async function getBuffer(path, callback) {
    try {
        
        let result = await ossClient.get(path);
      
       /// console.log(result);
        callback(result.content)
    } catch (e) {
        console.log(e);
    }
}
// 默认接口 F1001
exports.showIndex = (req, res) => {
    res.writeHead(200, { 'Content-Type': "text/html;charset=UTF-8" });
    res.end('OSS对象存储文件接口');
}


// 单文件上传 F1002
exports.saveOneFile = (req, res) => {
    let that = this;
    // parse a file upload
    let form = new formidable.IncomingForm();
    //    Creates a new incoming form.
    form.encoding = 'utf-8';
    // If you want the files written to form.uploadDir to include the extensions of the original files, set this property to true
    form.type = false;
    form.uploadDir = path.normalize(configs.FILEPATH);
    form.parse(req, (err, fields, files, next) => {
        if (err) {
            throw err
        }

        // 返回参数
        let content = {}
        fs.exists(configs.FILEPATH, (exists) => {
            if (!exists) {
                content.success = false
                content.message = `${fields.document}${msgs.F_0001}`
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(content));
                return
            } else {

                let oldPath = files.file.path;
                // 判断尺寸
                let size = files.file.size;
                if (size > configs.FILESIZE) { // 图片不可大于1M
                    // res.JSON("图片不可大于2M");
                    // 删除文件
                    fs.unlink(oldPath)

                    content.success = false
                    content.message = `文件不得超过${configs.FILESIZE / 1024000}MB`
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(content));
                    return
                }
                // 改名
                // 随机日期 
                //  let date = sd.format(new Date(), 'YYYYMMDDHHmmss');
                // 随机数
                let ran = uuidv1() //  parseInt(Math.random() * 89999 + 10000);
                // ran = ran.replaceAll("-","")
                // 拓展名
                let extname = path.extname(files.file.name);
                // 新路径
                let onlinePath = configs.OSSFILEPATH + '/' + fields.document + "/" + ran + extname
                let content = {}
                // 上传到oss
                put(onlinePath, files.file.path,(result)=>{
                    // 删除本地缓存
                    fs.unlinkSync(files.file.path);
                    content.success = true
                    content.url = onlinePath
                    content.name = files.file.name
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(content));
                })
               
                
            }

        });
    });
}
// 获取所有文件夹
exports.getAllDocuments = (req, res) => {
    let content = {}
    content.entries = []
    listDir(configs.OSSFILEPATH + "/", (result) => {
        if (result.prefixes != null) {
            result.prefixes.forEach(function (subDir) {
                let item = subDir.replace(configs.OSSFILEPATH + "/", '')
                item = item.replace("/", '')
                content.entries.push(item)

            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(content));
        }
        // result.prefixes.forEach(function (subDir) {
        //     console.log('SubDir: %s', subDir);
        // });
        // result.objects.forEach(function (obj) {
        //     console.log('Object: %s' + obj.name);
        // });
    })

}
// 创建文件夹
exports.createDocument = (req, res) => {
    // parse a file upload
    let form = new formidable.IncomingForm();
    //    Creates a new incoming form.
    form.encoding = 'utf-8';
    let content = {}
    form.parse(req, (err, fields, files, next) => {
        // 文件路径
        let onlinePath = configs.OSSFILEPATH + "/" + fields.name
        let result = putBuffer(onlinePath + "/readme.txt", configs.READMETEXT)
        let content = {}
        content.success = true
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(content));
    })
}

// 删除文件夹及内容
exports.deleteDocument = (req, res) => {
    // parse a file upload
    let form = new formidable.IncomingForm();
    //    Creates a new incoming form.
    form.encoding = 'utf-8';
    let objectList = []
    let content = {}
    form.parse(req, (err, fields, files, next) => {
        // 文件路径
        let onlinePath = configs.OSSFILEPATH + "/" + fields.name + "/"
        listDir(onlinePath, (result) => {
            if (result.objects != null) {
                result.objects.forEach(function (obj) {
                    console.log(obj.name)
                    objectList.push(obj.name)
                });
            }
            // 批量删除文件夹下的内容
            let resultDelete = deleteMulti(objectList)
            content.success = true
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(content));
        })
    })

}
// 获取文件
exports.getFile = (req, res) => {
    // parse a file upload
    let uri = encodeURI(req.url)
    let form = url.parse(uri, true).query;

    let content = {}
    // 文件路径
    let onlinePath = configs.OSSFILEPATH + form.path
    let name = form.name
    listDir(onlinePath, (item) =>{
        if(typeof(item.objects)=='undefined'){
                let content = {}
                content.success = false
                content.message = `${onlinePath}${msgs.F_0005}`
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(content));
                return
        }
        getBuffer(onlinePath, (buffer) => {
            // 创建一个bufferstream
            var f = new stream.PassThrough();
            //将Buffer写入
            f.end(buffer);
            res.writeHead(200, {
                'Content-Type': 'application/force-download',
                'Content-Disposition': `attachment; filename=${name}`
            });
            f.pipe(res);
        });
    });
    

    // fs.exists(path, (exists) => {
    //     if (!exists) {
    //         // 若不存在则报错
    //         content.success = false
    //         content.message = `${form.path}${msgs.F_0004}`
    //         res.writeHead(200, { 'Content-Type': 'application/json' });
    //         res.end(JSON.stringify(content));
    //         return
    //     } else {
    //            //第二种方式
    //             var f = fs.createReadStream(path);
    //             res.writeHead(200, {
    //                 'Content-Type': 'application/force-download',
    //                 'Content-Disposition': `attachment; filename=${name}`
    //             });
    //             f.pipe(res);
    //     }
    // })



}