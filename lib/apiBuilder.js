 const fse = require("fs-extra");
 const Path = require("path");
 const template = require("./template");

 async function builder(config, swgPath) {
    let apicfg = config.api;
    let apiPath = apicfg.path;
    let filterUtil = new FilterUtil(config);
    let swagger = require(swgPath).paths;
    let paths=[];
    Object.keys(swagger).forEach(path=>{
      if ( filterUtil.testPath(path)) {
         paths.push(path)
      }
    })
    //console.log(paths);
    let beforeModuleName;
    let moduleName;
    let fileContent = "";
    let onceRun = true;
    let nameList = [];
    //console.log(Object.keys(swagger));
   
    paths.forEach((path, index) => {
       console.log(path)
      //  if (!filterUtil.testPath(path)) {
      //     return;
      //  }   

       let method = Object.keys(swagger[path])[0];
       let nameUtil = new NameUtils(path, method);
       let funcName = nameUtil.getFuncName();
       if (!funcName) {
          return;
       }
       moduleName = nameUtil.getModuleName();
       //  console.log("------------------moduleName-------------");
       //  console.log(moduleName);
       if (onceRun) {
          onceRun = false;
          beforeModuleName = moduleName;
          fileContent = template.header({
             request: "@/utils/request"
          });
       }
       let param = {
          funcName,
          path,
          method,
       }
       fileContent = fileContent + template.getApiContent(param);
       nameList.push(funcName);
       if (moduleName !== beforeModuleName) {
          fileContent = fileContent + template.getModuleExport(nameList);
          nameList=[];
          let fullPath = Path.resolve(apiPath, beforeModuleName, "./index.js");
          fse.outputFileSync(fullPath, fileContent);
          fileContent = template.header({
             request: "@/utils/request"
          });
          beforeModuleName = moduleName;
       }
    })
    if (moduleName) {
      fse.outputFileSync(Path.resolve(apiPath, moduleName, "./index.js"), fileContent);
       //fse.outputFileSync(Path.resolve(apiPath , "./index.js"), fileContent);
    }

 }

 class NameUtils {
    constructor(path, method) {
       this.path = path;
       this.method = method;
       let pathArr;
       if (path.indexOf("/") !== -1) {
          this.pathArr = path.split("/").slice(1);
       } else {
          this.pathArr = [path.trim()];
       }
    }
    getModuleName() {
       return this.pathArr[0].replace(/[-_]([A-Za-z])/g, function (_, letter) {
          return letter.toUpperCase();
       })
    }
    getFuncName() {
       if (this.pathArr.length < 2 || !this.pathArr[1]) {
          return void(0);
       }

       //console.log(this.pathArr.length)
       let next = this.pathArr.slice(1);
       let rest = next.join("-");
       if (this.method === 'get' && rest.indexOf('get') !== 0) {
          rest = "get-" + rest;
       }

       return rest.replace(/\{|\}/g, '').replace(/[-_]([A-Za-z])/g, function (_, letter) {
          return letter.toUpperCase();
       })
    }
 }

 class FilterUtil {
    constructor(config) {
       this.config = config;
       let {
          includes,
          excludes
       } = config;
       if (includes && includes.length && includes instanceof Array) {
          this.includes = includes
       }
       if (excludes && excludes.length && includes instanceof Array) {
          this.excludes = excludes
       }
    }
    testPath(path) {
       if (!path) {
          return false;
       }
       if (path.indexOf("/") === -1) {
          return false;
       } else {
          if (this.includes) {
             //console.log("has includes")
             //console.log(this.includes);
             let has = this.includes.some(exd => {
                return path.indexOf(exd) !== -1;
             })
             return has;
             if (this.excludes) {
                return !this.excludes.some(exd => {
                   return path.indexOf(exd) !== -1;
                })
             } else {
                return has
             }
          } else {
             if (this.excludes) {
                return !this.excludes.some(exd => {
                   return path.indexOf(exd) !== -1;
                })
             } else {
                return true;
             }
          }
       }
    }
 }

 module.exports = builder;