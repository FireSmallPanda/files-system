// 获取配置文件
let configUtil = require('../config/configUtil')
let filesUtil = require('../utils/filesUtil')
let commonUtil = require('../utils/commonUtil')
let dbUtil = require('../utils/dbUtil')
let returnUtil = require('../utils/returnUtil')
let configs = configUtil.configObj
const fs = require('fs')
let formidable = require('formidable')
let msgs = configUtil.msgObj
let keepFilesObj = configUtil.keepFilesObj
let url = require('url')
let path = require('path')
let Promise = require('promise')
let schedule = require('node-schedule');
// 保存单个文件
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
        // if (configs.PATTERN === 'master') {
        //     mkdirs(configs.FILEPATH + fields.document,()=>{
        //     })
        // }
        fs.exists(configs.FILEPATH + fields.document, (exists) => {
            if (!exists) {
                // 文件夹不存在报错
                returnUtil.errorRetn(res,'F_0001',`${fields.document}${msgs.F_0001}`)
            } else {
                let oldPath = files.file.path
                // 判断尺寸
                let size = files.file.size
                // 图片不可大于 N M 此处为服务器端限制文件大小 应大于所调用该服务的所有使用端的文件大小
                if (size > configs.FILESIZE) {
                    // 删除文件
                    fs.unlink(oldPath)
                    // 文件夹不存在报错
                    returnUtil.errorRetn(res,null,`文件不得超过${configs.FILESIZE / 1024000}MB`)
                }
                // 改名
                // 随机日期 
                //  let date = sd.format(new Date(), 'YYYYMMDDHHmmss');
                // 随机数
                let ran = commonUtil.creatUUID()
                // 随机id（存入数据库）
                let ranId = commonUtil.creatUUID(4)
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
                    
                    content.url = `${fields.document}/${ran}${extname}` // 即将删除
                    // 如果有名字就取名字若没有则取上传文件名字
                    if(fields.name){
                        content.name = `${fields.name}${extname}`
                    }else{
                        content.name = files.file.name
                    }
                    content.id = ranId
                    content.creatTime = new Date().getTime()
                    content.type = 'file' // 文件类型
                    dbUtil.setObject(content.id,content,configs.RD_DB_NO.FILE,(dbFlag)=>{
                        if(dbFlag){
                            content.success = true
                            res.writeHead(200, { 'Content-Type': 'application/json' })
                            res.end(JSON.stringify(content))
                        }else{
                            // 数据库出错
                            returnUtil.errorRetn(res,'F_0007')
                        }
                    })
                    
                   
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
                    // 随机id（存入数据库）
                    let ranId = commonUtil.creatUUID(4)
                    content.id = ranId
                    content.url = fields.name
                    content.creatTime = new Date().getTime()
                    content.type = 'document' // 文件夹类型 
                    // 保存数据库
                    dbUtil.setObject(content.id,content,configs.RD_DB_NO.FILE,(dbFlag)=>{
                        if(dbFlag){
                            content.success = true
                            res.writeHead(200, { 'Content-Type': 'application/json' })
                            res.end(JSON.stringify(content))
                        }else{
                             // 数据库出错
                             returnUtil.errorRetn(res,'F_0007')
                        }
                    })
                })
            } else {
                 // 若文件夹已经存在则报错
                 returnUtil.errorRetn(res,'F_0002',`${fields.name}${msgs.F_0002}`)
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
        
        dbUtil.getObject(fields.id,configs.RD_DB_NO.FILE,(data)=>{
            if(data){
                if(data.type=='document'){
                     // 文件路径
                    let path = configs.FILEPATH + data.url
                    fs.exists(path, (exists) => {
                        if (!exists) {
                            // 若文件夹已经存在则报错
                            returnUtil.errorRetn(res,'F_0003',`${fields.name}${msgs.F_0003}`)
                        } else {
                             // 删除数据
                             dbUtil.delKey(fields.id,configs.RD_DB_NO.FILE,(retn)=>{
                                // 若存在则执行
                                deleteFolderRecursive(path, (retn) => {
                                     // 删除成功
                                    content.success = true
                                    res.writeHead(200, { 'Content-Type': 'application/json' })
                                    res.end(JSON.stringify(content)) 
                                })
                            })
                        }
                    })
                }else{
                    // 您所查询出的并不是一个文件夹
                    returnUtil.errorRetn(res,'F_0011')
                }
                
            }else{
                // 数据库出错
                returnUtil.errorRetn(res,'F_0007')
            }
        }) 
       
    })
}

