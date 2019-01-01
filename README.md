# files-api 文件微服务

> 用于处理文件上传下载到服务器的功能

## Build Setup

``` bash
# 下载 dependencies
npm install

# 启动项目(本地版)
npm run start
# 启动项目(阿里云OSS版)
npm run oss
```
## 配置
> nodeapi\files-api\config\dev.yml 用于设置系统配置

## 接口配置
> nodeapi\files-api\config\文件上传微服务接口.postman_collection.json 用于导入postman生成接口

### 目录结构

```
FILE-SYSTEM
│  .eslintrc.js 
│  .gitignore
│  Dockerfile  //  Docker 配置文件
│  README.md
│  app.js  // 程序主入口
│  ossApp.js
│  package-lock.json
│  package.json
│  test.js
│  yarn.lock
│  文件上传微服务接口.postman_collection.json // 接口位置
│
├─config // 配置层
│      configUtil.js
│      dev.yml
│      msg.yml
│      ossUtil.js
│
├─controller // controller 层
│      ossController.js
│      router.js
│
└─models  // models 层
        file.js
        ossFile.js

```
### 相关文档
更新日志(https://github.com/ElemeFE/element/blob/master/.github/CONTRIBUTING.zh-CN.md)
