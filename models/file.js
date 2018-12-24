// 获取配置文件
let configUtil = require('../config/configUtil')
let filesUtil = require('../utils/filesUtil')
let configs = configUtil.configObj
const fs = require('fs')
let formidable = require('formidable')
let msgs = configUtil.msgObj
var url = require('url')
let path = require('path')
const uuidv1 = require('uuid/v1')
var Promise = require('promise')
//创建目录结构
//递归创建目录 异步方法
function mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            //console.log(path.dirname(dirname));
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}
exports.saveOneFile = (req, res) => {
    // parse a file upload
    let form = new formidable.IncomingForm()
    //    Creates a new incoming form.
    form.encoding = 'utf-8'
    // If you want the files written to form.uploadDir to include the extensions of the original files, set this property to true
    form.type = false
    form.uploadDir = path.normalize(configs.FILEPATH)
    form.parse(req, (err, fields, files, next) => {
        if (err) {
            throw err
        }
        // 返回参数
        let content = {}
        // 兼容模式
        if (configs.PATTERN === 'master') {
            mkdirs(configs.FILEPATH + fields.document)
        }
        fs.exists(configs.FILEPATH + fields.document, (exists) => {
            if (!exists) {
                content.success = false
                content.message = `${fields.document}${msgs.F_0001}`
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(content))
                return
            } else {

                let oldPath = files.file.path
                // 判断尺寸
                let size = files.file.size
                if (size > configs.FILESIZE) { // 图片不可大于1M
                    // res.JSON("图片不可大于2M");
                    // 删除文件
                    fs.unlink(oldPath)

                    content.success = false
                    content.message = `文件不得超过${configs.FILESIZE / 1024000}MB`
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify(content))

                    return
                }
                // 改名
                // 随机日期 
                //  let date = sd.format(new Date(), 'YYYYMMDDHHmmss');
                // 随机数
                let ran = uuidv1() //  parseInt(Math.random() * 89999 + 10000);
                // ran = ran.replaceAll("-","")
                // 拓展名
                let extname = path.extname(files.file.name)
                // 新路径
                let newPath = `${configs.FILEPATH}${fields.document}/${ran}${extname}`
                // 执行改名
                fs.rename(oldPath, newPath, (err) => {
                    if (err) {
                        throw err
                    }
                    let content = {}
                    content.success = true
                    content.url = `${fields.document}/${ran}${extname}`
                    content.name = files.file.name
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify(content))
                })
            }

        })

    })
}
// 获取所有文件夹
exports.getAllDocuments = (callback) => {
    let components = []
    const files = fs.readdirSync(configs.FILEPATH)
    files.forEach((item, index) => {
        let stat = fs.lstatSync(configs.FILEPATH + item)
        if (stat.isDirectory() === true) {
            components.push(item)
        }
    })
    return callback(components)
}
// 创建文件夹
exports.createDocument = (req, res) => {
    // parse a file upload
    let form = new formidable.IncomingForm()
    //    Creates a new incoming form.
    form.encoding = 'utf-8'
    let content = {}

    form.parse(req, (err, fields, files, next) => {
        // 文件路径
        let path = configs.FILEPATH + fields.name
        fs.exists(path, (exists) => {
            if (!exists) {
                // 创建文件夹
                fs.mkdir(path, (err) => {
                    if (err) {
                        return console.error(err)
                    }
                    // 创建成功
                    content.success = true
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify(content))
                })
            } else {
                // 若已经存在则报错
                content.success = false
                content.message = `${fields.name}${msgs.F_0002}`
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(content))
                return
            }
        })

    })

}
// 删除文件夹及内容
exports.deleteDocument = (req, res) => {
    // parse a file upload
    let form = new formidable.IncomingForm()
    //    Creates a new incoming form.
    form.encoding = 'utf-8'
    let content = {}

    form.parse(req, (err, fields, files, next) => {
        // 文件路径
        let path = configs.FILEPATH + fields.name
        fs.exists(path, (exists) => {
            if (!exists) {
                // 若不存在则报错
                content.success = false
                content.message = `${fields.name}${msgs.F_0003}`
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(content))
                return
            } else {
                // 若存在则执行
                deleteFolderRecursive(path, (retn) => {
                    // 删除成功
                    content.success = true
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify(content))
                })

            }
        })
    })
}
// 递归删除
let deleteFolderRecursive = (path, callback) => {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = `${path}/${file}`
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath)
            } else { // delete file
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(path)
        callback(true)
    }
}

