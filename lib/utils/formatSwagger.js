const fse = require("fs-extra");
async function changeOperId(swgPath) {
   let swagger = require(swgPath);
   let pathObj = swagger.paths;
   Object.keys(pathObj).forEach(path => {
      let pathInfo = pathObj[path];
      if (!pathInfo) {
         return;
      }
      let keys = Object.keys(pathInfo);
      if (keys.length === 0) {
         return;
      }
      let method = keys[0];
      let pathId = (path.slice(1) + "-" + method)
         .replace(/\{|\}|\(|\)/g, "")
         .replace(/\//g, "-")
         .replace(/-([a-zA-Z])/g, function (_, s) {
            return s.toUpperCase();
         })
      pathInfo[method].operationId = pathId;
   })
   await fse.outputFile(swgPath, JSON.stringify(swagger));
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

function firstToUpperCase(str) {
   return str[0].toLocaleUpperCase() + str.slice(1)
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
      return this.moduleName || (this.moduleName = this.pathArr[0].replace(/[-_]([A-Za-z])/g, function (_, letter) {
         return letter.toUpperCase();
      }))
   }
   getFuncName() {
      if (this.pathArr.length < 2 || !this.pathArr[1]) {
         let funcName = this.pathArr[0] + '-' + this.method;
         return funcName.replace(/[-_]([A-Za-z])/g, function (_, letter) {
            return letter.toUpperCase();
         });
      }
      let next = this.pathArr.slice(1);
      let rest = next.join("-");
      if (this.method === 'get' && rest.indexOf('get') !== -1) {
         
      } else {
         rest = this.method + "-" + rest;
      }
      let paramList = [];
      let r = rest.replace(/\{([A-Za-z0-9]+)\}/g, function (a, b) {
         paramList.push(firstToUpperCase(b));
         return ""
      })
      // if(this.method === 'delete'){
      //    console.log(this.path);
      // }
      let paramStr = paramList.length > 0 ? 'By' + paramList.join("And") : '';
      if (r === '') {
         return this.method + firstToUpperCase(this.getModuleName()) + paramStr;
      } else {
         return r.replace(/([-|_])[-|_]+/g, '-').replace(/([-|_]+)$/g, '').replace(/[-_]([A-Za-z])/g, function (_, letter) {
            return letter.toUpperCase();
         }) + paramStr
      }
   }
}

module.exports.changeOperId = changeOperId;
module.exports.FilterUtil = FilterUtil;
module.exports.NameUtils = NameUtils;