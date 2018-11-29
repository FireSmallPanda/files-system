// 获取配置文件
let configUtil = require('../config/configUtil')
let configs = configUtil.configObj
const fs = require('fs')
let formidable = require('formidable')
let msgs = configUtil.msgObj
var url = require('url')
let path = require('path')
const uuidv1 = require('uuid/v1')


//创建目录结构
function mkdirs(filePath) {
    if (fs.existsSync(filePath)) {
        return true
    }
    if (!fs.existsSync(path.dirname(filePath))) {
        mkdir(path.dirname(filePath))
    }
    fs.mkdirSync(filePath)
};
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
                console.log(files.file)
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


exports.getFile = (req, res) => {
    let uri = encodeURI(req.url)
    let form = url.parse(uri, true).query

    let content = {}
    // 文件路径
    let path = configs.FILEPATH + form.path
    let name = form.name
    console.log(name)
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