// 获取文件
exports.getFile = (req, res) => {
    let uri = encodeURI(req.url)
    let form = url.parse(uri, true).query
    let content = {}
    // 文件路径
    let path = decodeURIComponent(configs.FILEPATH + form.path)
    //encodeURI(configs.FILEPATH + form.path)
    let name = form.name
    // 若有id参数则将 path 替换为id
    if(req.params.id){
        form.path = req.params.id
    }else if(form.id){
        form.path = form.id
    }
    // 1.判断是否存在 2.判断是否为id
    if(!form.path||form.path.indexOf('\\')==-1&&form.path.indexOf('/')==-1){
     // 若是uuid则查询
        dbUtil.getObject(form.path,configs.RD_DB_NO.FILE,(data)=>{
            if(data){
                // 判断是否为一个文件
                if(data.type=='file'){
                    // 重定url
                    path = `${configs.FILEPATH}${data.url}`
                    // 若无名字则取数据库名字
                    if(!name){
                        name = data.name
                        getFiles(res,path,data.url,name,true) 
                    }else{
                        getFiles(res,path,data.url,name) 
                    }
                    
                    
                }else{
                    // 您所查询出的并不是一个文件
                    returnUtil.errorRetn(res,'F_0010')
                }
            }else{
                // 数据库出错
                returnUtil.errorRetn(res,'F_0007')
            }
        }) 
    }else{
        // 即将删除
        getFiles(res,path,form.path,name) 
    }
     
    
}
/**
- 查看文件夹是否存在 
- @param  {Object} req 输入请求
- @param  {Object} res 输出请求
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
        // 若是uuid则查询
        dbUtil.getObject(fields.id,configs.RD_DB_NO.FILE,(data)=>{
            // 判断数据是否存在
            if(data){
                // 重定url
                // 获取删除文件文件路径
                let deleteUrl =  configs.FILEPATH + data.url
                // 删除数据
                dbUtil.delKey(fields.id,configs.RD_DB_NO.FILE,(retn)=>{
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
                             
            }else{
                // 数据库出错
                returnUtil.errorRetn(res,'F_0007')
            }
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
            console.log(err)
            throw err
        }
        // 文件列表
        let filesList = []
        // 名字列表
        let nameList = fields.names.split(configs.FILE_SPLIT)
        // 随机数
        let ran = commonUtil.creatUUID()
        // 创建一个新文件夹(在临时文件夹里)
        mkdirs(`${configs.FILEPATH}${configs.TEMPORARY}/${ran}/${fields.packageName}`,(err,dirName)=>{
            if(err){
                console.log(err)
                throw err
            }
            // 若是uuid则查询
            dbUtil.getObject(fields.ids,configs.RD_DB_NO.FILE,(data)=>{
                if(data){
                    let fileObjects = data
                    if(fileObjects instanceof Array){
                        // 创建lilesList
                        fileObjects.forEach((fileStringItem)=>{
                            // 转义列表string
                            let obj =  JSON.parse(fileStringItem)
                            if(obj){
                                filesList.push(obj.url)
                            }
                        })
                    }else{
                        filesList.push(fileObjects.url)
                    }
                    
                    copyFile(filesList,nameList,ran,fields.packageName,(retn)=>{
                        // 压缩参数
                        let param = {
                            srcFilePath:`${configs.FILEPATH}${configs.TEMPORARY}/${ran}`,
                            zipFileName:`${fields.packageName}`,
                            password:'123456' // 压缩密码
                        }
                        // 压缩
                        filesUtil.zip(param,(pakRetn)=>{
                            let content = pakRetn
                            if(pakRetn.url){
                                // 替换掉默认路径
                                content.url = content.url.replace(`${configs.FILEPATH}`,'')
                                let ranid  = commonUtil.creatUUID(4)
                                content.id = ranid
                                let name = `${fields.packageName}.zip`
                                content.name = name
                                content.creatTime = new Date().getTime()
                                content.type = 'file' // 文件类型
                                dbUtil.setObject(content.id,content,configs.RD_DB_NO.FILE,(dbFlag)=>{
                                    if(dbFlag){
                                        delete content.url;//删除url
                                        content.success = true
                                        res.writeHead(200, { 'Content-Type': 'application/json' })
                                        res.end(JSON.stringify(content))
                                    }else{
                                        // 数据库出错
                                        returnUtil.errorRetn(res,'F_0007')
                                    }
                                })
                            }else{
                                res.writeHead(200, { 'Content-Type': 'application/json' })
                                res.end(JSON.stringify(content))
                            }
                           
                        })
                        
                    })
                }else{
                    // 没有找到可打包文件
                    returnUtil.errorRetn(res,'F_0008')
                }
                
            })  
        })        
    })
}


/**
 * 备份文件
 */
