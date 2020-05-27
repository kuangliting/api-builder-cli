const inquirer = require("inquirer");
const chalk = require("chalk");
const fse = require("fs-extra");
const path = require("path");
const apiBuilder = require("./apiBuilder");
let fetch = require("node-fetch");
let http = require("http");
let {
    changeOperId
} = require("./utils/formatSwagger");

async function build(args) {
    try {
        let cwd = process.cwd();
        let fPath = path.resolve(cwd, 'api.config.js');
        let config;

        if (fse.pathExistsSync(fPath)) {
            config = require(fPath);
        } else {
            await fse.copy(path.resolve(__dirname, './api.config.js'), fPath);
            console.log(chalk.green('√ 创建配置文件'), chalk.inverse(" api.config.js "), chalk.green('成功'));
            config = require(fPath);
        }
        
        let hostPath = args.host && args.host.trim() || config.apiHost && config.apiHost.trim();
        let swgPath = path.resolve(process.cwd(), ".swagger/swagger.json");
        let hasSwg = fse.pathExistsSync(swgPath);
        if (!hostPath&&!hasSwg) {
            console.log(chalk.yellow('× 未提供生成swagger.json的服务器地址'));
            process.exit(1);
        }
        let res
        try {
            res = await fetch(hostPath);
            if (res.ok) {
                let body = await res.text();
                await fse.outputFile(swgPath, body);
            }
        } catch (err) {
            if (hasSwg) {
                console.log(chalk.yellow('服务器地址无效，无法fetch最新swagger.json，将使用旧的swagger.json'));
            } else {
                console.log(chalk.red('请配置有效的swagger.json服务器地址'));
                process.exit(1);
            }
        }

        await changeOperId(swgPath);
        await apiBuilder(config, swgPath);
        
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = (args) => {
    return build(args).catch(err => {
        process.exit(1);
    })
}