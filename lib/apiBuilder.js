 const fse = require("fs-extra");
 const Path = require("path");
 const template = require("./template");
 const {
    FilterUtil,
    NameUtils
 } = require("./utils/formatSwagger");
 const {
    getCommentContent,
 } = require("./commentsBuilder");

 async function builder(config, swgPath) {
    let apicfg = config.api;
    let apiPath = apicfg.path;
    let filterUtil = new FilterUtil(config);
    let swagger = require(swgPath).paths;
    let paths = [];
    Object.keys(swagger).forEach(path => {
       if (filterUtil.testPath(path)) {
          paths.push(path)
       }
    })
    let beforeModuleName;
    let moduleName;
    let fileContent = "";
    let onceRun = true;
    let nameList = [];
    let hasComments = apicfg.hasComments;

    paths.forEach((path, index) => {
       //console.log(path)
       //  if (!filterUtil.testPath(path)) {
       //     return;
       //  }
       Object.keys(swagger[path]).forEach((method) => {
          let nameUtil = new NameUtils(path, method);
          let funcName = nameUtil.getFuncName();
          if (!funcName) {
             return;
          }
          moduleName = nameUtil.getModuleName();
          if (onceRun) {
            onceRun = false;
            beforeModuleName = moduleName;
            fileContent = template.header({
               request: "@/utils/request"
            });
          }
          if (moduleName !== beforeModuleName) {
            fileContent = fileContent + template.getModuleExport(nameList);
            nameList = [];
            let fullPath = Path.resolve(apiPath, beforeModuleName, "./index.js");
            fse.outputFileSync(fullPath, fileContent);
            fileContent = template.header({
               request: "@/utils/request"
            });
            beforeModuleName = moduleName;
         }
         
          let param = {
             funcName,
             path,
             method,
          }
          if (hasComments === true) {
             let apiObj = swagger[path][method];
             let parameters = apiObj.parameters;
             if (parameters) {
                fileContent = fileContent + getCommentContent(parameters);
             }
          }

          fileContent = fileContent + template.getApiContent(param);
          nameList.push(funcName);
       })

       
    })
    if (moduleName) {
       fileContent = fileContent + template.getModuleExport(nameList);
       fse.outputFileSync(Path.resolve(apiPath, moduleName, "./index.js"), fileContent);
    }
 }


 module.exports = builder;