// 获取文件
exports.getFile = (req, res) => {
    let uri = encodeURI(req.url)
    let form = url.parse(uri, true).query

    let content = {}
    // 文件路径
    let path = decodeURIComponent(configs.FILEPATH + form.path)   //encodeURI(configs.FILEPATH + form.path)
    let name = form.name
    console.log(path)
    fs.exists(path, (exists) => {
        if (!exists) {
            // 若不存在则报错
            content.success = false
            content.message = `${form.path}${msgs.F_0004}`
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(content))
            return
        } else {
            
            //第二种方式
            var f = fs.createReadStream(path)
            res.writeHead(200, {
                'Content-Type': 'application/force-download',
                'Content-Disposition': `attachment; filename=${name}`
            })
            f.pipe(res)
        }
    })
}

/**
- 查看文件夹是否存在 
- @param req {Object} 输入请求
- @param res {Object} 输出请求
- @return 结果
- @author weihao_ling<1020529941@qq.com>
- @example
- D:/a   is exists no action
-        is not exists creat D:/a
*/
exports.checkDocumentAndCreat = (req,res)=>{
    return new Promise(( resolve, req,res)=>{
        // 获取配置路径
        let path = configs.FILEPATH
        // 判断是否存在
        fs.exists(path, (exists) => {
            if (!exists) {
                // 创建文件夹
                fs.mkdir(path, (err) => {
                    if (err) {
                        return console.error(err)
                    }
                })
            }
            resolve('文件初始化完成')
        })
    })
    
}
 // 删除单个文件
exports.deleteFile = (req,res) =>{
    // parse a file upload
    let form = new formidable.IncomingForm()
    //    Creates a new incoming form.
    form.encoding = 'utf-8'
    form.parse(req, (err, fields, files, next) => {
        if (err) {
            throw err
        }
        // 获取删除文件文件路径
        let deleteUrl =  configs.FILEPATH + fields.url
        deleteOneFile(deleteUrl,(retn,msg)=>{
                let content = {}
                content.success = retn
                if(!retn){
                    content.message = msg
                }
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(content))
        })
    })
    
}
// 获取打包文件
exports.getFilePackage = (req,res)=>{
    let form = new formidable.IncomingForm()
    //    Creates a new incoming form.
    form.encoding = 'utf-8'
    form.parse(req, (err, fields, files, next) => {
        if (err) {
            throw err
        }
        // 文件列表
        let filesList = fields.urls.split(configs.FILE_SPLIT)
        // 名字列表
        let nameList = fields.names.split(configs.FILE_SPLIT)
        // 随机数
        let ran = uuidv1()

        // 创建一个新文件夹
        mkdirs(`${configs.FILEPATH}${ran}/${fields.packageName}` ,(dirName)=>{
            // console.log(dirName)
            // if(dirName==null){
            //     return
            // }
            copyFile(filesList,nameList,ran,fields.packageName,(retn)=>{
                // 压缩参数
                let param = {
                    srcFilePath:`${configs.FILEPATH}${ran}`,
                    zipFileName:`${fields.packageName}`,
                    password:'123456'
                }
                // 压缩
                filesUtil.zip(param,(pakRetn)=>{
                    let content = pakRetn
                    if(pakRetn.success){
                        // 替换掉默认路径
                        content.path = '/'+content.path.replace(`${configs.FILEPATH}`,'')
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify(content))
                })
                
            })
           
        })        
    })
}
/**
 * 拷贝多个文件
 * @param {List<String>} filesList 文件列表
 * @param {List<String>} nameList 名字列表
 * @param {String} ran 随机UUID
 * @param {String} fileName 文件名字
 * @param {Function} callback 
 */
let copyFile = (filesList,nameList,ran,fileName,callback) => {    
    // 循环拷贝文件夹到新文件夹里面去
    filesList.forEach((fileItem,index)=>{
            // 拷贝文件夹
            copyIt(`${configs.FILEPATH}${fileItem}`,`${configs.FILEPATH}${ran}/${fileName}/${nameList[index]}`)
    })
    callback(true)
}
let readFile = (function (err, data) {
 
    if (err) return console.error(err)
    
    console.log(data)
    
   })
/**
- 删除单个文件
- @param url {String} 删除的文件路径
- @return 结果
- @author weihao_ling<1020529941@qq.com>
- @example
- D:/aaa/aaa.txt  => D:/aaa/
  the aaa.txt is delete
*/
let deleteOneFile = (url,callback) =>{
        var files = [];
        //判断给定的路径是否存在
        if( fs.existsSync(url) ) {
            if(fs.statSync(url).isDirectory()) { // recurse
                callback(false,`${msgs.F_0006}`)
            // 是文件delete file
            } else {
                fs.unlinkSync(url);
                callback(true)
            }
        }else{
            callback(false,`${msgs.F_0004}`)
        }
    
  }
   /**
    * 拷贝文件
    * @param {String} from 从哪里来
    * @param {String} to 到哪里去
    * @example
    D:/aaa/aaa.txt,D:/aaa/bbb.txt copy a => b
    */
   let copyIt = (from, to,pakFlag=false) => {
    fs.writeFileSync(to, fs.readFileSync(from))
    if(pakFlag){

    }
   }
    
