const inquirer = require("inquirer");
const fse = require("fs-extra");
const path = require("path");
const apiBuilder = require("./apiBuilder");
let fetch = require("node-fetch");
let http = require("http");

async function build(...args) {
    try {
        let cwd = process.cwd();
        let fPath = path.resolve(cwd, 'api.config.js');
        if (fse.pathExistsSync(fPath)) {
            let config = require(fPath);
            let res = await fetch(config.apiHost);
            if (res.ok) {
                let swgPath = path.resolve(process.cwd(), ".swagger/swagger.json")
                let body = await res.text();
                await fse.outputFile(swgPath, body);
                await changeOperId(swgPath);
                await apiBuilder(config, swgPath);
            } else {
                throw new Error("can't fetch swagger.json from server");
            }
        } else {
            console.error(`can't find api.config.js file, please run "api-cli init" commander first, to get a initial config file`);
            process.exit(1);
           // throw new Error("can't find  api.config.js file , please run 'api-cli init' first");
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

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

module.exports = (...args) => {
    return build(...args).catch(err => {
        process.exit(1);
    })
}