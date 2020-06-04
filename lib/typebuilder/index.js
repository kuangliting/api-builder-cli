const fse = require("fs-extra");
const Path = require("path");
const template = require("../template");
const typeBuilder =  require("./typeBuilder");
const {
    FilterUtil,
    NameUtils
} = require("../utils/formatSwagger");
const {
    getCommentContent,
} = require("../commentsBuilder");

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
    typeBuilder(config, swgPath);
    let beforeModuleName;
    let moduleName;
    let fileContent = "";
    let onceRun = true;
    let nameList = [];
    let comments = apicfg.comments;
    let apiFilePath = apicfg.fileName && apicfg.fileName.trim();
    let requestFilePath = apicfg.requestPath && apicfg.requestPath.trim() || "@/utils/request";
    paths.forEach((path, index) => {
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
                    request: requestFilePath
                });
            }
            if (moduleName !== beforeModuleName) {
                fileContent = fileContent + template.getModuleExport(nameList);
                nameList = [];
                let fullPath;
                if (apiFilePath) {
                    fullPath = Path.resolve(apiPath, apiFilePath.replace(/\{moduleName\}/g, beforeModuleName));
                } else {
                    fullPath = Path.resolve(apiPath, beforeModuleName, "./index.ts");
                }
                fse.outputFileSync(fullPath, fileContent);
                fileContent = template.header({
                    request: requestFilePath
                });
                beforeModuleName = moduleName;
            }

            let param = {
                funcName,
                path,
                method,
            }
            if (comments && comments.show === true) {
                let apiObj = swagger[path][method];
                fileContent = fileContent + getCommentContent(apiObj, comments, swagger.definitions);

            }
            fileContent = fileContent + template.getApiContent(param);
            nameList.push(funcName);
        })
    })
    if (moduleName) {
        fileContent = fileContent + template.getModuleExport(nameList);
        let fullPath;
        if (apiFilePath) {
            fullPath = Path.resolve(apiPath, apiFilePath.replace(/\{moduleName\}/g, beforeModuleName));
        } else {
            fullPath = Path.resolve(apiPath, beforeModuleName, "./index.ts");

        }
        fse.outputFileSync(fullPath, fileContent);
    }
}

module.exports = builder;