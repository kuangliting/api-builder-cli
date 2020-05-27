<h1 align="center">api-builder-cli</h1>

## Introduction
## 介绍
api-builder-cli 是一个帮助前端开发提升开发效率的小工具，通过简单的配置，它就能**自动生成**整个项目的**前后端api调用方法**模块，使用它有一个前提，就是后端必须提供生成api对应的swagger.json 文件的服务。

## 使用方式
### 安装
```shell
npm install api-builder-cli -g
```

### 使用
```shell
api --host  hostUrl   //生成api模块命令，hostUrl为服务器swagger.json地址
api  // 生成api模块命令，前提是api.config.js配置了服务器地址

api -h //查看命令参数
api init //生成配置文件

```

### config

首次输入**api**后，如果命令所在工作目录没有api.config.js，会自动生成该文件，也可以用**api init**手动生成。


```javascript
let Path = require("path");
let resolve = (path) => {
    return Path.resolve(__dirname, path);
}

module.exports = {
    apiHost: "",//swagger.json地址 "http://10.9.105.13:8889/v2/api-docs"
    includes: [],//生成包含includes的path的api
    excludes: [],//过滤包含excludes的path的api
    swaggerPath: resolve(".swagger/swagger.json"),
    api: {
        path: resolve("src/api-cli"),
       // fileName: "{moduleName}/index.js",
       // requestPath:"../request.js",
        hasComments: true,
    },
    //tsSupport: false,
    //typePath: resolve("src/typings/api/smartCity.d.ts"),
}
```