exports.keepFiles =()=>{
    // 判断是否备份文件
    if(configs.KEEPFLAG){
        let cron = configs.COPYCRON || '0 * * * * ?'
        
        
        schedule.scheduleJob(cron, ()=>{
            if(keepFilesObj.FILES.length>0&&keepFilesObj.KEEPPATH!=null&&keepFilesObj.KEEPPATH.length>0){
                let startTime = new Date()
                keepFilesObj.FILES.forEach((item,index)=>{
                    // 拷贝文件夹
                    copyIt(`${item.value}`,`${keepFilesObj.KEEPPATH}/${item.name}`)

                })
                let endTime = new Date()
                let defTime  = commonUtil.getDateDiff(startTime,endTime,'second')
                console.log('备份文件成功:' + new Date());
                console.log(`备份耗时：${defTime}秒`);
            }
            
        })
    }
}
/**
 * 保存任务
 */
exports.saveMession = (req,res)=>{
    // parse a file upload
    let form = new formidable.IncomingForm()
    //    Creates a new incoming form.
    form.encoding = 'utf-8'
    // If you want the files written to form.uploadDir to include the extensions of the original files, set this property to true
    form.type = false
    form.uploadDir = path.normalize(configs.FILEPATH)
    form.parse(req, (err, fields, files, next) => {
        let mession = {}
        let id = ""
        // 有id是更新没id是添加
        if(fields.id){
            id = fields.id
            mession.updateTime = new Date().getTime()
        }else{
            id = commonUtil.creatUUID(4)
            mession.creatTime = new Date().getTime()
            mession.item = []
        }
        mession.id = id
        mession.name = fields.name
        mession.cron = fields.cron
        dbUtil.setObject(id,mession,configs.RD_DB_NO.MESSION,(dbFlag)=>{
            if(dbFlag){
                let content = {}
                content.success = true
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(content))
            }else{
                // 数据库出错
                returnUtil.errorRetn(res,'F_0007')
            }
        })
    })
}
/** 
 * 创建目录结构 递归创建目录 异步方法
 * @param {String} dirname 创建的文件路径
 * @param {Function} callback 回调
 */
function mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}
/**
 * 递归删除
 * @param {String} path 删除的文件路径
 * @param {Function} callback 回调
 */
let deleteFolderRecursive = (path, callback) => {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            let curPath = `${path}/${file}`
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

/**
 * 获取文件通用类
 * @param {Object} res 输出
 * @param {String} path 文件路径(绝对)
 * @param {String} formPath 文件路径(相对)
 * @param {String} name 文件名字
 * @param {boolean} uriFlag 是否需要进行转码 
 */
let getFiles = (res,path,formPath,name,uriFlag = false)=>{
    let content  = {}
    fs.exists(path, (exists) => {
        if (!exists) {
            // 文件不存在本地磁盘中
            returnUtil.errorRetn(res,'F_0004',`${formPath}${msgs.F_0004}`)
        } else {
            //第二种方式
            let f = fs.createReadStream(path)
            // 若需要转码则转码
            if(uriFlag){
                name = encodeURIComponent(name)
            }
            res.writeHead(200, {
                'Content-Type': 'application/force-download',
                'Content-Disposition': `attachment; filename=${name}`
            })
            f.pipe(res)
        }
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
            copyIt(`${configs.FILEPATH}${fileItem}`,`${configs.FILEPATH}${configs.TEMPORARY}/${ran}/${fileName}/${nameList[index]}`)
    })
    callback(true)
}
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
        let files = [];
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
   }
    
